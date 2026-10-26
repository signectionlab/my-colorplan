<script lang="ts">
  import BrandMoodboardPanel from '../components/BrandMoodboardPanel.svelte'
  import PaletteBarSegments from '../components/PaletteBarSegments.svelte'
  import ReviewPaletteColorRow from '../components/ReviewPaletteColorRow.svelte'
  import {
    REVIEW_BRAND_IMAGE_FEEL_LABEL,
    REVIEW_BRAND_IMAGE_FEEL_OPTIONS,
    REVIEW_USAGE_PLACE_OPTIONS,
    REVIEW_USAGE_REASON_OPTIONS,
    reviewPaletteRows,
  } from '../data/review-activities'
  import { applyFieldDisplayText } from '../domain/apply-field'
  import { brandImageLabels } from '../domain/brand-image'
  import { pickSummaryLabel } from '../domain/learn-brand-pick'
  import { paletteAccentSlotHexes, paletteBarSegmentsForDisplay } from '../domain/palette-preview-context'
  import { buildMissingUsageSelections } from '../domain/review-normalize'
  import type { ReviewBrandImageFeel } from '../types/project'
  import {
    store,
    patchReview,
    patchReviewUsagePlace,
    goTo,
  } from '../state/project-state.svelte'

  $effect(() => {
    const built = buildMissingUsageSelections(brand, palette, review.usageSelections)
    if (built) patchReview({ usageSelections: built })
  })

  const brand = $derived(store.project.brand)
  const palette = $derived(store.project.palette)
  const review = $derived(store.project.review)
  const applySummary = $derived(applyFieldDisplayText(brand))
  const imageKeywords = $derived(brandImageLabels(brand))
  const barSegments = $derived(paletteBarSegmentsForDisplay(brand, palette))
  const accentSlots = $derived(paletteAccentSlotHexes(brand, palette))
  const paletteRows = $derived(reviewPaletteRows(brand, palette))

  const wantsPaletteAdjust = $derived(
    review.brandImageFeel === 'different' ||
      review.imageFit.includes('비율') ||
      review.imageFit.includes('조절'),
  )

  function setBrandImageFeel(feel: ReviewBrandImageFeel) {
    patchReview({
      brandImageFeel: feel,
      imageFit: REVIEW_BRAND_IMAGE_FEEL_LABEL[feel],
    })
  }

</script>

