<script lang="ts">
  import ApplyFieldRecolorHero from './ApplyFieldRecolorHero.svelte'
  import ApplyFieldReferenceImage from './ApplyFieldReferenceImage.svelte'
  import BrandPreview from './BrandPreview.svelte'
  import PaletteBarSegments from './PaletteBarSegments.svelte'
  import { APPLY_FIELD_BY_ID, MOODBOARD_FIELD_LEDE } from '../data/apply-fields'
  import { hasApplyFieldRecolor } from '../data/apply-field-recolor'
  import type { ApplyFieldReferenceId } from '../data/apply-field-reference-image'
  import type { PaletteBarSegment, PaletteRoleColors, PlanAccentPreviewItem } from '../domain/palette-preview-context'
  import type { PaletteColor, RoleName } from '../types/project'

  let {
    applyFieldId,
    brandName,
    keywords = [],
    colors,
    ratios,
    roles,
    readable = false,
    roleColors,
    barSegments,
    accentItems = [],
  }: {
    applyFieldId: ApplyFieldReferenceId
    brandName: string
    keywords?: string[]
    colors: PaletteColor[]
    ratios: readonly number[]
    roles: readonly RoleName[]
    readable?: boolean
    roleColors: PaletteRoleColors
    barSegments: readonly PaletteBarSegment[]
    accentItems?: readonly PlanAccentPreviewItem[]
  } = $props()

  const fieldTitle = $derived(APPLY_FIELD_BY_ID[applyFieldId].title)
  const lede = $derived(MOODBOARD_FIELD_LEDE[applyFieldId])
  const useRecolor = $derived(hasApplyFieldRecolor(applyFieldId))
  const washColor = $derived(roleColors.background)
  const washOpacity = $derived(readable ? 0.22 : 0.34)
  const accentChips = $derived(
    accentItems.length > 0
      ? accentItems
      : [
          { hex: roleColors.accentHex, label: '강조' },
          ...(roleColors.accentSecondaryHex
            ? [{ hex: roleColors.accentSecondaryHex, label: '강조 2' }]
            : []),
        ],
  )

  let compositeFailed = $state(false)

  $effect(() => {
    applyFieldId
    compositeFailed = false
  })
</script>

<article class="moodboard" aria-labelledby="moodboard-heading">
  <header class="moodboard-head">
    <h4 id="moodboard-heading" class="moodboard-title">{fieldTitle} · 무드보드</h4>
    <p class="moodboard-lede caption">{lede}</p>
  </header>

  <div class="moodboard-grid">
    <div class="hero-col">
      <div class="hero-frame">
        {#if useRecolor}
          <ApplyFieldRecolorHero
            {applyFieldId}
            {fieldTitle}
            primaryHex={roleColors.background}
            secondaryHex={roleColors.body}
            accentHex={roleColors.accentHex}
            {readable}
            onCompositeFailed={() => {
              compositeFailed = true
            }}
            onCompositeSucceeded={() => {
              compositeFailed = false
            }}
          />
          {#if compositeFailed}
            <div
              class="hero-wash"
              style:background={washColor}
              style:opacity={washOpacity}
              aria-hidden="true"
            ></div>
          {/if}
          <ul class="color-legend caption" aria-label="사진에 자동 입힌 색">
            <li>
              <span class="legend-swatch" style:background={roleColors.background}></span>
              주조 · 벽/대형 면
            </li>
            <li>
              <span class="legend-swatch" style:background={roleColors.body}></span>
              보조 · 가구/바닥
            </li>
            <li>
              <span class="legend-swatch" style:background={roleColors.accentHex}></span>
              강조 · 포인트
            </li>
          </ul>
        {:else}
          <ApplyFieldReferenceImage applyFieldId={applyFieldId} {fieldTitle} layout="hero" />
          <div
            class="hero-wash"
            style:background={washColor}
            style:opacity={washOpacity}
            aria-hidden="true"
          ></div>
        {/if}
        <ul class="accent-chips" aria-label="강조색">
          {#each accentChips as chip, i (i)}
            <li><span class="chip" style:background={chip.hex} title={chip.label}></span></li>
          {/each}
        </ul>
      </div>
      <p class="disclosure caption">
        {#if useRecolor}
          4단계 팔레트가 참고 장면에 <strong>자동 합성</strong>됩니다(업로드 불필요). 주·보·첫 강조색은 지정 영역에, 둘째
          강조는 칩·UI 목업에서 확인하세요. 실제 공간·인쇄물과 색감·비율은 다를 수 있어요.
        {:else}
          이 분야는 <strong>분위기 미리보기</strong>(전체 틴트)입니다. 영역별 자동 합성은 마스크 준비 후 제공됩니다. 실제
          공간·인쇄물과 색감·비율은 다를 수 있어요.
        {/if}
      </p>
    </div>

    <div class="side-col">
      <PaletteBarSegments segments={barSegments} label="내 팔레트 비율" />
      <div class="mini-mock">
        <p class="caption mock-label">UI 목업</p>
        <BrandPreview
          {brandName}
          {keywords}
          {colors}
          {ratios}
          {roles}
          {readable}
          previewVariant={applyFieldId}
          {accentItems}
          {roleColors}
          barSegments={null}
          showPaletteBar={false}
          showFootnote={false}
          showVariantNote={false}
        />
      </div>
    </div>
  </div>
</article>

<style>
  .moodboard {
    margin-top: 12px;
    padding: 16px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: var(--canvas-soft);
  }
  .moodboard-head {
    margin-bottom: 14px;
  }
  .moodboard-title {
    margin: 0 0 4px;
    font-size: 1.05rem;
    font-weight: 600;
  }
  .moodboard-lede {
    margin: 0;
  }
  .moodboard-grid {
    display: grid;
    gap: 16px;
  }
  @media (min-width: 840px) {
    .moodboard-grid {
      grid-template-columns: 1.05fr 0.95fr;
      align-items: start;
    }
  }
  .hero-frame {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
  }
  .hero-frame :global(.recolor-hero) {
    border-radius: 14px;
  }
  .hero-wash {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
  }
  .color-legend {
    position: absolute;
    left: 10px;
    top: 10px;
    margin: 0;
    padding: 8px 10px;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 1px 6px rgba(13, 37, 61, 0.12);
    max-width: calc(100% - 20px);
  }
  .color-legend li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    line-height: 1.2;
    color: var(--ink);
  }
  .legend-swatch {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    border: 1px solid rgba(13, 37, 61, 0.15);
  }
  .accent-chips {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .chip {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 1px 4px rgba(13, 37, 61, 0.15);
  }
  .disclosure {
    margin: 10px 0 0;
    line-height: 1.45;
  }
  .disclosure strong {
    font-weight: 600;
  }
  .mini-mock {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px dashed var(--hairline);
  }
  .mock-label {
    margin: 0 0 4px;
  }
  .mini-mock :global(.preview) {
    margin-top: 0;
  }
  .mini-mock :global(article) {
    min-height: 120px;
  }
</style>
