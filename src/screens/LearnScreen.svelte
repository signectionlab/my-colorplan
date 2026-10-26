<script lang="ts">
  import ApplyFieldReferenceImage from '../components/ApplyFieldReferenceImage.svelte'
  import { APPLY_FIELD_BY_ID } from '../data/apply-fields'
  import { applyFieldReferenceImageSrc } from '../data/apply-field-reference-image'
  import { brandImagePickKey, isBrandImageSelectionSettled } from '../domain/brand-image'
  import { relativeLuminance } from '../data/munsell-brand-image'
  import {
    brightnessVariants,
    educationToneColorName,
    compareChoiceGaugeForPick,
    compareMineSideView,
    compareOtherSideView,
    compareToneOptionsForPick,
    IMAGE_COMPARE_PERCEPTION_NOTE,
    needsPickSwatchHairline,
    resolveCompareToneId,
    neighborToneSwatches,
    pickConceptLines,
    pickBasicColorName,
    pickChipColorName,
    pickChipToneLine,
    pickHueDisplayLine,
    pickImageAdjectives,
    pickSummaryLabel,
  } from '../domain/learn-brand-pick'
  import { effectiveLearnFocusKey, learnRecordForKey } from '../domain/learn-normalize'
  import {
    store,
    setLearnFocusPickKey,
    patchLearnBrandPickRecord,
    goTo,
  } from '../state/project-state.svelte'
  import { applyFieldDisplayText } from '../domain/apply-field'

  const brand = $derived(store.project.brand)
  const applyFieldLabel = $derived(applyFieldDisplayText(brand))
  const applyFieldRefSrc = $derived(applyFieldReferenceImageSrc(brand.applyFieldId))
  const applyFieldRefTitle = $derived(
    brand.applyFieldId && brand.applyFieldId !== 'other'
      ? APPLY_FIELD_BY_ID[brand.applyFieldId].title
      : '',
  )
  const brandDirection = $derived(brand.keywordReason.trim())
  const picks = $derived(brand.imagePicks)
  const settled = $derived(isBrandImageSelectionSettled(brand))
  const focusKey = $derived(effectiveLearnFocusKey(store.project.learn, picks))
  const focusPick = $derived(
    focusKey ? picks.find((p) => brandImagePickKey(p) === focusKey) : undefined,
  )

  const concepts = $derived(focusPick ? pickConceptLines(focusPick) : null)
  const brightness = $derived(focusPick ? brightnessVariants(focusPick.hex) : [])
  const neighbors = $derived(focusPick ? neighborToneSwatches(focusPick) : [])
  const focusRecord = $derived(focusKey ? learnRecordForKey(store.project.learn, focusKey) : null)

  /** 활동 2 전용 — 활동 1 포커스와 분리 */
  let act2PickKey = $state<string | null>(null)

  $effect(() => {
    const keys = picks.map((p) => brandImagePickKey(p))
    if (!keys.length) {
      act2PickKey = null
      return
    }
    if (!act2PickKey || !keys.includes(act2PickKey)) act2PickKey = keys[0]
  })

  const act2Pick = $derived(
    act2PickKey ? picks.find((p) => brandImagePickKey(p) === act2PickKey) : undefined,
  )
  const act2Record = $derived(
    act2PickKey ? learnRecordForKey(store.project.learn, act2PickKey) : null,
  )
  const compareToneOptions = $derived(act2Pick ? compareToneOptionsForPick(act2Pick) : [])
  const effectiveCompareToneId = $derived(
    act2Pick && act2Record
      ? resolveCompareToneId(act2Pick, act2Record.compareToneId)
      : null,
  )
  const compareMine = $derived(act2Pick ? compareMineSideView(act2Pick) : null)
  const compareOther = $derived(
    act2Pick && effectiveCompareToneId
      ? compareOtherSideView(act2Pick, effectiveCompareToneId)
      : null,
  )
  const act2ExploredCount = $derived(
    picks.filter((p) => {
      const r = learnRecordForKey(store.project.learn, brandImagePickKey(p))
      return r.imageCompareSide !== null
    }).length,
  )
  const act2CurrentStep = $derived.by(() => {
    if (!act2PickKey) return 0
    const idx = picks.findIndex((p) => brandImagePickKey(p) === act2PickKey)
    return idx >= 0 ? idx + 1 : 0
  })

  function selectAct2Pick(key: string) {
    act2PickKey = key
  }

  function selectCompareTone(toneId: string) {
    patchAct2Record({ compareToneId: toneId, imageCompareSide: null })
  }

  function patchAct2Record(patch: Parameters<typeof patchLearnBrandPickRecord>[1]) {
    if (!act2PickKey) return
    patchLearnBrandPickRecord(act2PickKey, patch)
  }
  const imageAdj = $derived(focusPick ? pickImageAdjectives(focusPick) : null)
  const toneColorName = $derived(
    focusPick ? educationToneColorName(focusPick.hueId, focusPick.toneId) : '',
  )
  const heroInk = $derived.by(() => {
    if (!focusPick) return { color: 'var(--ink)', shadow: 'none', pillBg: 'rgba(13, 37, 61, 0.12)' }
    const light = relativeLuminance(focusPick.hex) > 0.55
    return light
      ? {
          color: 'var(--ink)',
          shadow: '0 0 12px rgba(255, 255, 255, 0.75)',
          pillBg: 'rgba(13, 37, 61, 0.1)',
        }
      : {
          color: '#ffffff',
          shadow: '0 1px 8px rgba(0, 0, 0, 0.45)',
          pillBg: 'rgba(255, 255, 255, 0.22)',
        }
  })
  let act1Tool = $state<'brightness' | 'tones'>('brightness')

  $effect(() => {
    focusKey
    act1Tool = 'brightness'
  })

