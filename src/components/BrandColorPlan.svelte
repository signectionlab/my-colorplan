<script lang="ts">
  import {
    accentPlanSlotCount,
    brandColorPlanHasAssignments,
    brandImagePickKey,
    canAssignBrandPickToColorPlanSlot,
    pickByPlanKey,
    type BrandColorPlanSlot,
  } from '../domain/brand-image'
  import { imagePickLabel } from '../data/munsell-brand-image'
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import { BRAND_PLAN_RATIOS } from '../domain/ratio-calculation'
  import type { BrandImagePick, RoleName } from '../types/project'
  import {
    assignBrandPickToAccentSlot,
    assignBrandPickToRole,
    ensureBrandColorPlanRatios,
    resetBrandColorPlanSelections,
    store,
  } from '../state/project-state.svelte'

  const ROLES: RoleName[] = ['주조색', '보조색', '강조색']

  let {
    stepBadge = 'STEP 1 · 활동 2',
    heading = '색채계획하기',
    embedded = false,
    inset = false,
    readonly = false,
  }: {
    stepBadge?: string
    heading?: string
    /** 팔레트(4단계) 등 상위 제목이 있을 때 카드 헤더·STEP 뱃지 생략 */
    embedded?: boolean
    /** 상위 카드 안에 넣을 때 바깥 card·여백 중복 제거 */
    inset?: boolean
    /** 4단계: 1단계 계획 표시만, 배정 변경 불가 */
    readonly?: boolean
  } = $props()

  type ActiveSlot =
    | { kind: 'role'; index: 0 | 1 }
    | { kind: 'accent'; index: 0 | 1 | 2 }

  const brand = $derived(store.project.brand)
  const picks = $derived(brand.imagePicks)
  const palette = $derived(store.project.palette)
  const accentSlots = $derived(accentPlanSlotCount(brand))
  const multiAccent = $derived(accentSlots > 1)
  const accentKeys = $derived(brand.accentPlanPickKeys)
  const accentSlotIndices = $derived(Array.from({ length: accentSlots }, (_, i) => i as 0 | 1 | 2))

  let activeSlot = $state<ActiveSlot>({ kind: 'role', index: 0 })
  let chooserOpen = $state(true)

  $effect(() => {
    if (picks.length && !readonly) ensureBrandColorPlanRatios()
  })

  $effect(() => {
    if (activeSlot.kind === 'accent' && activeSlot.index >= accentSlots) {
      activeSlot = { kind: 'role', index: 0 }
    }
  })

  function pickForRole(index: 0 | 1) {
    const id = palette.colors[index].id
    return picks.find((p) => brandImagePickKey(p) === id)
  }

  function pickForAccentSlot(slot: 0 | 1 | 2) {
    return pickByPlanKey(brand, accentKeys[slot])
  }

  function segmentHex(index: 0 | 1): string | null {
    return pickForRole(index)?.hex ?? null
  }

  function accentHex(slot: 0 | 1 | 2): string | null {
    return pickForAccentSlot(slot)?.hex ?? null
  }

  function isActive(slot: ActiveSlot): boolean {
    if (!activeSlot) return false
    if (slot.kind !== activeSlot.kind) return false
    return slot.index === activeSlot.index
  }

  function toggleRole(index: 0 | 1) {
    activeSlot = { kind: 'role', index }
    chooserOpen = true
  }

  function toggleAccent(slot: 0 | 1 | 2) {
    if (slot >= accentSlots) return
    activeSlot = { kind: 'accent', index: slot }
    chooserOpen = true
  }

  function planSlotForActive(): BrandColorPlanSlot {
    if (activeSlot.kind === 'role') return { kind: 'role', index: activeSlot.index }
    return { kind: 'accent', index: activeSlot.index }
  }

  function isPickBlockedByPlan(pick: BrandImagePick): boolean {
    return !canAssignBrandPickToColorPlanSlot(brand, palette, planSlotForActive(), pick)
  }

  function choosePick(pick: BrandImagePick) {
    if (isPickBlockedByPlan(pick)) return
    if (activeSlot.kind === 'role') {
      assignBrandPickToRole(activeSlot.index, pick)
    } else {
      assignBrandPickToAccentSlot(activeSlot.index, pick)
    }
  }

  function chooserLabel(): string {
    if (activeSlot.kind === 'role') return `${ROLES[activeSlot.index]}에 사용할 색을 선택하세요`
    if (accentSlots > 1) return `강조색(${activeSlot.index + 1})에 사용할 색을 선택하세요`
    return '강조색에 사용할 색을 선택하세요'
  }

  function isPickSelected(pick: BrandImagePick): boolean {
    const key = brandImagePickKey(pick)
    if (activeSlot.kind === 'role') {
      return palette.colors[activeSlot.index].id === key
    }
    return accentKeys[activeSlot.index] === key
  }

  const activeRoleLabel = $derived.by(() => {
    if (activeSlot.kind === 'role') {
      return `${ROLES[activeSlot.index]} ${BRAND_PLAN_RATIOS[activeSlot.index]}%`
    }
    if (accentSlots > 1) {
      return `강조색 ${activeSlot.index + 1} ${BRAND_PLAN_RATIOS[2]}%`
    }
    return `강조색 ${BRAND_PLAN_RATIOS[2]}%`
  })

  const activeRoleInSentence = $derived.by(() => {
    if (activeSlot.kind === 'role') {
      return `${ROLES[activeSlot.index]}(${BRAND_PLAN_RATIOS[activeSlot.index]}%)`
    }
    if (accentSlots > 1) {
      return `강조색 ${activeSlot.index + 1}(${BRAND_PLAN_RATIOS[2]}%)`
    }
    return `강조색(${BRAND_PLAN_RATIOS[2]}%)`
  })

  type PlanRoleHighlight = 'primary' | 'secondary' | 'accent'

  const activePlanRole = $derived.by((): PlanRoleHighlight => {
    if (activeSlot.kind === 'role') {
      return activeSlot.index === 0 ? 'primary' : 'secondary'
    }
    return 'accent'
  })

  const planHasAssignments = $derived(brandColorPlanHasAssignments(brand, palette))

  function resetAllPlanSelections() {
    resetBrandColorPlanSelections()
    activeSlot = { kind: 'role', index: 0 }
    chooserOpen = true
  }
