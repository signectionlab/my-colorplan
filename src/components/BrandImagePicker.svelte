<script lang="ts">
  import {
    MUNSELL_HUES,
    tonesForHue,
    toneDefById,
    hueById,
    isLightChip,
    NEUTRAL_HUE_ID,
    neutralStepsForAnchor,
    neutralPickColorName,
    neutralValueLevel,
    type AchromaticAnchor,
    type NeutralValueStep,
  } from '../data/munsell-brand-image'
  import {
    BRAND_IMAGE_PICK_MIN,
    BRAND_IMAGE_PICK_MAX,
    canAddBrandImagePick,
    canExpandBrandImageSlots,
    effectiveImagePickSlotCount,
    showImagePickDecisionSlot,
  } from '../domain/brand-image'
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import {
    store,
    addBrandImagePick,
    removeBrandImagePick,
    expandBrandImagePickSlot,
    finishBrandImageAdding,
  } from '../state/project-state.svelte'

  const chromatic = MUNSELL_HUES.filter((h) => h.group === 'chromatic')
  const achroAnchors = MUNSELL_HUES.filter((h) => h.id === 'Wh' || h.id === 'Bk')

  let selectedHueId = $state<string | null>(null)
  let selectedToneId = $state<string | null>(null)
  let achromaticAnchor = $state<AchromaticAnchor | null>(null)
  let pickMessage = $state('')

  const brand = $derived(store.project.brand)
  const pickCount = $derived(brand.imagePicks.length)
  const slotCount = $derived(effectiveImagePickSlotCount(brand))
  const addingDone = $derived(brand.imagePickAddingDone)
  const canAddPick = $derived(canAddBrandImagePick(brand))
  const showDecisionSlot = $derived(showImagePickDecisionSlot(brand))

  const tones = $derived.by(() => {
    if (!selectedHueId) return []
    const hue = hueById(selectedHueId)
    return hue?.group === 'chromatic' ? tonesForHue(hue) : []
  })
  const focusedTone = $derived(
    selectedToneId && tones.length ? tones.find((tone) => tone.id === selectedToneId) : null,
  )
  const neutralSteps = $derived(achromaticAnchor ? neutralStepsForAnchor(achromaticAnchor) : [])

  function selectHue(id: string) {
    pickMessage = ''
    const hue = hueById(id)
    if (!hue || hue.group !== 'chromatic') return
    achromaticAnchor = null
    if (selectedHueId === id) {
      selectedHueId = null
      selectedToneId = null
      return
    }
    selectedHueId = id
    selectedToneId = null
  }

  function selectAchromaticAnchor(anchor: AchromaticAnchor) {
    pickMessage = ''
    achromaticAnchor = anchor
    selectedHueId = null
    selectedToneId = null
  }

  function selectNeutralStep(step: NeutralValueStep) {
    if (!achromaticAnchor) return
    if (!canAddPick) {
      pickMessage = pickSlotMessage()
      return
    }
    pickMessage = ''
    commitPick({ hueId: NEUTRAL_HUE_ID, toneId: step.label, hex: step.hex })
  }

  function previewTone(toneId: string) {
    if (!selectedHueId) return
    pickMessage = ''
    selectedToneId = toneId
  }

  function toneForConfirm() {
    if (!selectedHueId || !tones.length) return null
    if (selectedToneId) {
      return tones.find((tone) => tone.id === selectedToneId) ?? tones[0]
    }
    return tones[0]
  }

  function confirmTonePick() {
    const tone = toneForConfirm()
    if (!selectedHueId || !tone) return
    if (!canAddPick) {
      pickMessage = pickSlotMessage()
      return
    }
    pickMessage = ''
    commitPick({ hueId: selectedHueId, toneId: tone.id, hex: tone.hex })
    selectedToneId = null
    selectedHueId = null
  }

  function pickSlotMessage(): string {
    const b = store.project.brand
    if (b.imagePickAddingDone) return '색 추가를 마쳤어요. 더 담으려면 「색 추가」를 다시 눌러 주세요.'
    if (b.imagePicks.length >= BRAND_IMAGE_PICK_MAX) return `최대 ${BRAND_IMAGE_PICK_MAX}개까지 선택할 수 있어요.`
    if (b.imagePicks.length >= b.imagePickSlotCount) {
      return '다음 색을 담으려면 선택 결과에서 「색 추가」를 눌러 칸을 열어 주세요.'
    }
    return `최대 ${BRAND_IMAGE_PICK_MAX}개까지 선택할 수 있어요.`
  }

  function commitPick(pick: { hueId: string; toneId: string; hex: string }) {
    const result = addBrandImagePick(pick)
    if (result.ok) return
    if (result.reason === 'duplicate') pickMessage = '이미 담은 색·톤입니다.'
    if (result.reason === 'max') pickMessage = `최대 ${BRAND_IMAGE_PICK_MAX}개까지 선택할 수 있어요.`
    if (result.reason === 'slot' || result.reason === 'closed') pickMessage = pickSlotMessage()
  }

  function onExpandSlot() {
    pickMessage = ''
    if (expandBrandImagePickSlot()) return
    pickMessage = '지금은 칸을 더 열 수 없어요. 현재 칸을 모두 채운 뒤 다시 시도해 주세요.'
  }

  function onFinishAdding() {
    pickMessage = ''
    if (finishBrandImageAdding()) return
    pickMessage = `색을 ${BRAND_IMAGE_PICK_MIN}개 채운 뒤 나타나는 칸에서 「더 이상 선택 안함」을 눌러 주세요.`
  }

  function toneMeta(toneId: string) {
    return toneDefById(toneId)
  }

