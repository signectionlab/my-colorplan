<script lang="ts">
  import { CONTRAST_NOTE } from '../data/sources'
  import { brandImagePickKey } from '../domain/brand-image'
  import {
    baselineLabel,
    compareAct1BaselineHelp,
    brandCompareSeedFromPicks,
    compareMatchesStartExample,
    COMPARE_DEFAULT_WEB_TEXT_OPTIONS,
    contrastHint,
    effectiveCompareBaseline,
  } from '../domain/compare-ux'
  import { pickChipColorName, needsPickSwatchHairline } from '../domain/learn-brand-pick'
  import {
    store,
    setCompareColor,
    setCompareSurroundBg,
    setCompareSurroundShape,
    patchCompareFields,
    saveCompareBaseline,
    restoreCompareBaseline,
  } from '../state/project-state.svelte'

  const brand = $derived(store.project.brand)
  const compare = $derived(store.project.compare)
  const picks = $derived(brand.imagePicks)
  const baselineRef = $derived(effectiveCompareBaseline(compare.baseline))
  const baselineTitle = $derived(baselineLabel(compare.baseline))
  const contrastCurrent = $derived(contrastHint(compare.text, compare.background))
  const contrastBaseline = $derived(contrastHint(baselineRef.text, baselineRef.background))
  const sampleLine = $derived(brand.name.trim() || '나의 브랜드')
  const sampleSubline = $derived(
    brand.intro.trim() || brand.keywordReason.trim() || '브랜드가 전하는 이야기',
  )

  let brandSeedApplied = $state(false)

  function hexMatches(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase()
  }

  function surroundBgChipBlocked(pickHex: string, field: 'surroundBgA' | 'surroundBgB'): boolean {
    const other = field === 'surroundBgA' ? compare.surroundBgB : compare.surroundBgA
    const current = field === 'surroundBgA' ? compare.surroundBgA : compare.surroundBgB
    return hexMatches(pickHex, other) && !hexMatches(pickHex, current)
  }

  $effect(() => {
    if (brandSeedApplied || !picks.length || compare.baseline) return
    if (
      !compareMatchesStartExample({
        background: compare.background,
        text: compare.text,
        shape: compare.shape,
      })
    ) {
      return
    }
    const seed = brandCompareSeedFromPicks(picks)
    if (!seed) return
    brandSeedApplied = true
    patchCompareFields(seed)
  })

</script>

<p class="screen-lede">1단계에서 고른 색으로 글자·배경 대비를 살펴봅니다. (아직 팔레트를 확정하는 단계예요.)</p>
<p class="caption caption-guide compare-note">{CONTRAST_NOTE} 팔레트(4단계)와 별도로 저장됩니다.</p>