</script>

<section
  class="plan"
  class:card={!embedded && !inset}
  class:plan-inset={inset}
  class:plan-embedded={embedded}
  class:plan-readonly={readonly}
  aria-labelledby="brand-color-plan-heading"
>
  {#if !embedded}
  <header class="step-head">
    <p class="step-badge">{stepBadge}</p>
    <div class="step-head-row">
      <h3 id="brand-color-plan-heading">{heading}</h3>
      <button
        type="button"
        class="btn btn-ghost plan-reset-btn"
        disabled={!planHasAssignments}
        onclick={resetAllPlanSelections}
      >
        전부 다시선택
      </button>
    </div>
    <div class="plan-message lede-step">
      <p class="plan-message-line">
        지금 「{activeRoleInSentence}」에 넣을 색을 고르세요.
        <span class="plan-role-shade">{activeRoleLabel}</span>
      </p>
      <p class="plan-message-line">
        게이지에서 역할(
        <span class="plan-role-token" class:plan-role-shade={activePlanRole === 'primary'}>주조 70%</span>·<span
          class="plan-role-token"
          class:plan-role-shade={activePlanRole === 'secondary'}>보조 20%</span>·<span
          class="plan-role-token"
          class:plan-role-shade={activePlanRole === 'accent'}>강조 10%</span>
        )을 바꾼 뒤, 색 선택 속성에서 색을 지정하면 됩니다.
      </p>
      {#if accentSlots === 2}
        <p class="plan-message-line">색 4개 선택 시 강조색은 2가지까지 지정할 수 있어요.</p>
      {:else if accentSlots === 3}
        <p class="plan-message-line">색 5개 선택 시 강조색은 3가지까지 지정할 수 있어요.</p>
      {/if}
    </div>
  </header>
  {:else if !readonly}
  <div class="plan-embedded-toolbar">
    <h3 id="brand-color-plan-heading" class="sr-only">{heading}</h3>
    <button
      type="button"
      class="btn btn-ghost plan-reset-btn"
      disabled={!planHasAssignments}
      onclick={resetAllPlanSelections}
    >
      역할 배정 전부 다시선택
    </button>
  </div>
  {:else}
  <h3 id="brand-color-plan-heading" class="sr-only">{heading}</h3>
  {/if}

  <div class="plan-gauge" role="group" aria-label="주조색 70%, 보조색 20%, 강조색 10%">
    {#each [0, 1] as i}
      {@const idx = i as 0 | 1}
      {@const hex = segmentHex(idx)}
      {@const ratio = BRAND_PLAN_RATIOS[i]}
      {#if readonly}
        <div
          class="plan-segment"
          class:filled={Boolean(hex)}
          style:width="{ratio}%"
          style:--seg-fill={hex ?? 'transparent'}
          role="img"
          aria-label="{ROLES[i]} {ratio}% {hex ? '색 지정됨' : '미지정'}"
        >
          <span class="plan-segment-inner">
            <span class="plan-segment-role">{ROLES[i]}</span>
            <span class="plan-segment-pct">{ratio}%</span>
          </span>
        </div>
      {:else}
        <button
          type="button"
          class="plan-segment"
          class:active={isActive({ kind: 'role', index: idx })}
          class:filled={Boolean(hex)}
          style:width="{ratio}%"
          style:--seg-fill={hex ?? 'transparent'}
          aria-pressed={isActive({ kind: 'role', index: idx })}
          aria-label="{ROLES[i]} {ratio}% {hex ? '색 지정됨' : '색 선택 대기'}"
          onclick={() => toggleRole(idx)}
        >
          <span class="plan-segment-inner">
            <span class="plan-segment-role">{ROLES[i]}</span>
            <span class="plan-segment-pct">{ratio}%</span>
          </span>
        </button>
      {/if}
    {/each}

    <div class="plan-segment accent-wrap" style:width="{BRAND_PLAN_RATIOS[2]}%">
      {#if multiAccent}
        <div class="accent-split" role="group" aria-label="강조색 10%, {accentSlots}가지">
          {#each accentSlotIndices as s (s)}
            {@const hex = accentHex(s)}
            {#if readonly}
              <div
                class="accent-part"
                class:filled={Boolean(hex)}
                style:--seg-fill={hex ?? 'transparent'}
                role="img"
                aria-label="강조색 {s + 1} {hex ? '색 지정됨' : '미지정'}"
              >
                <span class="plan-segment-inner accent-inner">
                  <span class="plan-segment-role">강조{s + 1}</span>
                </span>
              </div>
            {:else}
              <button
                type="button"
                class="accent-part"
                class:active={isActive({ kind: 'accent', index: s })}
                class:filled={Boolean(hex)}
                style:--seg-fill={hex ?? 'transparent'}
                aria-pressed={isActive({ kind: 'accent', index: s })}
                aria-label="강조색 {s + 1} {hex ? '색 지정됨' : '색 선택 대기'}"
                onclick={() => toggleAccent(s)}
              >
                <span class="plan-segment-inner accent-inner">
                  <span class="plan-segment-role">강조{s + 1}</span>
                </span>
              </button>
            {/if}
          {/each}
        </div>
        <span class="accent-wrap-label">강조색 10%</span>
      {:else}
        {@const hex = accentHex(0)}
        {#if readonly}
          <div
            class="accent-single"
            class:filled={Boolean(hex)}
            style:--seg-fill={hex ?? 'transparent'}
            role="img"
            aria-label="강조색 10% {hex ? '색 지정됨' : '미지정'}"
          >
            <span class="plan-segment-inner">
              <span class="plan-segment-role">강조색</span>
              <span class="plan-segment-pct">10%</span>
            </span>
          </div>
        {:else}
          <button
            type="button"
            class="accent-single"
            class:active={isActive({ kind: 'accent', index: 0 })}
            class:filled={Boolean(hex)}
            style:--seg-fill={hex ?? 'transparent'}
            aria-pressed={isActive({ kind: 'accent', index: 0 })}
            aria-label="강조색 10% {hex ? '색 지정됨' : '색 선택 대기'}"
            onclick={() => toggleAccent(0)}
          >
            <span class="plan-segment-inner">
              <span class="plan-segment-role">강조색</span>
              <span class="plan-segment-pct">10%</span>
            </span>
          </button>
        {/if}
      {/if}
    </div>
  </div>

  {#if !readonly}
  <details class="pick-chooser-details" bind:open={chooserOpen}>
    <summary class="pick-chooser-summary">색 선택 속성</summary>
    <div class="pick-chooser" role="listbox" aria-label={chooserLabel()}>
      <div class="pick-chooser-row">
        {#each picks as pick (brandImagePickKey(pick))}
          <button
            type="button"
            class="pick-chip"
            class:pick-chip-blocked={isPickBlockedByPlan(pick)}
            role="option"
            aria-selected={isPickSelected(pick)}
            aria-disabled={isPickBlockedByPlan(pick)}
            disabled={isPickBlockedByPlan(pick)}
            title={isPickBlockedByPlan(pick) ? '다른 역할·강조 칸에 이미 지정된 색입니다' : undefined}
            onclick={() => choosePick(pick)}
          >
            <span
              class="pick-chip-swatch color-chip color-chip--hairline-border"
              style:background={pick.hex}
              class:light={needsPickSwatchHairline(pick.hex)}
            ></span>
            <span class="pick-chip-label">{imagePickLabel(pick.hueId, pick.toneId, pick.hex)}</span>
          </button>
        {/each}
      </div>
    </div>
  </details>
  {/if}
</section>

<style>
  .plan {
    padding: 24px;
    margin-bottom: 24px;
    background: var(--canvas-soft);
  }
  .plan.plan-inset {
    margin-bottom: 0;
    background: transparent;
  }
  .step-head {
    margin-bottom: 20px;
  }
  .step-head-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
    margin-bottom: 6px;
  }
  .step-head-row h3 {
    margin: 0;
  }
  .plan-reset-btn {
    position: relative;
    font-size: 13px;
    padding: 4px 2px 6px;
    flex-shrink: 0;
    border-radius: 0;
    text-decoration: underline;
    text-decoration-color: rgba(83, 58, 253, 0.45);
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
  }
  .plan-reset-btn:hover:not(:disabled) {
    color: var(--primary);
    text-decoration-color: var(--primary);
    text-decoration-thickness: 2px;
  }
  .plan-reset-btn:disabled {
    text-decoration-color: var(--hairline);
  }
  .step-head-row h3 {
    font-size: 1.05rem;
    font-weight: 600;
  }
  .lede-step {
    margin: 0;
    color: var(--ink-mute);
    font-size: 15px;
    line-height: 1.5;
  }
  .plan-message {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .plan-message-line {
    margin: 0;
  }
  .plan-role-shade {
    display: inline-block;
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: rgba(83, 58, 253, 0.12);
    color: var(--ink);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    vertical-align: baseline;
  }
  .plan-role-token {
    white-space: nowrap;
  }
  .plan-gauge {
    display: flex;
    width: 100%;
    min-height: 56px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--hairline);
    background: #fff;
  }
  .plan-segment {
    position: relative;
    flex: 0 0 auto;
    min-width: 0;
    padding: 0;
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.35);
    background: var(--seg-fill);
    cursor: pointer;
    transition:
      box-shadow 0.15s ease,
      outline-color 0.15s ease;
  }
  .plan-segment:last-child {
    border-right: none;
  }
  .plan-segment:not(.filled) {
    background: repeating-linear-gradient(
      -45deg,
      var(--canvas-soft),
      var(--canvas-soft) 8px,
      #fff 8px,
      #fff 16px
    );
  }
  .plan-segment.filled {
    background: var(--seg-fill);
  }
  .plan-segment.active {
    outline: 3px solid var(--primary);
    outline-offset: -3px;
    z-index: 1;
  }
  .plan-segment:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: -3px;
    z-index: 1;
  }
  .accent-wrap {
    position: relative;
    display: flex;
    padding: 0;
    border-right: none;
    background: #fff;
  }
  .accent-split {
    display: flex;
    width: 100%;
    min-height: 56px;
  }
  .accent-part,
  .accent-single {
    flex: 1 1 0;
    min-width: 0;
    padding: 0;
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.35);
    cursor: pointer;
    background: var(--seg-fill);
  }
  .accent-part:last-child {
    border-right: none;
  }
  .accent-part:not(.filled),
  .accent-single:not(.filled) {
    background: repeating-linear-gradient(
      -45deg,
      var(--canvas-soft),
      var(--canvas-soft) 8px,
      #fff 8px,
      #fff 16px
    );
  }
  .accent-part.filled,
  .accent-single.filled {
    background: var(--seg-fill);
  }
  .accent-part.active,
  .accent-single.active {
    outline: 3px solid var(--primary);
    outline-offset: -3px;
    z-index: 1;
  }
  .accent-part:focus-visible,
  .accent-single:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: -3px;
    z-index: 1;
  }
  .accent-wrap-label {
    position: absolute;
    left: 50%;
    bottom: 3px;
    transform: translateX(-50%);
    font-size: 9px;
    font-weight: 600;
    color: var(--ink-mute);
    pointer-events: none;
    white-space: nowrap;
  }
  .accent-inner {
    min-height: 48px;
    padding-bottom: 12px;
  }
  .plan-segment-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: 56px;
    padding: 6px 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    color: var(--ink);
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.85);
  }
  .plan-segment:not(.filled) .plan-segment-inner,
  .accent-part:not(.filled) .plan-segment-inner,
  .accent-single:not(.filled) .plan-segment-inner {
    color: var(--ink-mute);
    text-shadow: none;
  }
  .plan-segment-pct {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.9;
  }
  .pick-chooser-details {
    margin-top: 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
    overflow: hidden;
  }
  .pick-chooser-summary {
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    list-style: none;
  }
  .pick-chooser-summary::-webkit-details-marker {
    display: none;
  }
  .pick-chooser {
    padding: 0 14px 14px;
  }
  .pick-chooser-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pick-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-pill);
    background: #fff;
    font-size: 13px;
    font-weight: 500;
  }
  .pick-chip:hover:not(:disabled) {
    border-color: var(--primary);
    background: #f8f6ff;
  }
  .pick-chip-blocked:not([aria-selected='true']) {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pick-chip:disabled {
    pointer-events: none;
  }
  .pick-chip:focus-visible {
    outline: 2px solid rgba(83, 58, 253, 0.35);
    outline-offset: 2px;
  }
  .pick-chip-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    flex-shrink: 0;
  }
  .pick-chip-label {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .plan-embedded {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }
  .plan-embedded-toolbar {
    display: flex;
    justify-content: flex-end;
    margin: 0 0 12px;
  }
  .plan-readonly .plan-segment,
  .plan-readonly .accent-part,
  .plan-readonly .accent-single {
    cursor: default;
  }
</style>
