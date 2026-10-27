<script lang="ts">
  import AppCopyright from '../components/AppCopyright.svelte'
  import ApplyFieldRecolorHero from '../components/ApplyFieldRecolorHero.svelte'
  import ApplyFieldReferenceImage from '../components/ApplyFieldReferenceImage.svelte'
  import BrandMoodboardPanel from '../components/BrandMoodboardPanel.svelte'
  import PlanColorTagRow from '../components/PlanColorTagRow.svelte'
  import StepHero from '../components/StepHero.svelte'
  import { APPLY_FIELD_BY_ID } from '../data/apply-fields'
  import { applyFieldRecolorAssets, hasApplyFieldRecolor } from '../data/apply-field-recolor'
  import {
    applyFieldReferenceImageSrc,
    isApplyFieldReferenceId,
  } from '../data/apply-field-reference-image'
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import { applyFieldDisplayText } from '../domain/apply-field'
  import { draftSignature } from '../domain/draft-template'
  import {
    PLAN_BLANK,
    PLAN_DECISION_OPTIONS,
    planDecisionStepNumber,
    needsPlanFactReview,
    planColorTags,
    planFieldPlaceholder,
    planView,
    type PlanEditable,
    type PlanVisibleSectionId,
  } from '../domain/plan-document'
  import { paletteAccentSlotHexes, paletteBarSegmentsForDisplay } from '../domain/palette-preview-context'
  import { copyPlan, downloadPlanMarkdown, downloadProjectJson } from '../services/project-export'
  import {
    acknowledgePlanFacts,
    goTo,
    patchPlan,
    setPlanFieldEdit,
    store,
  } from '../state/project-state.svelte'
  import type { PlanDecision } from '../types/project'

  const GUIDE_TABS = [
    {
      id: 'area',
      label: '색의 사용 면적',
      body: '넓은 면적에 쓰는 색은 브랜드의 전체 분위기를 크게 바꿉니다. 주조색은 보통 그 넓은 면에 해당합니다.',
      question: '현재 주조색이 내가 원하는 브랜드 분위기를 잘 표현하고 있나요?',
    },
    {
      id: 'role',
      label: '색의 역할',
      body: '주조색은 바탕과 분위기, 보조색은 주조색을 받치는 면, 강조색은 버튼이나 중요 정보처럼 시선이 머무는 작은 면에 씁니다.',
      question: '중요한 부분에 강조색을 적절하게 활용했나요?',
    },
    {
      id: 'contrast',
      label: '색의 대비',
      body: '글자와 배경의 밝기 차이가 클수록 정보가 읽히기 쉽습니다. 웹에서는 브랜드색만으로 글자를 쓰면 구분이 어려울 수 있습니다.',
      question: '중요한 정보가 배경과 잘 구분되어 보이나요?',
    },
  ] as const

  const brand = $derived(store.project.brand)
  const palette = $derived(store.project.palette)
  const review = $derived(store.project.review)
  const plan = $derived(store.project.plan)
  const applyField = $derived(applyFieldDisplayText(brand))
  const barSegments = $derived(paletteBarSegmentsForDisplay(brand, palette))
  const accentSlots = $derived(paletteAccentSlotHexes(brand, palette))
  const sections = $derived(planView(store.project))
  const sectionMap = $derived(Object.fromEntries(sections.map((section) => [section.id, section])) as Record<
    PlanVisibleSectionId,
    (typeof sections)[number]
  >)
  const barForPlan = $derived(
    barSegments.map((segment, index) => {
      const tags = planColorTags(brand, segment.hex, segment.name, segment.roleLabel, segment.widthPct)
      return {
        ...segment,
        name: tags.find((tag) => tag.label === '색명')?.value || segment.name,
        pctLabel: tags.find((tag) => tag.label === '비율')?.value ?? `${segment.widthPct}%`,
      }
    }),
  )
  const factReview = $derived(needsPlanFactReview(store.project))
  const legacyStale = $derived(
    plan.edited &&
      Boolean(plan.text.trim()) &&
      plan.sourceSignature !== draftSignature(store.project) &&
      Object.keys(plan.fieldEdits).length === 0 &&
      Object.keys(plan.sectionEdits).length === 0,
  )
  const preChecks = $derived([
    {
      label: '브랜드 이미지와 색상 선택 확인',
      done: Boolean(brand.name.trim() && brand.imagePicks.length),
    },
    {
      label: '주조색·보조색·강조색 비율 확인',
      done: palette.ratios.reduce((sum, ratio) => sum + ratio, 0) === 100,
    },
    {
      label: '브랜드 적용 결과 확인',
      done: Boolean(review.brandImageFeel || review.usageReasonChoice || review.keyColorRowId),
    },
  ])
  const checksComplete = $derived(preChecks.every((item) => item.done))

  let guideTab = $state<(typeof GUIDE_TABS)[number]['id']>('area')
  let copied = $state(false)
  let toast = $state('')
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  const activeGuide = $derived(GUIDE_TABS.find((tab) => tab.id === guideTab) ?? GUIDE_TABS[0])
  const brandTitle = $derived(brand.name.trim() || '나의 색채계획서')
  const docSubtitle = $derived(applyField || '브랜드 컬러디자인 계획서')
  const applyFieldReferenceId = $derived(
    isApplyFieldReferenceId(brand.applyFieldId) ? brand.applyFieldId : null,
  )
  const applyFieldReferenceTitle = $derived(
    applyFieldReferenceId ? APPLY_FIELD_BY_ID[applyFieldReferenceId].title : '',
  )
  const showApplyFieldPlanImage = $derived.by(() => {
    const id = applyFieldReferenceId
    if (!id) return false
    if (hasApplyFieldRecolor(id)) return applyFieldRecolorAssets(id) !== null
    return applyFieldReferenceImageSrc(id) !== null
  })

  function showToast(message: string) {
    toast = message
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast = ''
    }, 2700)
  }

  function chooseDecision(id: PlanDecision) {
    patchPlan({ decision: id })
    const target = PLAN_DECISION_OPTIONS.find((option) => option.id === id)?.navigateTo
    if (target) {
      goTo(target)
      return
    }
    document.getElementById('plan-document')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function saveField(field: PlanEditable, value: string) {
    if (field.storage === 'memo') patchPlan({ memo: value })
    else setPlanFieldEdit(field.key, value)
  }

  async function copyPlanText() {
    copied = await copyPlan(store.project)
    showToast(copied ? '계획서 내용이 복사되었습니다.' : '복사에 실패했습니다.')
  }
</script>

<div class="plan-step">
  <div class="plan-toolbar no-print" aria-label="계획서 내보내기">
    <strong>STEP 6 · 계획서 저장</strong>
    <button class="plan-btn" type="button" onclick={copyPlanText}>{copied ? '복사됨' : '내용 복사'}</button>
    <button class="plan-btn" type="button" onclick={() => downloadPlanMarkdown(store.project)}>Markdown</button>
    <button class="plan-btn" type="button" onclick={() => downloadProjectJson(store.project)}>JSON</button>
    <button class="plan-btn plan-btn-primary" type="button" onclick={() => window.print()}>PDF로 저장</button>
  </div>

  <div class="plan-wrap">
    <div class="plan-pre-doc no-print">
    <StepHero
      stepIndex={5}
      title="컬러플랜 계획서"
      lede="지금까지 선택한 색과 적용 결과를 하나의 계획서로 완성해 보세요."
    />

    <div class="plan-sectionhead no-print">
      <h2>01. 완성 전 점검</h2>
      <span class="plan-pill plan-pill-ok">{checksComplete ? '✓ 점검 완료' : '점검 중'}</span>
    </div>

    <div class="plan-card plan-checklist no-print">
      {#each preChecks as item (item.label)}
        <div class="plan-check">
          <span class="plan-tick" class:pending={!item.done}>{item.done ? '✓' : '·'}</span>
          {item.label}
        </div>
      {/each}
      <div class="plan-guide">
        <div class="plan-guide-tabs" role="tablist" aria-label="컬러 활용 가이드">
          {#each GUIDE_TABS as tab (tab.id)}
            <button
              type="button"
              class="plan-guide-tab"
              role="tab"
              aria-selected={guideTab === tab.id}
              onclick={() => (guideTab = tab.id)}
            >
              {tab.label}
            </button>
          {/each}
        </div>
        <p class="plan-guide-body">{activeGuide.body}</p>
        <p class="plan-guide-q">{activeGuide.question}</p>
      </div>
      <div class="plan-decision" role="radiogroup" aria-label="내 브랜드 컬러 계획을 어떻게 할까요?">
        <p class="plan-decision-q">내 브랜드 컬러 계획을 어떻게 할까요?</p>
        {#each PLAN_DECISION_OPTIONS as option (option.id)}
          <label class="plan-decision-option">
            <input
              type="radio"
              name="plan-decision"
              value={option.id}
              checked={plan.decision === option.id}
              onchange={() => chooseDecision(option.id)}
              aria-describedby={option.navigateTo ? `plan-decision-hint-${option.id}` : undefined}
            />
            <span class="plan-decision-option-body">
              <span>{option.label}</span>
              {#if option.navigateTo}
                <span class="plan-decision-hint caption caption-guide" id="plan-decision-hint-{option.id}">
                  누르면 이전 {planDecisionStepNumber(option.navigateTo)}단계로 돌아갑니다.
                </span>
              {/if}
            </span>
          </label>
        {/each}
      </div>
    </div>

    {#if factReview}
      <div class="plan-recheck no-print" role="status">
        <p>색이나 비율이 바뀌었습니다. 선택 이유와 활용 위치 문장을 다시 확인해 주세요.</p>
        <button class="plan-btn" type="button" onclick={acknowledgePlanFacts}>확인했어요</button>
      </div>
    {/if}
    </div>

    <div class="plan-sectionhead">
      <h2>02. 컬러플랜 계획서</h2>
      <span class="plan-muted no-print">미리보기</span>
    </div>

    <article class="plan-card plan-document" id="plan-document" aria-labelledby="plan-doc-heading">
      <div class="plan-doc-top">
        <div>
          <small>BRAND COLOR PLAN</small>
          <h3 id="plan-doc-heading">{brandTitle}</h3>
          <p class="plan-doc-subtitle">{docSubtitle}</p>
        </div>
        <span class="plan-pill">최종 계획서</span>
      </div>

      <hr class="plan-rule" />

      <h4 class="plan-label">브랜드 컬러 팔레트</h4>
      <div class="plan-palette" aria-label="팔레트 비율">
        {#each barForPlan as segment (segment.hex + segment.roleLabel)}
          <div
            class="plan-palette-seg color-chip"
            class:light={needsPickSwatchHairline(segment.hex)}
            style:background={segment.hex}
            style:flex={segment.widthPct}
            title="{segment.name} {segment.pctLabel}"
          ></div>
        {/each}
      </div>
      <div class="plan-swatches">
        {#each barForPlan as segment (segment.hex + segment.name)}
          <div class="plan-swatch">
            <span class="plan-swatch-name">
              <i
                class="plan-dot color-chip color-chip--hairline-border"
                style:background={segment.hex}
                class:light={needsPickSwatchHairline(segment.hex)}
              ></i>
              {segment.roleLabel}
            </span>
            <strong>{segment.pctLabel}</strong>
            <code>{segment.hex.toUpperCase()}</code>
          </div>
        {/each}
      </div>

      <div class="plan-print-block">
        <h4 class="plan-label">{sectionMap.basics?.title.replace(/^\d+\.\s*/, '') ?? '브랜드 기본 정보'}</h4>
        {#each sectionMap.basics?.facts ?? [] as fact (fact.label)}
          {#if fact.label === '색 활용 분야'}
            {#if showApplyFieldPlanImage && applyFieldReferenceId}
              <div class="plan-apply-field-row">
                <p class="plan-meta-line plan-apply-field-copy">
                  <strong>{fact.label}</strong>
                  {fact.value.trim() || PLAN_BLANK}
                </p>
                <div class="plan-apply-field-media">
                  {#if hasApplyFieldRecolor(applyFieldReferenceId)}
                    <ApplyFieldRecolorHero
                      applyFieldId={applyFieldReferenceId}
                      fieldTitle={applyFieldReferenceTitle}
                      primaryHex={palette.colors[0].hex}
                      secondaryHex={palette.colors[1].hex}
                      accentHex={accentSlots[0]}
                      fit="contain"
                      inline
                    />
                  {:else}
                    <ApplyFieldReferenceImage
                      applyFieldId={brand.applyFieldId}
                      fieldTitle={applyFieldReferenceTitle}
                      layout="plan"
                    />
                  {/if}
                </div>
              </div>
            {:else}
              <p class="plan-meta-line">
                <strong>{fact.label}</strong>
                {fact.value.trim() || PLAN_BLANK}
              </p>
            {/if}
          {:else}
            <p class="plan-meta-line"><strong>{fact.label}</strong> {fact.value.trim() || PLAN_BLANK}</p>
          {/if}
        {/each}
      </div>

      <div class="plan-print-block">
        <h4 class="plan-label">{sectionMap.imageGoal?.title.replace(/^\d+\.\s*/, '') ?? '브랜드 이미지'}</h4>
        {#each sectionMap.imageGoal?.facts ?? [] as fact (fact.label)}
          <p class="plan-meta-line"><strong>{fact.label}</strong> {fact.value.trim() || PLAN_BLANK}</p>
        {/each}
        {#each sectionMap.imageGoal?.colors ?? [] as pick (pick.id)}
          <PlanColorTagRow hex={pick.hex} tags={pick.tags} />
        {/each}
        <p class="plan-meta-line plan-meta-line--keyword-reason">
          <strong>색상을 고른 이유</strong>
          {sectionMap.imageGoal?.fields[0]?.value.trim() || PLAN_BLANK}
        </p>
      </div>

      <div class="plan-print-block">
        <h4 class="plan-label">{sectionMap.colorTraits?.title.replace(/^\d+\.\s*/, '') ?? '색 특성'}</h4>
        {#each sectionMap.colorTraits?.colors ?? [] as color (color.id)}
          <div class="plan-color-entry">
            <PlanColorTagRow hex={color.hex} tags={color.tags} />
            {#each color.notes as note (note.label)}
              <p class="plan-meta-line"><strong>{note.label}</strong> {note.value}</p>
            {/each}
            {#each color.fields as field (field.key)}
              <p class="plan-meta-line plan-print-only">
                <strong>{field.label}</strong>
                {field.value.trim() || PLAN_BLANK}
              </p>
              <label class="plan-color-field no-print">
                <span class="plan-color-field-label">{field.label}</span>
                <textarea
                  class="plan-textarea"
                  rows="1"
                  value={field.value}
                  placeholder={planFieldPlaceholder(field.key)}
                  oninput={(event) => saveField(field, event.currentTarget.value)}
                ></textarea>
              </label>
            {/each}
          </div>
    {/each}
      </div>

      <hr class="plan-rule" />

      <h4 class="plan-label">브랜드 적용 미리보기</h4>
      <div class="plan-scene">
        <BrandMoodboardPanel
          applyFieldId={brand.applyFieldId}
          primaryHex={palette.colors[0].hex}
          secondaryHex={palette.colors[1].hex}
          accent1Hex={accentSlots[0]}
          accent2Hex={accentSlots[1]}
          accent3Hex={accentSlots[2]}
        />
      </div>
      <p class="plan-scene-note">5단계 무드보드에 현재 팔레트가 적용된 장면입니다.</p>

      <p class="plan-meta-line plan-print-only">
        <strong>최종 점검</strong>
        {sectionMap.check?.facts[0]?.value.trim() || PLAN_BLANK}
      </p>

      {#if legacyStale}
        <div class="plan-legacy no-print">
          <p>이전에 저장한 계획서 문장이 있습니다. 덮어쓰지 않았습니다.</p>
          <pre>{plan.text}</pre>
        </div>
      {/if}

      <p class="plan-print-copyright plan-print-only"><AppCopyright /></p>
</article>

    <section class="plan-finish no-print" aria-labelledby="plan-finish-title">
      <div>
        <h2 id="plan-finish-title">03. 계획서 완성하기</h2>
        <p>최종 내용을 확인하고 PDF 파일로 저장하세요.</p>
      </div>
      <button class="plan-finish-btn" type="button" onclick={() => window.print()}>↓ PDF 계획서 저장</button>
    </section>

    <p class="plan-hint caption caption-guide no-print">인쇄 화면에서는 점검·편집 UI가 빠지고 계획서 본문만 저장됩니다.</p>
  </div>

  <div class="plan-notice" class:show={Boolean(toast)} role="status">{toast}</div>
</div>

<style>
  .plan-step {
    --plan-ink: var(--step-ink);
    --plan-muted: var(--step-muted);
    --plan-border: var(--step-border);
    --plan-accent: var(--step-accent);
    --plan-accent-soft: var(--step-accent-soft);
    --plan-ok: var(--step-ok);
    --plan-ok-bg: var(--step-ok-bg);
    color: var(--plan-ink);
    padding-bottom: 24px;
  }

  .plan-toolbar {
    position: sticky;
    top: var(--app-save-bar-h, 56px);
    z-index: 25;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    padding: 12px max(18px, calc((100vw - 980px) / 2));
    background: #202239;
    color: #fff;
    box-shadow: 0 6px 24px #171a2822;
  }
  .plan-toolbar strong {
    margin-right: auto;
    font-size: 14px;
  }
  .plan-btn {
    border: 1px solid #50546f;
    background: #363950;
    color: #fff;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .plan-btn-primary {
    background: var(--plan-accent);
    border-color: var(--plan-accent);
  }

  .plan-wrap {
    max-width: var(--step-wrap);
    margin: 0 auto;
    padding: 0 20px calc(var(--footer-h) + 24px);
  }
  .plan-wrap :global(.step-hero) {
    padding-top: 28px;
  }
  .plan-wrap :global(.step-hero-lede) {
    margin-bottom: 32px;
  }
  .plan-sectionhead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 29px 0 12px;
  }
  .plan-sectionhead h2 {
    font-size: 18px;
    margin: 0;
    font-weight: 800;
  }
  .plan-pill {
    font-size: 12px;
    color: var(--plan-ok);
    background: var(--plan-ok-bg);
    padding: 7px 10px;
    border-radius: 30px;
    font-weight: 700;
    white-space: nowrap;
  }
  .plan-pill-ok {
    color: var(--plan-ok);
    background: var(--plan-ok-bg);
  }
  .plan-muted {
    color: var(--plan-muted);
    font-size: 12px;
  }
  .plan-card {
    border: 1px solid var(--plan-border);
    border-radius: 15px;
    background: #fff;
    box-shadow: 0 7px 20px #27324809;
  }
  .plan-checklist {
    padding: 5px 20px 18px;
  }
  .plan-check {
    padding: 14px 2px;
    border-bottom: 1px solid #eef0f4;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
  .plan-check:last-of-type {
    border-bottom: 0;
  }
  .plan-tick {
    width: 21px;
    height: 21px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #ddf5e8;
    color: #148554;
    font-weight: 900;
    flex: none;
  }
  .plan-tick.pending {
    background: #eef0f4;
    color: #9093a1;
  }
  .plan-guide {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed #eef0f4;
  }
  .plan-guide-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }
  .plan-guide-tab {
    border: 1px solid var(--plan-border);
    background: #f7f7fa;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .plan-guide-tab[aria-selected='true'] {
    border-color: var(--plan-accent);
    background: var(--plan-accent-soft);
    color: var(--plan-accent);
  }
  .plan-guide-body,
  .plan-guide-q {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }
  .plan-guide-q {
    margin-top: 8px;
    font-weight: 700;
  }
  .plan-decision {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed #eef0f4;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .plan-decision-q {
    margin: 0;
    font-size: 13px;
    font-weight: 800;
  }
  .plan-decision-option {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.45;
    cursor: pointer;
  }
  .plan-decision-option input {
    margin-top: 3px;
  }
  .plan-decision-option-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .plan-decision-hint {
    font-size: 12px;
  }
  .plan-recheck {
    margin: 12px 0;
    padding: 12px 14px;
    border-radius: 11px;
    background: #fff8e8;
    border: 1px solid #ead7a2;
    font-size: 13px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .plan-recheck p {
    margin: 0;
    flex: 1;
  }

  .plan-document {
    padding: 38px 46px;
  }
  .plan-doc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .plan-doc-top small {
    color: #8174e3;
    font-size: 11px;
    letter-spacing: 0.18em;
    font-weight: 800;
  }
  .plan-doc-top h3 {
    font-size: 27px;
    margin: 8px 0 6px;
    font-weight: 800;
    line-height: 1.2;
  }
  .plan-doc-subtitle {
    margin: 0;
    color: var(--plan-muted);
    font-size: 16px;
    line-height: 1.45;
    font-weight: 500;
  }
  .plan-rule {
    border: 0;
    border-top: 1px solid #e8e9ef;
    margin: 28px 0;
  }
  .plan-label {
    font-size: 15px;
    font-weight: 800;
    margin: 0 0 15px;
  }
  .plan-palette {
    display: flex;
    height: 48px;
    border-radius: 7px;
    overflow: hidden;
  }
  .plan-palette-seg {
    min-width: 4px;
  }
  .plan-swatches {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin: 15px 0;
  }
  .plan-swatch {
    font-size: 12px;
  }
  .plan-swatch-name {
    color: #777b8b;
  }
  .plan-dot {
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 0;
    margin-right: 5px;
    vertical-align: -1px;
    border: none;
    box-shadow: none;
  }
  .plan-dot.light {
    border: 1px solid var(--hairline);
    box-shadow: none;
  }
  .plan-swatch strong {
    display: block;
    margin: 7px 0 3px;
    font-size: 16px;
  }
  .plan-swatch code {
    color: #8c909d;
    font-size: 12px;
  }
  .plan-print-block {
    margin: 0;
    padding: 22px 0 4px;
    border-top: 1px solid #e8e9ef;
  }
  .plan-print-block .plan-label {
    margin-top: 0;
  }
  .plan-meta-line {
    margin: 0 0 8px;
    font-size: 13px;
    line-height: 1.65;
  }
  .plan-meta-line strong {
    margin-right: 6px;
  }
  .plan-meta-line--keyword-reason {
    padding-top: 8px;
  }
  .plan-apply-field-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 8px;
  }
  .plan-apply-field-copy {
    margin: 0;
  }
  .plan-apply-field-media {
    width: 100%;
    max-width: min(100%, 520px);
    aspect-ratio: 1586 / 992;
    border: 1px solid var(--plan-border);
    border-radius: 10px;
    overflow: hidden;
    background: #f5f5f2;
  }
  .plan-color-entry {
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #eef0f4;
  }
  .plan-color-entry:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: 0;
  }
  .plan-color-field {
    display: block;
    margin-top: 10px;
  }
  .plan-color-field-label {
    display: block;
    font-size: 12px;
    font-weight: 800;
    color: #424659;
    margin-bottom: 5px;
  }
  .plan-textarea {
    display: block;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid #dfe1ea;
    border-radius: 6px;
    padding: 5px 8px;
    font: inherit;
    font-size: 12px;
    line-height: 1.4;
    min-height: 1.875rem;
    max-height: 4.25rem;
    color: var(--plan-ink);
    background: #fff;
  }
  .plan-textarea::placeholder {
    color: #9a9eaa;
    opacity: 1;
    font-size: 12px;
  }
  .plan-scene {
    border-radius: 12px;
    background: #f5f5f2;
    border: 1px solid #e8e9e8;
    overflow: hidden;
    max-width: 560px;
    margin: auto;
  }
  .plan-scene :global(.moodboard-panel) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
  }
  .plan-scene-note {
    text-align: center;
    margin: 11px 0 0;
    color: #9093a1;
    font-size: 11px;
  }
  .plan-legacy pre {
    white-space: pre-wrap;
    font: inherit;
    margin: 8px 0 0;
    padding: 10px;
    background: #f7f7fa;
    border-radius: 8px;
  }
  .plan-finish {
    margin-top: 26px;
    padding: 26px 28px;
    border: 1px solid #dcd7ff;
    background: var(--plan-accent-soft);
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: space-between;
  }
  .plan-finish h2 {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 800;
  }
  .plan-finish p {
    margin: 0;
    color: #77768d;
    font-size: 12px;
  }
  .plan-finish-btn {
    border: 0;
    border-radius: 9px;
    padding: 14px 24px;
    color: #fff;
    font-weight: 800;
    background: var(--plan-accent);
    cursor: pointer;
    white-space: nowrap;
  }
  .plan-hint {
    margin: 18px 0 0;
    font-size: 12px;
  }
  .plan-notice {
    position: fixed;
    bottom: calc(var(--footer-h, 76px) + 22px);
    left: 50%;
    transform: translateX(-50%);
    background: #252638;
    color: #fff;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 40;
  }
  .plan-notice.show {
    opacity: 1;
  }
  .plan-print-only {
    display: none;
  }
  .plan-print-copyright {
    margin: 24px 0 0;
    padding-top: 12px;
    border-top: 1px solid #e8e9ef;
    text-align: center;
  }
  .plan-print-copyright :global(.app-copyright) {
    color: #6b7089;
    font-size: 10px;
  }

  @media (max-width: 640px) {
    .plan-wrap {
      margin: 24px auto;
    }
    .plan-title {
      font-size: 25px;
    }
    .plan-document {
      padding: 25px 18px;
    }
    .plan-swatches {
      gap: 8px;
    }
    .plan-swatch strong {
      font-size: 13px;
    }
    .plan-finish {
      flex-direction: column;
      align-items: stretch;
    }
    .plan-toolbar strong {
      flex-basis: 100%;
    }
  }

  @media print {
    .plan-step {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .no-print,
    .plan-toolbar,
    .plan-finish,
    .plan-hint,
    .plan-notice,
    .plan-checklist,
    .plan-sectionhead.no-print,
    .plan-recheck,
    .plan-legacy {
      display: none !important;
    }
    .plan-wrap {
      margin: 0;
      max-width: none;
      padding: 0;
    }
    .plan-lede {
      margin-bottom: 15px;
    }
    .plan-document {
      padding: 15px 20px;
      box-shadow: none;
      border: 0;
    }
    .plan-sectionhead {
      margin: 0 0 8px;
    }
    .plan-sectionhead h2 {
      font-size: 18px;
    }
    .plan-scene {
      max-width: 450px;
    }
    .plan-apply-field-row {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .plan-apply-field-media {
      max-width: 100%;
      width: 100%;
      max-height: 92mm;
      aspect-ratio: 1586 / 992;
      height: auto;
      margin-inline: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .plan-apply-field-media :global(.apply-ref-media),
    .plan-apply-field-media :global(.recolor-hero) {
      max-height: 92mm;
      height: 100%;
    }
    .plan-apply-field-media :global(img),
    .plan-apply-field-media :global(canvas) {
      max-height: 92mm;
      object-fit: contain;
    }
    .plan-print-only {
      display: block;
    }
    :global(.app-save-bar),
    :global(.work-step-head),
    :global(.app-footer) {
      display: none !important;
    }
    .plan-step,
    .plan-document,
    .plan-palette-seg,
    .plan-dot,
    :global(.plan-scene .color-chip) {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  @page {
    size: A4 portrait;
    margin: 16mm;
  }
</style>
