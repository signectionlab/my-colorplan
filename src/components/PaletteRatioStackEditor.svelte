<script lang="ts">
  import {
    ACCENT_ROLE_MAX_PCT,
    ACCENT_ROLE_MIN_PCT,
    ACCENT_ROLE_TOTAL_PCT,
    MIN_PALETTE_RATIO_PCT,
    PRIMARY_ROLE_MAX_PCT,
    PRIMARY_ROLE_MIN_PCT,
    SECONDARY_ROLE_MAX_PCT,
    SECONDARY_ROLE_MIN_PCT,
    accentPartWidthPercentOfBar,
    roleForSlotRatio,
  } from '../domain/role-assignment'
  import { needsPickSwatchHairline } from '../domain/color-chip'

  export type AccentPart = { hex: string; label: string; barPct?: number }

  let {
    colors,
    ratios,
    roles,
    accentParts = [],
    accentSlotMaxPct = null,
    readonly = false,
    onchange,
  }: {
    colors: readonly { name: string; hex: string }[]
    ratios: readonly [number, number, number]
    roles: readonly [RoleName, RoleName, RoleName]
    accentParts?: readonly AccentPart[]
    /** pick 4~5: 3번 칸(강조) 합계 상한 */
    accentSlotMaxPct?: number | null
    readonly?: boolean
    onchange: (next: [number, number, number]) => void
  } = $props()

  const minPct = MIN_PALETTE_RATIO_PCT
  const showAccentSplit = $derived(accentParts.length > 1)
  const accentEachBarPct = $derived(
    accentPartWidthPercentOfBar(Math.max(1, accentParts.length || 1)),
  )

  let trackEl = $state<HTMLDivElement | null>(null)
  let dragging = $state<'b1' | 'b2' | null>(null)
  let dragRatios = $state<[number, number, number] | null>(null)
  /** b1 드래그 시 세 번째 칸 비율 고정 */
  let dragFixR0 = $state<number | null>(null)
  let dragFixR2 = $state<number | null>(null)

  const displayRatios = $derived(dragRatios ?? ratios)
  const b1Pct = $derived(displayRatios[0])
  const b2Pct = $derived(displayRatios[0] + displayRatios[1])
  const animating = $derived(dragging === null)
  function roleAtSlot(i: number): RoleName {
    return roleForSlotRatio(displayRatios[i])
  }

  function pointerPct(clientX: number): number {
    if (!trackEl) return 0
    const rect = trackEl.getBoundingClientRect()
    const raw = ((clientX - rect.left) / rect.width) * 100
    return Math.max(0, Math.min(100, raw))
  }

  function onHandleDown(which: 'b1' | 'b2', e: PointerEvent) {
    e.preventDefault()
    dragging = which
    dragRatios = [ratios[0], ratios[1], ratios[2]]
    dragFixR0 = ratios[0]
    dragFixR2 = ratios[2]
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onHandleMove(e: PointerEvent) {
    if (!dragging || !dragRatios) return
    const pct = pointerPct(e.clientX)
    const r = [...dragRatios] as [number, number, number]
    if (dragging === 'b1') {
      const r2 = dragFixR2 ?? ratios[2]
      const maxR0 = 100 - r2 - minPct
      const r0 = Math.round(Math.max(minPct, Math.min(maxR0, pct)))
      r[0] = r0
      r[1] = 100 - r2 - r0
      r[2] = r2
    } else {
      const r0 = dragFixR0 ?? ratios[0]
      const cumMin = r0 + minPct
      let cumMax = 100 - minPct
      if (accentSlotMaxPct != null) {
        cumMax = Math.min(cumMax, 100 - accentSlotMaxPct)
      }
      const cum = Math.round(Math.max(cumMin, Math.min(cumMax, pct)))
      r[0] = r0
      r[1] = cum - r0
      r[2] = 100 - cum
    }
    dragRatios = r
  }

  function onHandleUp(e: PointerEvent) {
    if (dragging && dragRatios) onchange(dragRatios)
    dragging = null
    dragRatios = null
    dragFixR0 = null
    dragFixR2 = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  function segmentLabel(i: number): string {
    const name = colors[i]?.name?.trim() || `색 ${i + 1}`
    return name.length > 10 ? `${name.slice(0, 9)}…` : name
  }
</script>

<div class="stack-wrap">
  <div
    class="stack-track"
    class:stack-track-live={!readonly && dragging !== null}
    class:stack-track-readonly={readonly}
    bind:this={trackEl}
    role="group"
    aria-label={readonly ? '4단계에서 만든 팔레트 비율' : '팔레트 색 비율. 경계를 드래그해 조절하세요.'}
    onpointermove={readonly ? undefined : onHandleMove}
  >
    {#each [0, 1, 2] as i}
      {@const w = displayRatios[i]}
      <div
        class="stack-seg"
        class:stack-seg-animate={animating}
        style:width="{w}%"
        style:background={colors[i]?.hex ?? '#ccc'}
        class:light={needsPickSwatchHairline(colors[i]?.hex ?? '#ccc')}
      >
        {#if i === 2 && showAccentSplit}
          <div class="accent-split-labels">
            {#each accentParts as part}
              {@const share = part.barPct ?? 0}
              {@const partRole = roleForSlotRatio(share)}
              <span
                class="accent-labeled-part color-chip color-chip--hairline-border"
                style:width="{displayRatios[2] > 0 && part.barPct != null ? (part.barPct / displayRatios[2]) * 100 : 0}%"
                style:background={part.hex}
                class:light={needsPickSwatchHairline(part.hex)}
                title="{part.label} · {share}% · {partRole}"
              >
                {#if share >= 8}
                  <span class="accent-part-role">{partRole}</span>
                  <span class="accent-part-pct tabular">{share % 1 === 0 ? share : share.toFixed(1)}%</span>
                {/if}
              </span>
            {/each}
          </div>
        {:else if w >= 12}
          <span class="stack-seg-role">{roleAtSlot(i)}</span>
          <span class="stack-seg-name">{segmentLabel(i)}</span>
          <span class="stack-seg-pct tabular">{Math.round(w)}%</span>
        {/if}
      </div>
    {/each}

    {#if !readonly}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="stack-handle"
      style:left="calc({b1Pct}% - 12px)"
      role="slider"
      aria-label="첫 번째와 두 번째 색 경계"
      aria-valuemin={minPct}
      aria-valuemax={100 - ratios[2] - minPct}
      aria-valuenow={Math.round(b1Pct)}
      tabindex="0"
      onpointerdown={(e) => onHandleDown('b1', e)}
      onpointermove={onHandleMove}
      onpointerup={onHandleUp}
      onpointercancel={onHandleUp}
      onlostpointercapture={onHandleUp}
    ></div>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="stack-handle"
      style:left="calc({b2Pct}% - 12px)"
      role="slider"
      aria-label="두 번째와 세 번째 색 경계"
      aria-valuemin={ratios[0] + minPct}
      aria-valuemax={100 - minPct}
      aria-valuenow={Math.round(b2Pct)}
      tabindex="0"
      onpointerdown={(e) => onHandleDown('b2', e)}
      onpointermove={onHandleMove}
      onpointerup={onHandleUp}
      onpointercancel={onHandleUp}
      onlostpointercapture={onHandleUp}
    ></div>
    {/if}
  </div>
  {#if !readonly}
  <p class="stack-hint caption caption-guide">
    막대에서 <strong>경계</strong>를 드래그하세요. 역할은 <strong>막대 전체 %</strong> 기준 — 주 {PRIMARY_ROLE_MIN_PCT}~{PRIMARY_ROLE_MAX_PCT}% · 보 {SECONDARY_ROLE_MIN_PCT}~{SECONDARY_ROLE_MAX_PCT}% · 강 {ACCENT_ROLE_MIN_PCT}~{ACCENT_ROLE_MAX_PCT}%
    {#if accentSlotMaxPct != null}
      (강조 합 {ACCENT_ROLE_TOTAL_PCT}%, {accentParts.length || 1}색 → 각 {accentEachBarPct % 1 === 0 ? accentEachBarPct : accentEachBarPct.toFixed(1)}%)
    {/if}
  </p>
  {/if}
</div>

<style>
  .stack-wrap {
    margin-bottom: 8px;
  }
  .stack-track {
    position: relative;
    display: flex;
    height: 72px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--hairline);
    touch-action: none;
    user-select: none;
  }
  .stack-track-live {
    cursor: ew-resize;
  }
  .stack-track-readonly {
    pointer-events: none;
  }
  .stack-seg {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    padding: 4px 6px;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
  .stack-seg.light {
    color: var(--ink);
    text-shadow: none;
  }
  .stack-seg-animate {
    transition: width 0.12s ease-out;
  }
  .stack-seg-role {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: -0.02em;
    opacity: 0.92;
  }
  .stack-seg-name {
    font-size: 12px;
    font-weight: 600;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stack-seg-pct {
    font-size: 15px;
    font-weight: 700;
  }
  .accent-split-labels {
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
  }
  .accent-labeled-part {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px 2px;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
  .accent-labeled-part.light {
    color: var(--ink);
    text-shadow: none;
  }
  .accent-part-role {
    font-size: 10px;
    font-weight: 700;
    line-height: 1.1;
  }
  .accent-part-pct {
    font-size: 13px;
    font-weight: 700;
  }
  .stack-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 24px;
    margin-left: 0;
    cursor: ew-resize;
    z-index: 2;
    background: linear-gradient(
      90deg,
      transparent 0,
      rgba(255, 255, 255, 0.55) 45%,
      rgba(255, 255, 255, 0.55) 55%,
      transparent 100%
    );
    border: none;
    padding: 0;
  }
  .stack-handle::after {
    content: '';
    position: absolute;
    top: 18%;
    bottom: 18%;
    left: 50%;
    width: 3px;
    transform: translateX(-50%);
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .stack-handle:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .stack-hint {
    margin: 10px 0 0;
  }
</style>