<section class="activity card moodboard-block" aria-labelledby="review-moodboard">
  <p class="step-badge">STEP 5 · 적용과 점검</p>
  <header class="moodboard-head">
    <h2 id="review-moodboard" class="activity-title">내 브랜드 컬러 적용 결과</h2>
    <p class="activity-lede">
      {brand.name.trim() || '내 브랜드'}
      <span class="head-field">
        · {#if applySummary}{applySummary}{:else}범용 목업{/if}
      </span>
    </p>
    <PaletteBarSegments segments={barSegments} label="팔레트 % · 역할" />
  </header>

  <BrandMoodboardPanel
    panelLabel="내 브랜드 컬러 적용 결과"
    applyFieldId={brand.applyFieldId}
    primaryHex={palette.colors[0].hex}
    secondaryHex={palette.colors[1].hex}
    accent1Hex={accentSlots[0]}
    accent2Hex={accentSlots[1]}
    accent3Hex={accentSlots[2]}
  />
</section>

<section class="activity card" aria-labelledby="review-act1">
  <p class="step-badge">STEP 5 · 활동 1</p>
  <h2 id="review-act1" class="activity-title">브랜드 이미지 확인</h2>
  <p class="question">내가 표현하고 싶은 브랜드 이미지가 잘 느껴지나요?</p>

  {#if brand.imagePicks.length}
    <div class="brand-color-context" aria-label="1단계에서 고른 브랜드 이미지 색">
      <p class="keyword-label">1단계 브랜드 이미지 색</p>
      <ul class="brand-pick-list">
        {#each brand.imagePicks as pick (pick.hueId + pick.toneId)}
          <li>
            <ReviewPaletteColorRow name={pickSummaryLabel(pick)} hex={pick.hex} />
          </li>
        {/each}
      </ul>
    </div>
  {:else if imageKeywords.length}
    <div class="brand-color-context caption">
      <p class="keyword-label">1단계 이미지 키워드</p>
      <p class="keyword-text">{imageKeywords.join(' · ')}</p>
    </div>
  {/if}

  <fieldset class="choice-fieldset">
    <legend class="sr-only">브랜드 이미지 느낌</legend>
    {#each REVIEW_BRAND_IMAGE_FEEL_OPTIONS as option (option.id)}
      <label class="choice-option">
        <input
          type="radio"
          name="review-brand-feel"
          value={option.id}
          checked={review.brandImageFeel === option.id}
          onchange={() => setBrandImageFeel(option.id)}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </fieldset>

  {#if review.brandImageFeel}
    <div class="follow-up" aria-labelledby="review-key-color-q">
      <p id="review-key-color-q" class="question sub">어떤 색이 그 이미지를 만드는 데 가장 큰 역할을 하나요?</p>
      <div class="color-pick-grid" role="radiogroup" aria-label="핵심 색 선택">
        {#each paletteRows as row (row.id)}
          <label class="color-pick">
            <input
              type="radio"
              name="review-key-color"
              value={row.id}
              checked={review.keyColorRowId === row.id}
              onchange={() => patchReview({ keyColorRowId: row.id })}
            />
            <ReviewPaletteColorRow
              name={row.name}
              hex={row.hex}
              roleLabel={row.roleLabel}
              widthPct={row.widthPct}
            />
          </label>
        {/each}
      </div>
    </div>
  {/if}

  {#if wantsPaletteAdjust}
    <button type="button" class="btn btn-ghost btn-sm adjust-btn" onclick={() => goTo('palette')}>
      4단계에서 색·비율 수정하기
    </button>
  {/if}
</section>

<section class="activity card" aria-labelledby="review-act2">
  <p class="step-badge">STEP 5 · 활동 2</p>
  <h2 id="review-act2" class="activity-title">브랜드 활용 계획</h2>
  <p class="question">내 브랜드에서 각 색을 어디에 활용하고 싶나요?</p>

  {#each paletteRows as row (row.id)}
    <div class="usage-row">
      <ReviewPaletteColorRow
        name={row.name}
        hex={row.hex}
        roleLabel={row.roleLabel}
        widthPct={row.widthPct}
      />
      <div class="place-chips">
        {#each REVIEW_USAGE_PLACE_OPTIONS as place (place)}
          {@const selected = (review.usageSelections[row.id] ?? []).includes(place)}
          <label class="place-chip" class:selected>
            <input
              type="checkbox"
              checked={selected}
              onchange={(e) => patchReviewUsagePlace(row.id, place, e.currentTarget.checked)}
            />
            <span>{place}</span>
          </label>
        {/each}
      </div>
    </div>
  {/each}

  <p class="question sub">이렇게 색을 사용하려는 이유는 무엇인가요?</p>
  <fieldset class="choice-fieldset">
    <legend class="sr-only">활용 이유</legend>
    {#each REVIEW_USAGE_REASON_OPTIONS as option (option.id)}
      <label class="choice-option">
        <input
          type="radio"
          name="review-usage-reason"
          value={option.id}
          checked={review.usageReasonChoice === option.id}
          onchange={() => patchReview({ usageReasonChoice: option.id })}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </fieldset>

  {#if review.usageReasonChoice === 'custom'}
    <label class="custom-reason">
      <span class="sr-only">직접 입력</span>
      <textarea
        rows="1"
        placeholder="이유를 적어 주세요"
        value={review.usageReasonCustom}
        oninput={(e) => patchReview({ usageReasonCustom: e.currentTarget.value })}
      ></textarea>
    </label>
  {/if}

  <p class="footer-hint caption caption-guide">이전·다음 단계는 화면 아래 버튼으로 이동할 수 있어요.</p>
</section>

<style>
  .moodboard-block {
    padding-bottom: 20px;
  }
  .moodboard-head {
    margin-bottom: 16px;
  }
  .head-field {
    color: var(--ink-mute);
    font-weight: 500;
  }
  .question {
    margin: 0 0 14px;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.45;
  }
  .question.sub {
    margin-top: 20px;
    font-size: 0.95rem;
  }
  .brand-color-context {
    margin: 0 0 14px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: var(--canvas-soft);
    border: 1px solid var(--hairline);
  }
  .keyword-label {
    margin: 0 0 10px;
    font-weight: 600;
    color: var(--ink-mute);
    font-size: 13px;
  }
  .keyword-text {
    margin: 0;
  }
  .brand-pick-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .choice-fieldset {
    margin: 0;
    padding: 0;
    border: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .choice-option {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-md);
    background: var(--canvas-soft);
    cursor: pointer;
    font-size: 15px;
    line-height: 1.4;
  }
  .choice-option:has(input:checked) {
    border-color: var(--primary);
    background: #f8f6ff;
  }
  .choice-option input {
    margin-top: 3px;
    flex-shrink: 0;
  }
  .follow-up {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px dashed var(--hairline);
  }
  .color-pick-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .color-pick {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  .color-pick:has(input:checked) {
    border-color: var(--primary);
    background: #f8f6ff;
  }
  .color-pick input {
    flex-shrink: 0;
  }
  .color-pick :global(.review-color-row) {
    flex: 1;
    min-width: 0;
  }
  .usage-row {
    margin-bottom: 18px;
    padding-bottom: 16px;
    border-bottom: 1px dashed var(--hairline);
  }
  .usage-row:last-of-type {
    border-bottom: none;
  }
  .usage-row :global(.review-color-row) {
    margin-bottom: 10px;
  }
  .place-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .place-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border: 1px solid var(--hairline);
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    background: var(--canvas);
  }
  .place-chip.selected,
  .place-chip:has(input:checked) {
    border-color: var(--primary);
    background: #f8f6ff;
  }
  .place-chip input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .custom-reason {
    display: block;
    margin-top: 10px;
  }
  .custom-reason textarea {
    width: 100%;
    font: inherit;
    font-size: 13px;
    line-height: 1.45;
    padding: 5px 8px;
    min-height: 1.875rem;
    max-height: 4.5rem;
    resize: vertical;
    border: 1px solid var(--hairline);
    border-radius: 8px;
  }
  .adjust-btn {
    margin-top: 14px;
  }
  .footer-hint {
    margin: 18px 0 0;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