<section class="activity card" aria-labelledby="compare-act1">
  <p class="step-badge">STEP 3 · 활동 1</p>
  <p class="step-badge step-badge--topic">가독성</p>
  <h2 id="compare-act1" class="activity-title">글자·배경 비교하기</h2>

    <div
      class="billboard color-chip color-chip--hairline-border"
      style:background={compare.background}
      style:color={compare.text}
      class:light={needsPickSwatchHairline(compare.background)}
      aria-live="polite"
    >
      <p class="billboard-title">{sampleLine}</p>
      <p class="billboard-sub">{sampleSubline}</p>
    </div>

    {#if picks.length}
      <p class="apply-intro">아래 줄에서 색을 누르면 <strong>한 번에</strong> 배경·글자에 적용됩니다.</p>
    {:else}
      <p class="caption caption-guide empty-hint">1단계에서 색을 고르면 배경·브랜드 글자색 칩이 나타납니다.</p>
    {/if}

    <div class="apply-rows" aria-label="활동 1 색 적용">
      {#if picks.length}
        <div class="apply-row">
          <span class="apply-row-label" id="act1-bg-label">배경</span>
          <div class="apply-chips" role="group" aria-labelledby="act1-bg-label">
            {#each picks as pick (brandImagePickKey(pick) + '-bg')}
              <button
                type="button"
                class="apply-chip color-chip"
                class:current={hexMatches(pick.hex, compare.background)}
                class:light={needsPickSwatchHairline(pick.hex)}
                style:background={pick.hex}
                aria-label="{pickChipColorName(pick)} 배경색으로 적용"
                aria-current={hexMatches(pick.hex, compare.background) ? 'true' : undefined}
                onclick={() => setCompareColor('background', pick.hex)}
              ></button>
            {/each}
          </div>
        </div>
      {/if}
      <div class="apply-row apply-row--text">
        <span class="apply-row-label" id="act1-text-label">글자</span>
        <div class="apply-text-inline">
          <div class="apply-chips apply-chips--text" role="group" aria-labelledby="act1-text-label">
            {#each picks as pick (brandImagePickKey(pick) + '-text')}
              <button
                type="button"
                class="apply-chip color-chip"
                class:current={hexMatches(pick.hex, compare.text)}
                class:light={needsPickSwatchHairline(pick.hex)}
                style:background={pick.hex}
                aria-label="{pickChipColorName(pick)} 글자색으로 적용"
                aria-current={hexMatches(pick.hex, compare.text) ? 'true' : undefined}
                onclick={() => setCompareColor('text', pick.hex)}
              ></button>
            {/each}
          </div>
          <div class="text-default-aside" aria-label="웹 본문 기본 글자색">
            <div class="text-default-options" role="group" aria-label="기본 웹 글자색">
              {#each COMPARE_DEFAULT_WEB_TEXT_OPTIONS as option (option.hex)}
                <button
                  type="button"
                  class="text-default-option"
                  class:current={hexMatches(option.hex, compare.text)}
                  aria-label="기본 웹 글자색 {option.hex} 적용"
                  aria-current={hexMatches(option.hex, compare.text) ? 'true' : undefined}
                  onclick={() => setCompareColor('text', option.hex)}
                >
                  <span
                    class="apply-chip color-chip color-chip--hairline-border text-default-swatch"
                    style:background={option.hex}
                    class:light={needsPickSwatchHairline(option.hex)}
                    aria-hidden="true"
                  ></span>
                  <span class="text-default-title">
                    {option.label} <span class="tabular text-default-hex">{option.hex}</span>
                  </span>
                </button>
              {/each}
            </div>
            <p class="caption caption-guide text-default-hint">웹 본문용 · 브랜드색이 잘 안 보일 때</p>
          </div>
        </div>
      </div>
    </div>

    <p class="act-foot">{contrastCurrent.summary}</p>
    <p class="caption contrast-ratio tabular">참고 · 대비 약 {contrastCurrent.ratioText}:1</p>

    <details class="act-details" open>
      <summary>나란히 비교 · 관찰 기록</summary>
      <p class="caption caption-guide compare-baseline-help">{compareAct1BaselineHelp(!!compare.baseline)}</p>
      <div class="baseline-compare">
        <div class="baseline-mini">
          <p class="baseline-label">지금 미리보기</p>
          <div
            class="baseline-preview color-chip color-chip--hairline-border"
            style:background={compare.background}
            style:color={compare.text}
            class:light={needsPickSwatchHairline(compare.background)}
          >
            {sampleLine}
          </div>
        </div>
        <div class="baseline-mini">
          <p class="baseline-label">{baselineTitle}</p>
          <div
            class="baseline-preview color-chip color-chip--hairline-border"
            style:background={baselineRef.background}
            style:color={baselineRef.text}
            class:light={needsPickSwatchHairline(baselineRef.background)}
          >
            {sampleLine}
          </div>
          <p class="caption">{contrastBaseline.summary}</p>
        </div>
      </div>
      <div class="compare-actions btn-row" aria-label="비교 기준">
        <button type="button" class="btn btn-secondary btn-sm" onclick={saveCompareBaseline}>
          {compare.baseline ? '비교 기준 다시 남기기' : '비교 기준으로 남기기'}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          disabled={!compare.baseline}
          title={compare.baseline ? undefined : '비교 기준으로 남기기를 먼저 해 주세요'}
          onclick={restoreCompareBaseline}
        >
          비교 기준 → 미리보기에 적용
        </button>
      </div>
    </details>
</section>

<section class="activity card" aria-labelledby="compare-act2">
  <p class="step-badge">STEP 3 · 활동 2</p>
  <p class="step-badge step-badge--topic step-badge--topic-alt">주변색 효과</p>
  <h2 id="compare-act2" class="activity-title">주변 색에 따른 차이 관찰하기</h2>

    <div class="surround-stage">
      <div
        class="surround-panel color-chip color-chip--hairline-border"
        style:background={compare.surroundBgA}
        class:light={needsPickSwatchHairline(compare.surroundBgA)}
      >
        <span
          class="surround-shape color-chip"
          style:background={compare.surroundShape}
          class:light={needsPickSwatchHairline(compare.surroundShape)}
          aria-hidden="true"
        ></span>
        <span class="surround-label">배경 A</span>
      </div>
      <div
        class="surround-panel color-chip color-chip--hairline-border"
        style:background={compare.surroundBgB}
        class:light={needsPickSwatchHairline(compare.surroundBgB)}
      >
        <span
          class="surround-shape color-chip"
          style:background={compare.surroundShape}
          class:light={needsPickSwatchHairline(compare.surroundShape)}
          aria-hidden="true"
        ></span>
        <span class="surround-label">배경 B</span>
      </div>
    </div>

    {#if picks.length}
      <div class="apply-rows" aria-label="활동 2 색 적용">
        <div class="apply-row">
          <span class="apply-row-label" id="act2-shape-label">도형</span>
          <div class="apply-chips" role="group" aria-labelledby="act2-shape-label">
            {#each picks as pick (brandImagePickKey(pick) + '-shape')}
              <button
                type="button"
                class="apply-chip color-chip"
                class:current={hexMatches(pick.hex, compare.surroundShape)}
                class:light={needsPickSwatchHairline(pick.hex)}
                style:background={pick.hex}
                aria-label="{pickChipColorName(pick)} 도형색으로 적용"
                onclick={() => setCompareSurroundShape(pick.hex)}
              ></button>
            {/each}
          </div>
        </div>
        <div class="apply-row">
          <span class="apply-row-label" id="act2-bg-a-label">배경 A</span>
          <div class="apply-chips" role="group" aria-labelledby="act2-bg-a-label">
            {#each picks as pick (brandImagePickKey(pick) + '-bga')}
              {@const blocked = surroundBgChipBlocked(pick.hex, 'surroundBgA')}
              <button
                type="button"
                class="apply-chip color-chip"
                class:current={hexMatches(pick.hex, compare.surroundBgA)}
                class:light={needsPickSwatchHairline(pick.hex)}
                style:background={pick.hex}
                disabled={blocked}
                aria-label="{pickChipColorName(pick)} 배경 A로 적용{blocked ? ' (배경 B와 같은 색은 선택할 수 없음)' : ''}"
                title={blocked ? '배경 B와 다른 색을 골라 주세요' : undefined}
                onclick={() => setCompareSurroundBg('surroundBgA', pick.hex)}
              ></button>
            {/each}
          </div>
        </div>
        <div class="apply-row">
          <span class="apply-row-label" id="act2-bg-b-label">배경 B</span>
          <div class="apply-chips" role="group" aria-labelledby="act2-bg-b-label">
            {#each picks as pick (brandImagePickKey(pick) + '-bgb')}
              {@const blocked = surroundBgChipBlocked(pick.hex, 'surroundBgB')}
              <button
                type="button"
                class="apply-chip color-chip"
                class:current={hexMatches(pick.hex, compare.surroundBgB)}
                class:light={needsPickSwatchHairline(pick.hex)}
                style:background={pick.hex}
                disabled={blocked}
                aria-label="{pickChipColorName(pick)} 배경 B로 적용{blocked ? ' (배경 A와 같은 색은 선택할 수 없음)' : ''}"
                title={blocked ? '배경 A와 다른 색을 골라 주세요' : undefined}
                onclick={() => setCompareSurroundBg('surroundBgB', pick.hex)}
              ></button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <p class="act-foot">같은 색도 주변 배경에 따라 다르게 느껴지는지 관찰합니다.</p>
</section>

<style>
  .compare-note {
    margin: 0 0 8px;
  }
  .apply-intro {
    margin: 12px 0 8px;
    font-size: 12px;
    color: var(--ink-mute);
    line-height: 1.4;
  }
  .apply-intro strong {
    color: var(--ink);
    font-weight: 600;
  }
  .apply-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0 0 4px;
  }
  .apply-row {
    display: grid;
    grid-template-columns: 3.25rem 1fr;
    gap: 10px;
    align-items: center;
  }
  .apply-row--text {
    align-items: start;
  }
  .apply-text-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px 14px;
    min-width: 0;
  }
  .text-default-aside {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    flex: 0 0 auto;
    padding-left: 14px;
    border-left: 1px solid var(--hairline);
  }
  .text-default-options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .apply-row-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
    line-height: 1.2;
  }
  .apply-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .apply-chip {
    flex: 1 1 0;
    min-width: 44px;
    max-width: 88px;
    height: 40px;
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 0;
    cursor: pointer;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }
  .apply-chip:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
  }
  .apply-chip:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    filter: grayscale(0.15);
  }
  .apply-chip.current {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px rgba(83, 58, 253, 0.35);
  }
  .apply-chip:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .apply-chips--text {
    align-items: center;
    flex: 0 1 auto;
  }
  .text-default-option {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 36px;
    padding: 0 9px 0 0;
    border: 2px solid var(--hairline);
    border-radius: 9px;
    background: var(--canvas-soft);
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }
  .text-default-option:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
  }
  .text-default-option.current {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px rgba(83, 58, 253, 0.35);
  }
  .text-default-option:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .text-default-swatch {
    flex: 0 0 auto;
    width: 32px;
    min-width: 32px;
    max-width: 32px;
    height: 28px;
    margin-left: 2px;
    pointer-events: none;
    border-radius: 7px;
  }
  .text-default-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.2;
  }
  .text-default-hex {
    font-weight: 600;
    color: var(--ink-mute);
  }
  .text-default-hint {
    margin: 0;
    max-width: 16rem;
    font-size: 11px;
    line-height: 1.35;
    color: var(--ink-mute);
  }
  @media (max-width: 420px) {
    .text-default-aside {
      flex: 1 1 100%;
      padding-left: 0;
      border-left: none;
      padding-top: 4px;
      border-top: 1px dashed var(--hairline);
    }
  }
  .empty-hint {
    margin: 12px 0 0;
  }
  .billboard.color-chip--hairline-border:global(.light),
  .baseline-preview.color-chip--hairline-border:global(.light),
  .surround-panel.color-chip--hairline-border:global(.light) {
    border: 1px solid var(--hairline);
  }
  .billboard.color-chip--hairline-border:global(.light) {
    box-shadow:
      0 10px 28px rgba(13, 37, 61, 0.08),
      inset 0 0 0 1px var(--hairline);
  }
  .billboard {
    min-height: 168px;
    padding: 28px 20px;
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 28px rgba(13, 37, 61, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
  }
  .billboard-title {
    margin: 0;
    font-size: clamp(1.25rem, 4vw, 1.625rem);
    font-weight: 700;
    line-height: 1.25;
  }
  .billboard-sub {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.4;
    opacity: 0.92;
  }
  .act-foot {
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--ink-mute);
  }
  .contrast-ratio {
    margin: 4px 0 0;
  }
  .act-details {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px dashed var(--hairline);
  }
  .act-details summary {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
  }
  .baseline-compare {
    display: grid;
    gap: 12px;
    margin: 12px 0;
  }
  @media (min-width: 560px) {
    .baseline-compare {
      grid-template-columns: 1fr 1fr;
    }
  }
  .baseline-label {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-mute);
  }
  .baseline-preview {
    min-height: 56px;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .surround-stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 22px;
  }
  .surround-panel {
    position: relative;
    min-height: 140px;
    border-radius: var(--radius-lg);
    display: grid;
    place-items: center;
  }
  .surround-shape {
    width: 56px;
    height: 56px;
    border-radius: 12px;
  }
  .surround-label {
    position: absolute;
    left: 10px;
    bottom: 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--ink-mute);
    opacity: 0.85;
  }
  .compare-baseline-help {
    margin: 10px 0 0;
    line-height: 1.5;
  }
  .compare-actions {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px dashed var(--hairline);
  }
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
</style>