</script>

{#if !settled || picks.length < 1}
  <section class="card empty-state">
    <h2>1단계에서 고른 색이 필요해요</h2>
    <p class="lede-step">
      「내 브랜드」에서 색과 톤을 3~5개 고른 뒤, 이 단계에서 특성과 브랜드 이미지를 연결해 볼 수 있어요.
    </p>
    <button type="button" class="btn btn-primary" onclick={() => goTo('brand')}>1단계로 이동</button>
  </section>
{:else}
  <p class="screen-lede">
    내가 고른 색은 어떤 특성을 가지고 있으며, 우리 브랜드에 어떤 인상을 줄 수 있을까요?
  </p>

  <div class="brand-context card" aria-label="브랜드 맥락">
    <header class="brand-context-head">
      <p class="section-eyebrow">내 브랜드</p>
      <p class="brand-name">{brand.name.trim() || '이름 작성 전'}</p>
    </header>
    {#if applyFieldLabel}
      <div
        class="brand-context-block"
        class:brand-context-row={!!applyFieldRefSrc && !!applyFieldRefTitle}
      >
        <dl class="brand-field">
          <dt>색 활용 분야</dt>
          <dd>{applyFieldLabel}</dd>
        </dl>
        {#if applyFieldRefSrc && applyFieldRefTitle}
          <section class="apply-ref" aria-label="활용 분야 참고 이미지">
            <ApplyFieldReferenceImage applyFieldId={brand.applyFieldId} fieldTitle={applyFieldRefTitle} />
          </section>
        {/if}
      </div>
    {/if}
    {#if brandDirection}
      <div class="brand-context-block brand-context-row brand-context-row-text">
        <dl class="brand-field brand-field-inline">
          <dt>전달하고 싶은 방향</dt>
          <dd>{brandDirection}</dd>
        </dl>
</div>
    {/if}
</div>

  <section class="pick-section" aria-labelledby="learn-pick-heading">
    <h2 id="learn-pick-heading" class="pick-section-title">1단계에서 고른 색</h2>
    <p class="pick-section-hint caption caption-guide">
      <strong class="pick-section-for">활동 1</strong>에서 이름과 특징을 살펴볼 색을 고르세요. 칩에는 색명 · 톤 ·
      HEX 순으로 표시됩니다.
    </p>
    <div class="pick-row" role="group" aria-label="1단계에서 선택한 브랜드 색">
    {#each picks as pick (brandImagePickKey(pick))}
      {@const key = brandImagePickKey(pick)}
      {@const selected = focusKey === key}
      <button
        type="button"
        class="pick-card"
        class:selected
        aria-pressed={selected}
        onclick={() => setLearnFocusPickKey(key)}
      >
        <span
          class="pick-swatch color-chip color-chip--hairline-border"
          style:background={pick.hex}
          class:light={needsPickSwatchHairline(pick.hex)}
        ></span>
        <span class="pick-text">
          <span class="pick-line pick-color-name">{pickChipColorName(pick)}</span>
          <span class="pick-line pick-tone">{pickChipToneLine(pick)}</span>
          <span class="pick-line pick-hex tabular">{pick.hex.toUpperCase()}</span>
        </span>
      </button>
    {/each}
  </div>
  </section>

  {#if focusPick && focusKey && focusRecord}
    <section class="activity-act1" aria-labelledby="learn-act1">
      <p class="step-badge">STEP 2 · 활동 1</p>
      <h2 id="learn-act1" class="activity-title">내가 고른 색 알아보기</h2>
      <p class="act1-lede">내가 선택한 색의 이름과 특징을 살펴보세요.</p>

      <div
        class="hero-card color-chip"
        style:background={focusPick.hex}
        class:light={needsPickSwatchHairline(focusPick.hex)}
        aria-label={imageAdj ? `대표 이미지 형용사 ${imageAdj.primary}` : '선택한 색 미리보기'}
      >
        <p class="hero-meta" style:color={heroInk.color} style:text-shadow={heroInk.shadow}>
          {pickHueDisplayLine(focusPick)}
        </p>
        {#if imageAdj}
          <p class="hero-adj" style:color={heroInk.color} style:text-shadow={heroInk.shadow}>{imageAdj.primary}</p>
          <div class="hero-adj-pills" role="list" aria-label="보조 이미지 형용사">
            {#each imageAdj.secondary as word}
              <span
                class="hero-adj-pill"
                role="listitem"
                style:color={heroInk.color}
                style:background={heroInk.pillBg}
              >{word}</span>
            {/each}
          </div>
        {/if}
      </div>

      <div class="color-name-block">
        <div class="color-name-table-shell">
        <table class="color-name-table">
          <caption class="sr-only">색 이름·색상 정보·이미지 형용사</caption>
          <tbody>
            <tr>
              <th scope="row">기본색명</th>
              <td>{pickBasicColorName(focusPick)}</td>
            </tr>
            <tr>
              <th scope="row">계통색명</th>
              <td>{toneColorName}</td>
            </tr>
            <tr>
              <th scope="row">이름·톤</th>
              <td>{pickSummaryLabel(focusPick)}</td>
            </tr>
            <tr>
              <th scope="row">HEX</th>
              <td class="tabular">{focusPick.hex.toUpperCase()}</td>
            </tr>
            {#if concepts}
              <tr class="color-name-note-row">
                <th scope="row">관찰</th>
                <td class="color-info-concept">
                  {#if concepts.isNeutral}
                    <p>무채색은 색상(색조)보다 밝기·명도 차이가 인상을 바꿀 수 있어요.</p>
                    <p>
                      선택:
                      <span class="concept-block">{concepts.toneHighlight}</span>
                    </p>
                  {:else}
                    <p>
                      색상은 대략
                      {#if concepts.hueHighlight}
                        <span class="concept-block">{concepts.hueHighlight}</span>
                      {:else}
                        색상
                      {/if}
                      쪽에 가깝게 느껴질 수 있어요.
                    </p>
                    <p>
                      {#if concepts.toneHighlight}
                        색조(톤)는
                        <span class="concept-block">{concepts.toneHighlight}</span>
                        에 가깝게 잡았어요. 같은 색상이라도 톤에 따라 선명·연함·탁함이 달라 보일
                        수 있습니다.
                      {:else}
                        색조(톤) 정보를 함께 보면 같은 색상 계열 안에서도 인상 차이를 비교하기
                        쉬워요.
                      {/if}
                    </p>
                  {/if}
                  <p class="caption">{concepts.observeLine}</p>
                </td>
              </tr>
            {/if}
            {#if imageAdj}
              <tr>
                <th scope="row">대표 형용사</th>
                <td>{imageAdj.primary}</td>
              </tr>
              <tr>
                <th scope="row">보조 형용사</th>
                <td>{imageAdj.secondary.join(', ')}</td>
              </tr>
            {/if}
            <tr class="color-name-note-row">
              <th scope="row">안내</th>
              <td>
                <p class="color-name-hint">
                  색의 밝기나 선명함을 나타내는 말을 붙이면 색을 더 자세하게 설명할 수 있어요. 이런 방식의
                  색 이름을 ‘계통색명’이라고 해요.
                </p>
                <p class="caption color-hex-note">
                  * HEX는 1단계 UI 근사값이며 표준 측색값과 다를 수 있습니다.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <div class="learn-tools">
        <div class="learn-tools-tabs" role="tablist" aria-label="색 관찰 도구">
          <button
            type="button"
            role="tab"
            class="tool-tab"
            aria-selected={act1Tool === 'brightness'}
            onclick={() => (act1Tool = 'brightness')}
          >
            <span class="tool-icon" aria-hidden="true">☀</span> 밝기 비교
          </button>
          <button
            type="button"
            role="tab"
            class="tool-tab"
            aria-selected={act1Tool === 'tones'}
            onclick={() => (act1Tool = 'tones')}
          >
            <span class="tool-icon" aria-hidden="true">◐</span> 비슷한 톤
          </button>
        </div>

        <div class="learn-tools-panel" role="tabpanel">
          {#if act1Tool === 'brightness'}
            <div class="swatch-row" role="group" aria-label="밝기 비교">
              {#each brightness as item}
                <figure>
                  <span
                    class="mini-swatch color-chip color-chip--hairline-border"
                    style:background={item.hex}
                    class:light={needsPickSwatchHairline(item.hex)}
                  ></span>
                  <figcaption>{item.label}</figcaption>
                </figure>
              {/each}
            </div>
          {:else}
            {#if neighbors.length}
              <div class="swatch-row tone-row" role="group" aria-label="비슷한 색">
                {#each neighbors as n}
                  <figure>
                    <span
                      class="mini-swatch color-chip color-chip--hairline-border"
                      style:background={n.hex}
                      class:light={needsPickSwatchHairline(n.hex)}
                    ></span>
                    <figcaption>
                      {n.nameKo}
                      {#if n.educationColorName}
                        <span class="tone-edu">{n.educationColorName}</span>
                      {/if}
                    </figcaption>
                  </figure>
                {/each}
              </div>
            {:else}
              <p class="caption">이 색에서는 비슷한 톤 예시를 표시할 수 없어요.</p>
            {/if}
          {/if}
        </div>
      </div>

      <p class="caption caption-guide act1-layout-note">위 내용은 활동 1에서 고른 색·톤에 맞춰 바뀝니다.</p>
    </section>
  {/if}

    <section class="activity card" aria-labelledby="learn-act2">
      <p class="step-badge">STEP 2 · 활동 2</p>
      <h2 id="learn-act2" class="activity-title">색이 전하는 이미지 비교하기</h2>
      <p class="act2-lead">같은 색도 톤에 따라 느낌이 달라질까요?</p>
      <p class="caption caption-guide act2-guide">
       색의 분위기가 어떻게 달라지는지 살펴보세요. 색을 고른 이유를 생각하며 내 브랜드와 더 가까운 쪽을
      선택해 보세요.
      </p>
      {#if brandDirection}
        <div class="act2-brand-ref">
          <p class="act2-brand-ref-label">색을 고른 이유</p>
          <p class="act2-keyword-reason">{brandDirection}</p>
        </div>
      {/if}

      <div class="act2-color-nav" aria-labelledby="act2-nav-heading">
        <div class="act2-progress-head">
          <div class="act2-nav-title-block">
            <h3 id="act2-nav-heading" class="act2-progress-label">1단계 색과 비교 후 선택 · 한눈에 보기</h3>
            {#if act2Pick}
              <p class="act2-nav-current-name">
                <span class="act2-nav-current-badge">비교 중</span>
                {pickChipColorName(act2Pick)} · {pickChipToneLine(act2Pick)}
              </p>
            {/if}
          </div>
          <span class="act2-progress-count tabular" aria-live="polite">
            <span class="sr-only">현재 </span>{act2CurrentStep} / {picks.length}
          </span>
        </div>
        <ul class="act2-nav-legend" aria-hidden="true">
          <li><span class="legend-chip legend-current"></span> 비교 중</li>
          <li><span class="legend-chip legend-explored"></span> 선택완료</li>
          <li><span class="legend-chip legend-pending"></span> 미탐색</li>
        </ul>
        <div class="act2-dual-gauge-layout">
          <div class="act2-gauge-rowlabels" aria-hidden="true">
            <span>1단계에서 고른 색</span>
            <span>비교 후 선택</span>
          </div>
          <div
            class="act2-nav-bar"
            role="tablist"
            aria-label="1단계 색과 비교 후 선택 이동"
            style:grid-template-columns="repeat({picks.length}, 1fr)"
          >
            {#each picks as pick, index (brandImagePickKey(pick))}
              {@const key = brandImagePickKey(pick)}
              {@const record = learnRecordForKey(store.project.learn, key)}
              {@const choice = compareChoiceGaugeForPick(pick, record)}
              {@const current = act2PickKey === key}
              {@const explored = record.imageCompareSide !== null}
              <button
                type="button"
                role="tab"
                class="act2-nav-seg-btn"
                class:current
                class:explored
                class:pending={!explored && !current}
                aria-selected={current}
                aria-label="{index + 1}번째 {pickChipColorName(pick)}, 1단계 {pick.hex}{choice.empty ? '' : `, 비교 후 ${choice.hex}`}{current ? ', 비교 중' : explored ? ', 선택완료' : ', 미탐색'}"
                onclick={() => selectAct2Pick(key)}
              >
                <div class="act2-gauge-pair">
                  <span class="act2-nav-seg-wrap act2-gauge-fixed">
                    <span
                      class="act2-nav-seg-fill color-chip"
                      class:light={needsPickSwatchHairline(pick.hex)}
                      style:background={pick.hex}
                    ></span>
                  </span>
                  <span
                    class="act2-nav-seg-wrap act2-gauge-choice"
                    class:empty={choice.empty}
                  >
                    {#if choice.empty}
                      <span class="act2-nav-seg-placeholder" aria-hidden="true">—</span>
                    {:else}
                      <span
                        class="act2-nav-seg-fill color-chip"
                        class:light={needsPickSwatchHairline(choice.hex!)}
                        style:background={choice.hex}
                      ></span>
                      {#if explored && !current}
                        <span class="act2-nav-check" aria-hidden="true">✓</span>
                      {/if}
                    {/if}
                  </span>
                </div>
                <span class="act2-nav-seg-label">{pickChipColorName(pick)}</span>
                {#if current}
                  <span class="act2-nav-state state-current">비교 중</span>
                {:else if explored}
                  <span class="act2-nav-state state-explored">선택완료</span>
                {:else}
                  <span class="act2-nav-state state-pending">미탐색</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
        <p class="caption caption-guide act2-nav-hint">
          위·아래 막대를 비교해 보세요. 막대를 누르면 해당 색으로 이동합니다. 선택완료 {act2ExploredCount}개 ·
          미탐색 {picks.length - act2ExploredCount}개
        </p>
        <p class="caption caption-guide act2-progress-note">모든 색을 비교하지 않아도 다음 단계로 이동할 수 있어요.</p>
      </div>

      {#if compareMine && compareOther && act2PickKey && act2Record}
        {#if compareToneOptions.length > 1}
          <div class="compare-tone-picker" role="group" aria-label="비교할 톤 선택">
            <p class="compare-tone-picker-label">같은 색 계열 · 다른 톤</p>
            <div class="compare-tone-buttons">
              {#each compareToneOptions as opt (opt.toneId)}
                <button
                  type="button"
                  class="compare-tone-btn"
                  class:active={effectiveCompareToneId === opt.toneId}
                  aria-pressed={effectiveCompareToneId === opt.toneId}
                  aria-label="{opt.toneLabelKo} 톤 {opt.hex}"
                  onclick={() => selectCompareTone(opt.toneId)}
                >
                  <span
                    class="compare-tone-swatch color-chip color-chip--hairline-border"
                    style:background={opt.hex}
                    class:light={needsPickSwatchHairline(opt.hex)}
                    aria-hidden="true"
                  ></span>
                  <span class="compare-tone-btn-label">{opt.toneLabelKo}</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}
        <div class="compare-grid">
          <button
            type="button"
            class="compare-card"
            class:chosen={act2Record.imageCompareSide === 'mine'}
            aria-pressed={act2Record.imageCompareSide === 'mine'}
            onclick={() => patchAct2Record({ imageCompareSide: 'mine' })}
          >
            <span class="compare-label">내가 고른 색</span>
            <div class="compare-swatch-wrap">
              <span
                class="compare-swatch color-chip"
                style:background={compareMine.hex}
                class:light={needsPickSwatchHairline(compareMine.hex)}
              ></span>
              <span class="compare-swatch-bar">
                <span class="compare-swatch-tone">{compareMine.toneLine}</span>
                <span class="compare-swatch-hex tabular">{compareMine.hex.toUpperCase()}</span>
              </span>
            </div>
            <span class="compare-name">{compareMine.colorName}</span>
            {#if act2Record.imageCompareSide === 'mine'}<span class="pick-badge">✓ 선택</span>{/if}
          </button>
          <button
            type="button"
            class="compare-card"
            class:chosen={act2Record.imageCompareSide === 'other'}
            aria-pressed={act2Record.imageCompareSide === 'other'}
            onclick={() => patchAct2Record({ imageCompareSide: 'other' })}
          >
            <span class="compare-label">비교할 색</span>
            <div class="compare-swatch-wrap">
              <span
                class="compare-swatch color-chip"
                style:background={compareOther.hex}
                class:light={needsPickSwatchHairline(compareOther.hex)}
              ></span>
              <span class="compare-swatch-bar">
                <span class="compare-swatch-tone">{compareOther.toneLine}</span>
                <span class="compare-swatch-hex tabular">{compareOther.hex.toUpperCase()}</span>
              </span>
            </div>
            <span class="compare-name">{compareOther.colorName}</span>
            {#if compareOther.imageHintLine}
              <p class="caption compare-hint">참고: {compareOther.imageHintLine}</p>
            {/if}
            {#if act2Record.imageCompareSide === 'other'}<span class="pick-badge">✓ 선택</span>{/if}
    </button>
        </div>
        <p class="caption caption-guide act2-perception">{IMAGE_COMPARE_PERCEPTION_NOTE}</p>
        <fieldset class="act2-choice">
          <legend class="act2-choice-legend">어느 색이 내 브랜드가 전하고 싶은 이미지와 더 가까운가요?</legend>
          <div class="act2-choice-options" role="radiogroup" aria-label="브랜드 이미지에 더 가까운 색">
            <label class="act2-choice-option">
              <input
                type="radio"
                name="compare-side-{act2PickKey}"
                checked={act2Record.imageCompareSide === 'mine'}
                onchange={() => patchAct2Record({ imageCompareSide: 'mine' })}
              />
              내가 고른 색
            </label>
            <label class="act2-choice-option">
              <input
                type="radio"
                name="compare-side-{act2PickKey}"
                checked={act2Record.imageCompareSide === 'other'}
                onchange={() => patchAct2Record({ imageCompareSide: 'other' })}
              />
              비교할 색
      </label>
          </div>
        </fieldset>
      {:else if act2Pick}
        <p class="caption caption-guide act2-unavailable">
          이 색은 톤 비교 예시를 만들 수 없어요. 다른 색을 고르거나 활동 1의 밝기·비슷한 톤으로 관찰해 보세요.
        </p>
      {/if}

    </section>
    {/if}

<style>
  .screen-lede {
    margin-bottom: 20px;
  }
  .brand-context.card {
    --brand-context-label-col: minmax(6.5rem, max-content);
    margin-bottom: 20px;
    padding: 22px 24px 24px;
    background: var(--canvas-soft);
    border-left: 4px solid var(--primary);
  }
  .brand-context .section-eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: normal;
    text-transform: none;
    color: var(--primary);
  }
  .brand-context-head {
    margin: 0;
  }
  .brand-context:has(.brand-context-block) .brand-context-head {
    padding-bottom: 18px;
    border-bottom: 1px solid var(--hairline);
  }
  .brand-name {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.25;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .brand-context-block {
    padding: 18px 0;
  }
  .brand-context-block:not(:last-child) {
    border-bottom: 1px solid var(--hairline);
  }
  .brand-context-row {
    display: grid;
    grid-template-columns: var(--brand-context-label-col) minmax(0, 1fr);
    gap: 10px 18px;
    align-items: start;
    justify-items: start;
  }
  .brand-context-row-text {
    align-items: start;
  }
  .brand-field {
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .brand-field-inline {
    display: contents;
  }
  .brand-field-inline dt {
    grid-column: 1;
  }
  .brand-field-inline dd {
    grid-column: 2;
    font-weight: 500;
  }
  .brand-field dt {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
    white-space: nowrap;
  }
  .brand-field dd {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--ink);
  }
  .brand-context-row .apply-ref {
    margin: 0;
    display: flex;
    justify-content: flex-start;
    align-self: start;
    width: 100%;
  }
  .brand-context-row :global(.apply-ref-media) {
    width: min(100%, 240px);
  }
  @media (max-width: 520px) {
    .brand-context-row {
      grid-template-columns: 1fr;
      align-items: start;
    }
    .brand-context-row .apply-ref {
      justify-content: flex-start;
    }
    .brand-field-inline dt,
    .brand-field-inline dd {
      grid-column: auto;
    }
    .brand-context-row-text .brand-field-inline {
      display: grid;
      gap: 8px;
    }
  }
  .pick-section {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid var(--hairline);
    border-radius: 12px;
    background: var(--stage);
  }
  .pick-section-title {
    margin: 0 0 6px;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
  }
  .pick-section-hint {
    margin: 0 0 14px;
    font-size: 13px;
  }
  .pick-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .pick-card {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 160px;
    max-width: 100%;
    padding: 10px 12px;
    border: 2px solid var(--hairline);
    border-radius: 12px;
    background: var(--canvas);
    text-align: left;
    cursor: pointer;
  }
  .pick-card.selected {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }
  .pick-swatch {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: none;
    flex-shrink: 0;
  }
  .pick-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pick-line {
    font-size: 13px;
    line-height: 1.35;
    color: var(--ink);
  }
  .pick-color-name {
    font-size: 14px;
    font-weight: 600;
  }
  .pick-tone {
    font-weight: 500;
    color: var(--ink-mute);
  }
  .pick-hex {
    font-size: 12px;
    font-weight: 400;
    color: var(--ink-mute);
    letter-spacing: 0.02em;
  }
  .activity h2:not(.activity-title) {
    margin: 0 0 10px;
    padding-bottom: 10px;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
    border-bottom: 1px solid var(--hairline);
  }
  .activity h3 {
    margin: 18px 0 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }
  .activity-act1 {
    margin-bottom: 24px;
    padding: 20px 18px 22px;
    background: var(--stage);
    border: 1px solid var(--hairline);
    border-radius: 16px;
  }
  .act1-lede {
    margin: 0 0 20px;
    font-size: 15px;
    color: var(--ink-mute);
    line-height: 1.45;
  }
  .hero-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 200px;
    padding: 22px 18px 20px;
    border-radius: 16px;
    border: none;
    margin-bottom: 10px;
    box-shadow: 0 10px 28px rgba(13, 37, 61, 0.12);
  }
  .hero-meta {
    margin: 0;
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    opacity: 0.92;
  }
  .hero-adj {
    margin: 8px 0 4px;
    width: 100%;
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    word-break: keep-all;
  }
  .hero-adj-pills {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }
  .hero-adj-pill {
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    backdrop-filter: blur(6px);
  }
  .color-name-block {
    margin-bottom: 22px;
  }
  .color-name-table-shell {
    border: 1px solid var(--hairline);
    border-radius: 12px;
    overflow: hidden;
    background: var(--stage);
  }
  .color-name-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
    line-height: 1.45;
  }
  .color-name-table th,
  .color-name-table td {
    border: 1px solid var(--hairline);
    vertical-align: top;
    text-align: left;
  }
  .color-name-table th {
    width: 1%;
    min-width: 10.5rem;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-mute);
    background: var(--canvas);
    white-space: nowrap;
  }
  .color-name-table td {
    padding: 10px 12px;
    color: var(--ink);
    font-weight: 500;
    background: #f6f9fc;
  }
  .color-name-note-row td {
    font-weight: 400;
  }
  .color-name-hint {
    margin: 0;
    font-size: 14px;
    color: var(--ink-mute);
    line-height: 1.45;
  }
  .color-hex-note {
    margin: 8px 0 0;
    font-size: 11px;
    line-height: 1.45;
  }
  .color-info-concept p {
    margin: 0 0 8px;
    font-weight: 400;
    line-height: 1.45;
  }
  .color-info-concept p:last-child {
    margin-bottom: 0;
  }
  .concept-block {
    display: inline-block;
    margin: 0 2px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--canvas);
    border: 1px solid var(--hairline);
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.35;
    vertical-align: baseline;
  }
  .learn-tools-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }
  .tool-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid var(--hairline);
    background: var(--canvas);
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-mute);
    cursor: pointer;
  }
  .tool-tab[aria-selected='true'] {
    border-color: var(--primary);
    background: var(--canvas);
    color: var(--primary);
    font-weight: 600;
    box-shadow: 0 0 0 1px var(--primary);
  }
  .tool-icon {
    font-size: 14px;
    line-height: 1;
  }
  .learn-tools-panel {
    padding: 14px;
    border-radius: 12px;
    background: var(--canvas);
    border: 1px solid var(--hairline);
    min-height: 100px;
  }
  .act1-layout-note {
    margin: 16px 0 0;
    text-align: center;
  }
  .tone-edu {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-mute);
    line-height: 1.3;
  }
  .swatch-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .swatch-row figure {
    margin: 0;
    flex: 1 1 80px;
    max-width: 120px;
    text-align: center;
  }
  .activity-act1 .mini-swatch {
    display: block;
    width: 100%;
    aspect-ratio: 10 / 7;
    border-radius: 8px;
    border: none;
    margin-bottom: 6px;
  }
  .mini-swatch {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    border: none;
    margin-bottom: 6px;
  }
  figcaption {
    font-size: 11px;
    color: var(--ink-mute);
    line-height: 1.3;
  }
  .compare-grid {
    display: grid;
    gap: 12px;
    margin-top: 12px;
  }
  @media (min-width: 640px) {
    .compare-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .compare-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 14px;
    border: 2px solid var(--hairline);
    border-radius: 12px;
    background: var(--canvas-soft);
    text-align: left;
    cursor: pointer;
  }
  .compare-card.chosen {
    border-color: var(--primary);
  }
  .act2-color-nav {
    margin-top: 16px;
    padding: 14px 14px 12px;
    border-radius: 12px;
    background: var(--canvas-soft);
    border: 1px solid var(--hairline);
  }
  .act2-nav-title-block {
    min-width: 0;
  }
  .act2-nav-current-name {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin: 6px 0 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.35;
  }
  .act2-nav-current-badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    color: var(--primary);
    background: rgba(83, 58, 253, 0.1);
    border: 1px solid rgba(83, 58, 253, 0.35);
  }
  .act2-nav-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    font-size: 11px;
    color: var(--ink-mute);
  }
  .act2-nav-legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .legend-chip {
    width: 20px;
    height: 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .legend-chip.legend-current {
    background: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }
  .legend-chip.legend-explored {
    background: linear-gradient(90deg, #6b7280 0%, #9ca3af 100%);
    border: 1px solid var(--ink-mute);
  }
  .legend-chip.legend-pending {
    background: var(--hairline);
    border: 1px dashed var(--ink-mute);
  }
  .act2-dual-gauge-layout {
    display: grid;
    grid-template-columns: minmax(4.5rem, auto) 1fr;
    gap: 8px 10px;
    align-items: start;
    margin-top: 12px;
  }
  .act2-gauge-rowlabels {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 6px;
    font-size: 10px;
    font-weight: 600;
    color: var(--ink-mute);
    line-height: 1.2;
  }
  .act2-gauge-rowlabels span {
    display: flex;
    align-items: center;
    min-height: 22px;
  }
  .act2-gauge-pair {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .act2-nav-seg-wrap.act2-gauge-fixed {
    border: none;
    box-shadow: none;
    background: transparent;
  }
  .act2-nav-seg-wrap.act2-gauge-fixed .act2-nav-seg-fill {
    opacity: 1;
  }
  .act2-nav-bar {
    display: grid;
    gap: 10px;
    margin-top: 0;
    min-width: 0;
  }
  .act2-nav-seg-wrap.act2-gauge-choice:not(.empty) {
    border: none;
    box-shadow: none;
    background: transparent;
  }
  .act2-nav-seg-wrap.act2-gauge-choice:not(.empty) .act2-nav-seg-fill {
    opacity: 1;
  }
  .act2-nav-seg-wrap.act2-gauge-choice.empty {
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .act2-nav-seg-placeholder {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-mute);
    line-height: 1;
    pointer-events: none;
  }
  .act2-nav-seg-btn {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 6px 4px 4px;
    border: 2px solid transparent;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    text-align: center;
  }
  .act2-nav-seg-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .act2-nav-seg-btn.current {
    border-color: var(--primary);
    background: rgba(83, 58, 253, 0.06);
  }
  .act2-nav-seg-wrap {
    position: relative;
    display: block;
    width: 100%;
    height: 22px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--hairline);
  }
  .act2-nav-seg-wrap.pending {
    border: 1px dashed var(--ink-mute);
    background: var(--canvas);
  }
  .act2-nav-seg-wrap.pending .act2-nav-seg-fill {
    opacity: 0.42;
  }
  .act2-nav-seg-wrap.explored:not(.current) {
    border: 1px solid var(--ink-mute);
  }
  .act2-nav-seg-wrap.explored .act2-nav-seg-fill {
    opacity: 1;
  }
  .act2-nav-seg-wrap.current {
    box-shadow: inset 0 0 0 2px var(--primary);
    border: 1px solid var(--primary);
    background: var(--canvas-soft);
  }
  .act2-nav-seg-wrap.current .act2-nav-seg-fill {
    opacity: 1;
  }
  .act2-nav-seg-fill {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
  .act2-nav-check {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    color: #fff;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.65);
    pointer-events: none;
  }
  .act2-nav-seg-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .act2-nav-seg-btn.pending .act2-nav-seg-label {
    color: var(--ink-mute);
    font-weight: 500;
  }
  .act2-nav-state {
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
  }
  .act2-nav-state.state-current {
    color: var(--primary);
  }
  .act2-nav-state.state-explored {
    color: var(--ink-mute);
  }
  .act2-nav-state.state-pending {
    color: var(--ink-mute);
    font-weight: 500;
  }
  .act2-nav-hint {
    margin: 12px 0 0;
  }
  .pick-section-for {
    color: var(--primary);
    font-weight: 600;
  }
  .compare-swatch-wrap {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--hairline);
  }
  .compare-swatch {
    display: block;
    width: 100%;
    height: 112px;
    border-radius: 0;
    border: none;
  }
  .compare-swatch-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 10px;
    padding: 8px 10px;
    background: var(--canvas);
  }
  .compare-swatch-tone {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.35;
  }
  .compare-swatch-hex {
    font-size: 11px;
    color: var(--ink-mute);
  }
  .compare-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .compare-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.35;
  }
  .compare-hint {
    margin: 0;
  }
  .pick-badge {
    margin-top: 2px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--primary);
  }
  .act2-lead {
    margin: 8px 0 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
  }
  .act2-guide {
    margin-top: 6px;
  }
  .act2-brand-ref {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--canvas-soft);
    border-left: 4px solid var(--primary);
  }
  .act2-brand-ref-label {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .act2-keyword-reason {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.45;
  }
  .compare-tone-picker {
    margin-top: 14px;
  }
  .compare-tone-picker-label {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .compare-tone-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .compare-tone-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 6px 12px 6px 6px;
    border-radius: 999px;
    border: 2px solid var(--hairline);
    background: var(--canvas);
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
  }
  .compare-tone-swatch {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: none;
    flex-shrink: 0;
  }
  .compare-tone-btn-label {
    line-height: 1.25;
  }
  .compare-tone-btn.active {
    border-color: var(--primary);
    background: var(--canvas-soft);
  }
  .act2-unavailable {
    margin-top: 12px;
  }
  .act2-perception {
    margin-top: 10px;
  }
  .act2-choice {
    margin: 14px 0 0;
    padding: 0;
    border: 0;
  }
  .act2-choice-legend {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 10px;
    padding: 0;
  }
  .act2-choice-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .act2-choice-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }
  .act2-progress-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .act2-progress-label {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }
  .act2-progress-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .act2-progress-note {
    margin: 8px 0 0;
  }
  .empty-state {
    padding: 20px;
  }
</style>