</script>

<section class="picker card" aria-labelledby="brand-picks-heading">
  <div class="result" aria-labelledby="brand-picks-heading" aria-live="polite">
    <header class="result-head">
      <p class="step-badge">STEP 1 · 활동 1</p>
      <div class="result-head-row">
        <h3 id="brand-picks-heading">내가 선택한 색</h3>
        <p class="result-meta" aria-live="polite">
          <span class="slot-count">{pickCount}개</span>
          {#if addingDone}
            <span class="adding-done-badge">추가 완료</span>
          {/if}
        </p>
      </div>
      <p class="result-lede">선택한 색을 슬롯으로 확인해보세요</p>
    </header>
    <details class="result-tip">
      <summary class="result-tip-summary">
        <span class="result-tip-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2a6.5 6.5 0 0 0-3.8 11.8V16a1 1 0 0 0 1 1h5.6a1 1 0 0 0 1-1v-2.2A6.5 6.5 0 0 0 12 2Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M12 2a6.5 6.5 0 0 0-3.8 11.8V16a1 1 0 0 0 1 1h5.6a1 1 0 0 0 1-1v-2.2A6.5 6.5 0 0 0 12 2Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path d="M9 18h6M10 22h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span id="brand-picks-tip-title" class="result-tip-summary-text">색 선택 방법 안내</span>
        <span class="result-tip-chevron" aria-hidden="true"></span>
      </summary>
      <div class="result-tip-panel">
        <p class="result-tip-body">
          1. 먼저 가장 표현하고 싶은 분위기를 생각해 보세요. 따뜻함, 신뢰감, 활기 등 원하는 느낌을 떠올리면 색을 고르기
          쉬워집니다.
        </p>
        <p class="result-tip-subhead">2.슬롯에 색 추가 방법</p>
        <p class="result-tip-body">
          기본 {BRAND_IMAGE_PICK_MIN}칸 ~ 최대 {BRAND_IMAGE_PICK_MAX}개 까지 채울 수 있어요. <br>{BRAND_IMAGE_PICK_MIN}개를 채우면 다음 칸에서 <b>「색
          추가」</b> 또는 <b>「더 이상 선택 안함」</b>선택하여 색을 추가할 수 있어요. (색이 많을수록 배색 난이도는 올라갑니다.)
        </p>
      </div>
    </details>
  </div>

  <div class="picked-row result-slots-sticky" aria-label="선택한 색 슬롯" aria-live="polite">
    <ul class="picked-list">
        {#each { length: slotCount } as _, slotIndex}
          {@const pick = brand.imagePicks[slotIndex]}
        {#if pick}
          {@const hue = hueById(pick.hueId)}
          {@const tone = toneMeta(pick.toneId)}
          {@const neutralLevel =
            pick.hueId === NEUTRAL_HUE_ID ? neutralValueLevel(pick.toneId) : undefined}
          {@const neutralColorName =
            pick.hueId === NEUTRAL_HUE_ID ? neutralPickColorName(pick.toneId) : undefined}
          <li class="result-card filled">
            <span class="slot-badge" aria-hidden="true">{slotIndex + 1}</span>
            <div class="result-swatch-wrap">
              <div
                class="result-swatch color-chip color-chip--hairline-border"
                style:background={pick.hex}
                class:light={needsPickSwatchHairline(pick.hex)}
                title={pick.hex}
              ></div>
            </div>
            <div class="result-card-body">
              <table class="result-table">
                <tbody>
                  {#if pick.hueId === NEUTRAL_HUE_ID}
                    <tr>
                      <td>색명</td>
                      <td>{neutralColorName ?? '—'}</td>
                    </tr>
                    <tr>
                      <td>톤</td>
                      <td>
                        {#if neutralLevel !== undefined}
                          {neutralLevel}단계 ·
                        {/if}
                        {pick.toneId}
                      </td>
                    </tr>
                  {:else}
                    <tr>
                      <td>색명</td>
                      <td>
                        {hue?.name ?? '—'}
                        {#if hue?.code}
                          <span class="result-hue-code"> ({hue.code})</span>
                        {/if}
                      </td>
                    </tr>
                    {#if hue?.group === 'chromatic' && tone}
                      <tr>
                        <td>톤</td>
                        <td>{tone.english} ({tone.nameKo})</td>
                      </tr>
                    {/if}
                  {/if}
                  <tr>
                    <td>HEX</td>
                    <td class="tabular">{pick.hex.toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="result-card-footer">
              <button type="button" class="btn remove" onclick={() => removeBrandImagePick(slotIndex)}>빼기</button>
            </div>
          </li>
        {:else}
          <li class="result-card empty" aria-label="빈 슬롯 {slotIndex + 1}">
            <span class="slot-badge muted" aria-hidden="true">{slotIndex + 1}</span>
            <div class="result-swatch-wrap">
              <div class="empty-swatch" aria-hidden="true"></div>
            </div>
            <div class="result-card-body">
              <p class="empty-hint">아래에서 색·톤을 선택하세요</p>
            </div>
            <div class="result-card-footer result-card-footer--spacer" aria-hidden="true"></div>
          </li>
        {/if}
        {/each}
        {#if showDecisionSlot}
          <li class="result-card empty decision-slot" aria-label="색 추가 또는 선택 완료">
            <span class="slot-badge muted" aria-hidden="true">{slotCount + 1}</span>
            <div class="result-swatch-wrap">
              <div class="empty-swatch" aria-hidden="true"></div>
            </div>
            <div class="result-card-body">
              <p class="empty-hint">색을 더 담을까요?</p>
            </div>
            <div class="result-card-footer decision-footer">
              <button type="button" class="btn slot-add-in-card" onclick={onExpandSlot}>색 추가</button>
              <button type="button" class="btn slot-finish-in-card" onclick={onFinishAdding}>
                더 이상 선택 안함
              </button>
            </div>
          </li>
        {/if}
    </ul>
  </div>

  <div class="hue-section-head">
    <p class="subhead">유채색</p>
    <p class="hue-section-caption caption caption-guide" role="note">
      KS 산업규격 먼셀 10색상환·KS기본색명 기준
    </p>
  </div>
  <div class="hue-grid chromatic" role="group" aria-label="유채색 10색">
    {#each chromatic as hue}
      {@const selected = selectedHueId === hue.id}
      {@const hueTones = selected ? tonesForHue(hue) : []}
      <div class="hue-cell">
        <button
          type="button"
          class="chip color-chip hue-chip"
          class:selected
          class:light={needsPickSwatchHairline(hue.hex)}
          class:light-ink={isLightChip(hue.hex)}
          style:background={hue.hex}
          aria-pressed={selected}
          aria-expanded={selected}
          aria-label="{hue.name} {hue.code}"
          onclick={() => selectHue(hue.id)}
        >
          <span class="chip-initial" aria-hidden="true">{hue.code}</span>
        </button>
        <span class="chip-caption">{hue.name} ({hue.code})</span>
      </div>
      {#if selected}
        <div class="hue-tone-panel" aria-labelledby="step2-heading-{hue.id}">
          <header class="tone-panel-head">
            <h4 id="step2-heading-{hue.id}">색상의 톤을 선택해 주세요</h4>
            <p class="lede-step tone-panel-lede">선택한 색상이 어떤 느낌으로 전달되기를 원하시나요?</p>
            <p class="selected-pill" role="status">
              <span class="dot" style:background={hue.hex}></span>
              {hue.name}({hue.code}) 기준
            </p>
          </header>

          <div class="tone-focus-preview" aria-live="polite">
            <div
              class="tone-focus-swatch color-chip color-chip--hairline-border"
              class:light={needsPickSwatchHairline(focusedTone?.hex ?? hue.hex)}
              style:background={focusedTone?.hex ?? hue.hex}
            ></div>
            <div class="tone-focus-copy">
              {#if focusedTone}
                <p class="tone-focus-title">
                  <strong>{focusedTone.abbrev}</strong> · {focusedTone.nameKo}
                  <span class="tone-focus-en">({focusedTone.english})</span>
                </p>
                <p class="tone-focus-hex tabular">{(focusedTone.hex ?? hue.hex).toUpperCase()}</p>
              {:else}
                <p class="tone-focus-title">톤 미리보기</p>
                <p class="tone-focus-hint caption caption-guide">아래 카드에서 톤을 눌러 비교한 뒤, 마음에 들면 최종선택을 눌러 주세요.</p>
              {/if}
              <button
                type="button"
                class="btn tone-confirm"
                disabled={!canAddPick || !selectedToneId}
                onclick={confirmTonePick}
              >
                최종선택
              </button>
            </div>
          </div>

          <div class="tone-card-grid" role="radiogroup" aria-labelledby="step2-heading-{hue.id}">
            {#each hueTones as tone}
              {@const active = selectedToneId === tone.id}
              <button
                type="button"
                class="tone-card"
                class:selected={active}
                role="radio"
                aria-checked={active}
                aria-label="{tone.english}, {tone.nameKo}"
                onclick={() => previewTone(tone.id)}
              >
                <div
                  class="tone-card-swatch color-chip"
                  class:light={needsPickSwatchHairline(tone.hex)}
                  class:light-ink={isLightChip(tone.hex)}
                  style:background={tone.hex}
                >
                  <span class="tone-abbr-in-chip" aria-hidden="true">{tone.abbrev}</span>
                  {#if active}
                    <span class="tone-card-check" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  {/if}
                </div>
                <div class="tone-card-meta">
                  <span class="tone-en">{tone.english}</span>
                  <span class="tone-ko">{tone.nameKo}</span>
                </div>
              </button>
            {/each}
          </div>
          <p class="tone-note">톤 색상은 KS 기본 색조를 참고한 UI 근사값이며, KS 인증 색값·정식 먼셀 측색 측정값이 아닙니다.</p>
          {#if !canAddPick && pickCount >= BRAND_IMAGE_PICK_MAX}
            <p class="pick-message">최대 {BRAND_IMAGE_PICK_MAX}개를 모두 담았습니다. 바꾸려면 위 선택 결과에서 빼 주세요.</p>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <div class="achromatic-wrap">
    <p class="subhead">무채색 · 명도</p>
    <p class="achro-lede caption caption-guide">하양 또는 검정을 고른 뒤, 나타나는 명도 단계에서 하나를 선택하세요.</p>

    <div class="achro-anchor-grid" role="group" aria-label="무채색 기준">
      {#each achroAnchors as hue}
        {@const selected = achromaticAnchor === hue.id}
        <div class="hue-cell wide">
          <button
            type="button"
            class="chip color-chip achro-chip"
            class:achro-wh={hue.id === 'Wh'}
            class:selected
            class:light={needsPickSwatchHairline(hue.hex)}
            class:light-ink={isLightChip(hue.hex)}
            style:background={hue.hex}
            aria-pressed={selected}
            aria-label="{hue.name} {hue.code}"
            onclick={() => selectAchromaticAnchor(hue.id as AchromaticAnchor)}
          >
            <span class="chip-initial" aria-hidden="true">{hue.code}</span>
          </button>
          <span class="chip-caption">{hue.name} ({hue.code})</span>
        </div>
      {/each}
    </div>

    {#if achromaticAnchor}
      <div class="value-scale" aria-label="명도 단계 선택">
        <p class="value-scale-label">
          {achromaticAnchor === 'Wh' ? '하양 → 검정' : '검정 → 하양'} (10단계)
        </p>
        <div class="value-scale-bar" role="listbox" aria-label="명도 단계">
          {#each neutralSteps as step}
            <button
              type="button"
              role="option"
              class="value-step color-chip"
              class:light={needsPickSwatchHairline(step.hex)}
              class:light-ink={isLightChip(step.hex)}
              style:background={step.hex}
              aria-label="명도 {step.label}"
              onclick={() => selectNeutralStep(step)}
            >
              <span class="value-step-label">
                {step.label}
                {#if step.grayName}
                  <span class="value-step-gray">{step.grayName}</span>
                {/if}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if pickMessage}
    <p class="pick-message" role="status">{pickMessage}</p>
  {/if}
</section>

<style>
  .picker {
    --brand-chip-aspect: 25 / 16;
    --brand-chip-min-h: 36px;
    --brand-chip-radius: 14px;
    --brand-chip-gap: 12px 10px;
    --tone-chip-aspect: 125 / 24;
    --tone-chip-min-h: 11px;
    --result-slot-w: 152px;
    padding: 24px;
    margin-bottom: 24px;
    background: var(--canvas-soft);
  }
  .hue-tone-panel {
    grid-column: 1 / -1;
    margin: 4px 0 12px;
    padding: 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: var(--surface, #f8fafc);
  }
  .tone-panel-head {
    margin-bottom: 16px;
  }
  .tone-panel-head h4 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }
  .tone-panel-lede {
    margin: 0 0 10px;
  }
  h3 { margin-bottom: 6px; }
  h4 { margin: 0 0 10px; font-size: 1.05rem; font-weight: 600; }
  .lede-step { color: var(--ink-mute); font-size: 15px; line-height: 1.5; }
  .pick-message {
    margin: 12px 0 0;
    font-size: 13px;
    color: var(--primary-press);
    line-height: 1.45;
  }
  .hue-section-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 12px;
    margin-bottom: 12px;
  }
  .hue-section-head .subhead {
    margin: 0;
  }
  .hue-section-caption {
    margin: 0;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--step-accent-soft, #f0eeff);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.35;
  }
  .subhead {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--ink);
  }
  .hue-grid {
    display: grid;
    gap: var(--brand-chip-gap);
    margin-bottom: 24px;
  }
  .hue-grid.chromatic {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .achromatic-wrap {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
  }
  .achro-lede {
    margin: 0 0 14px;
  }
  .achro-anchor-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--brand-chip-gap);
    max-width: 360px;
    margin-bottom: 4px;
  }
  .achromatic-wrap .value-scale {
    margin-top: 14px;
    width: 100%;
  }
  .value-scale-label {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }
  .value-scale-bar {
    display: flex;
    width: 100%;
    min-height: 44px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--hairline);
  }
  .value-step {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 2px;
    border: none;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
    font: inherit;
  }
  .value-step:last-child {
    border-right: none;
  }
  .value-step:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
    z-index: 1;
  }
  .value-step:hover {
    filter: brightness(0.96);
  }
  .value-step-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    color: #fff;
    word-break: keep-all;
  }
  .value-step-gray {
    font-size: 9px;
    font-weight: 500;
    line-height: 1.2;
    opacity: 0.95;
  }
  .value-step.light-ink .value-step-label {
    color: var(--ink);
  }
  @media (min-width: 640px) {
    .value-step-label { font-size: 12px; }
  }
  @media (max-width: 520px) {
    .hue-grid.chromatic { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .hue-cell {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .chip {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    border-radius: var(--brand-chip-radius);
    padding: 0;
    width: 100%;
    cursor: pointer;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .chip-initial {
    font-size: clamp(1.35rem, 5vw, 1.85rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    pointer-events: none;
    user-select: none;
  }
  .chip.light-ink .chip-initial {
    color: var(--ink);
    text-shadow: none;
  }
  .chip:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
  .hue-chip,
  .achro-chip {
    width: 100%;
    min-height: 72px;
    height: 72px;
  }
  .chip.selected {
    border-color: #fff;
    box-shadow: 0 0 0 2px var(--ink), 0 4px 14px rgba(13, 37, 61, 0.18);
  }
  .chip.light-ink.selected {
    border-color: var(--ink);
    box-shadow: 0 0 0 2px var(--ink), 0 4px 14px rgba(13, 37, 61, 0.12);
  }
  .chip-caption {
    font-size: 13px;
    text-align: center;
    color: var(--ink);
    line-height: 1.3;
  }
  .selected-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: #fff;
    border: 1px solid var(--hairline);
    font-size: 14px;
    font-weight: 500;
  }
  .selected-pill .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }
  .tone-card-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 10px;
  }
  @media (max-width: 960px) {
    .tone-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 520px) {
    .tone-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .tone-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    min-width: 0;
    padding: 8px;
    text-align: left;
    border: 2px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .tone-card:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .tone-card.selected {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(83, 58, 253, 0.22);
  }
  .tone-card:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .tone-focus-preview {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
    padding: 14px 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
  }
  .tone-focus-swatch {
    width: 120px;
    flex-shrink: 0;
    aspect-ratio: var(--brand-chip-aspect);
    min-height: var(--brand-chip-min-h);
    border-radius: var(--brand-chip-radius);
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  .tone-focus-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
  }
  .tone-focus-title {
    margin: 0;
    font-size: 16px;
    line-height: 1.4;
  }
  .tone-focus-en {
    font-weight: 400;
    color: var(--ink-mute);
    font-size: 14px;
  }
  .tone-focus-hex {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--ink-mute);
  }
  .tone-focus-hint {
    margin: 6px 0 0;
  }
  .tone-confirm {
    margin-top: 10px;
    align-self: flex-start;
    min-height: 32px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    border-radius: var(--radius-sm);
    background: #007f4c;
    color: #fff;
    border: 1px solid #006b40;
  }
  .tone-confirm:hover:not(:disabled) {
    background: #006b40;
  }
  .tone-confirm:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .tone-card-swatch {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: var(--tone-chip-aspect);
    min-height: var(--tone-chip-min-h);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .tone-abbr-in-chip {
    font-size: clamp(0.65rem, 2vw, 0.8rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: #fff;
    pointer-events: none;
    user-select: none;
  }
  .tone-card-swatch.light-ink .tone-abbr-in-chip {
    color: var(--ink);
  }
  .tone-card-check {
    position: absolute;
    top: 1px;
    right: 2px;
    display: grid;
    place-items: center;
    color: #fff;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
  }

  .tone-card-swatch.light-ink .tone-card-check {
    color: var(--ink);
    filter: none;
  }
  .tone-card-swatch.color-chip.light {
    border-color: var(--hairline);
  }
  .tone-card-meta {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }
  .tone-en {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--ink-mute);
    line-height: 1.35;
    text-align: left;
  }
  .tone-ko {
    flex-shrink: 0;
    max-width: 48%;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.35;
    text-align: right;
  }
  .tone-note {
    font-size: 12px;
    color: var(--ink-mute);
    margin: 8px 0 0;
    line-height: 1.45;
  }
  .result {
    padding: 14px 16px;
    margin: 0 0 12px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .result-head {
    margin: 0;
  }
  .result-head-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 12px;
    margin-bottom: 4px;
  }
  .result-head h3 {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
  }
  .result-lede {
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: var(--ink-mute);
  }
  .result-meta {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .result-tip {
    margin: 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--hairline);
    background: var(--canvas-soft);
    overflow: hidden;
  }
  .result-tip-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ink);
    cursor: pointer;
    list-style: none;
  }
  .result-tip-summary::-webkit-details-marker {
    display: none;
  }
  .result-tip-summary:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }
  .result-tip-icon {
    display: flex;
    flex-shrink: 0;
    color: var(--primary);
  }
  .result-tip-summary-text {
    flex: 1;
    min-width: 0;
  }
  .result-tip-chevron {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--ink-mute);
    border-bottom: 2px solid var(--ink-mute);
    transform: rotate(45deg);
    margin-top: -2px;
    transition: transform 0.15s ease;
  }
  .result-tip[open] .result-tip-chevron {
    transform: rotate(-135deg);
    margin-top: 2px;
  }
  .result-tip-panel {
    padding: 0 12px 12px;
    border-top: 1px solid var(--hairline);
  }
  .result-tip-panel .result-tip-body:first-child {
    margin-top: 10px;
  }
  .result-tip-body {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink);
  }
  .result-tip-subhead {
    margin: 12px 0 4px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--ink);
  }
  .result-slots-sticky {
    position: sticky;
    top: calc(var(--app-save-bar-h) + 10px);
    z-index: 15;
    margin: 0 0 20px;
    padding: 14px 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
    box-shadow:
      0 4px 16px rgba(13, 37, 61, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.8) inset;
    -webkit-overflow-scrolling: touch;
  }
  @media (max-width: 520px) {
    .result-slots-sticky {
      top: calc(var(--app-save-bar-h) + 8px);
    }
  }
  .slot-count {
    font-weight: 600;
    color: var(--primary-press);
  }
  .picked-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    max-width: 100%;
    overflow-x: auto;
  }
  .picked-list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 10px;
    align-items: stretch;
  }
  /* 5칸이 꽉 찼을 때 한 칸 너비 — 빈 슬롯·3칸 초기도 동일 */
  .picked-list .result-card {
    box-sizing: border-box;
    flex: 0 0 calc((100% - 4 * 10px) / 5);
    width: calc((100% - 4 * 10px) / 5);
    max-width: calc((100% - 4 * 10px) / 5);
    min-width: 0;
  }
  .adding-done-badge {
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: #e8f5ee;
    color: #006b40;
    vertical-align: middle;
  }
  .result-card {
    --result-slot-body-h: 73px;
    --result-slot-footer-h: 36px;
    --result-slot-text: 10px;
    --result-slot-text-label: 9px;
    --result-slot-line: 1.22;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0;
    background: var(--canvas-soft);
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .result-card.filled {
    background: #fff;
    box-shadow: 0 1px 3px rgba(13, 37, 61, 0.06);
  }
  .result-card-body {
    flex: 1 1 auto;
    min-height: var(--result-slot-body-h);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 6px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .result-card.filled .result-card-body {
    justify-content: flex-start;
    align-items: stretch;
    text-align: left;
  }
  .result-card.empty .result-card-body {
    justify-content: center;
    padding: 0 6px;
    text-align: center;
  }
  .result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--result-slot-text);
    line-height: var(--result-slot-line);
  }
  .result-card-footer {
    flex-shrink: 0;
    min-height: var(--result-slot-footer-h);
    margin: 0 6px 6px;
    padding-top: 6px;
    border-top: 1px solid var(--hairline);
    box-sizing: border-box;
  }
  .result-card-footer--spacer {
    border-top-color: transparent;
    visibility: hidden;
    background: var(--canvas-soft);
    opacity: 0.92;
  }
  .decision-footer {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: auto;
    min-height: var(--result-slot-footer-h);
  }
  .empty-hint {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--ink-mute);
    text-align: center;
  }
  .result-card.empty .result-swatch-wrap {
    opacity: 0.55;
  }
  .slot-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: var(--primary);
  }
  .slot-badge.muted {
    color: var(--ink-mute);
    background: var(--canvas-soft);
    border: 1px solid var(--hairline);
  }
  .result-swatch-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 8px 8px;
  }
  .result-swatch,
  .empty-swatch {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
  }
  .empty-swatch {
    width: 35px;
    height: 35px;
    min-width: 35px;
    min-height: 35px;
    border: 1px dashed var(--hairline-input);
    background: repeating-linear-gradient(
      -45deg,
      var(--canvas-soft),
      var(--canvas-soft) 6px,
      #fff 6px,
      #fff 12px
    );
  }
  .result-swatch {
    font-size: 12px;
    line-height: 1.5;
  }
  .result-table thead th {
    padding: 2px 2px;
    font-size: 12px;
    font-weight: 600;
    text-align: left;
    color: var(--ink-mute);
    border-bottom: 1px solid var(--hairline);
  }
  .result-table tbody td {
    padding: 2px 2px;
    font-size: 12px;
    line-height: 1.5;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--hairline);
  }
  .result-table tbody td:first-child {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
    width: 34%;
    word-break: keep-all;
  }
  .result-table tbody td:last-child {
    font-weight: 500;
    color: var(--ink);
  }
  .result-hue-code {
    font-size: 9px;
    font-weight: inherit;
    color: var(--ink-mute);
    word-break: keep-all;
  }
  .result-card .remove {
    width: 100%;
    min-height: 28px;
    height: 28px;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid #f0a8a8;
    background: #fff0f0;
    color: #c41e3a;
    box-shadow: 0 1px 2px rgba(196, 30, 58, 0.08);
    cursor: pointer;
  }
  .result-card .remove:hover {
    border-color: #e57373;
    background: #ffe4e4;
    color: #a91530;
  }
  .result-card .remove:focus-visible {
    outline: 2px solid rgba(196, 30, 58, 0.4);
    outline-offset: 2px;
  }
  .result-card .slot-add-in-card {
    width: 100%;
    min-height: 25px;
    height: 25px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid var(--primary);
    background: #f8f6ff;
    color: var(--primary-press);
    box-shadow: 0 1px 2px rgba(83, 58, 253, 0.08);
    cursor: pointer;
  }
  .result-card .slot-add-in-card:hover {
    background: #efeaff;
    border-color: var(--primary-press);
  }
  .result-card .slot-add-in-card:focus-visible {
    outline: 2px solid rgba(83, 58, 253, 0.35);
    outline-offset: 2px;
  }
  .decision-slot .empty-hint {
    gap: 6px;
    height: auto;
    min-height: var(--result-slot-footer-h);
    padding-top: 8px;
    padding-bottom: 0;
  }
  .result-card .slot-finish-in-card {
    width: 100%;
    min-height: 25px;
    height: 25px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid var(--hairline);
    background: #fff;
    color: var(--ink);
    cursor: pointer;
  }
  .result-card .slot-finish-in-card:hover {
    background: var(--canvas-soft);
    border-color: var(--ink-mute);
  }
  .result-card .slot-finish-in-card:focus-visible {
    outline: 2px solid rgba(13, 37, 61, 0.25);
    outline-offset: 2px;
  }
</style>
