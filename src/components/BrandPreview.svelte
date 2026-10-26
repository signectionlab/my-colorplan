<script lang="ts">
  import PaletteBar from './PaletteBar.svelte'
  import PaletteBarSegments from './PaletteBarSegments.svelte'
  import { APPLY_FIELD_BY_ID } from '../data/apply-fields'
  import type { PaletteBarSegment, PaletteRoleColors, PlanAccentPreviewItem } from '../domain/palette-preview-context'
  import { previewInk } from '../domain/preview-ink'
  import type { ApplyFieldPreviewId, PaletteColor, RoleName } from '../types/project'

  let {
    brandName,
    keywords = [],
    colors,
    ratios,
    roles,
    readable = false,
    previewVariant = 'default',
    previewNote = '',
    accentItems = [],
    roleColors = null,
    barSegments = null,
    showPaletteBar = true,
    showFootnote = true,
    showVariantNote = true,
  }: {
    brandName: string
    keywords?: string[]
    colors: PaletteColor[] | { name: string; hex: string }[]
    ratios: readonly number[]
    roles: readonly RoleName[]
    readable?: boolean
    /** STEP 5 분야 id 또는 시작·데모용 `default` */
    previewVariant?: ApplyFieldPreviewId | 'default'
    previewNote?: string
    accentItems?: readonly PlanAccentPreviewItem[]
    roleColors?: PaletteRoleColors | null
    barSegments?: readonly PaletteBarSegment[] | null
    showPaletteBar?: boolean
    showFootnote?: boolean
    showVariantNote?: boolean
  } = $props()

  const main = $derived(roles.findIndex((role) => role === '주조색'))
  const accent = $derived(roles.findIndex((role) => role === '강조색'))
  const support = $derived(colors.find((_, i) => ratios[i] > 0 && roles[i] === '보조색')?.hex ?? '#0d253d')
  const background = $derived(roleColors?.background ?? (main >= 0 ? colors[main].hex : colors[0].hex))
  const supportHex = $derived(roleColors?.body ?? support)
  const accentHex = $derived(roleColors?.accentHex ?? (accent >= 0 ? colors[accent].hex : colors[2].hex))
  const accentSecondaryHex = $derived(roleColors?.accentSecondaryHex ?? null)
  const ink = $derived(readable ? previewInk(supportHex, background) : { color: supportHex, adjusted: false })

  const variant = $derived(previewVariant === 'default' ? 'print' : previewVariant)
  const multiAccent = $derived(accentItems.length > 1)

  const genericTitle = $derived.by(() => {
    if (previewVariant === 'default') return '공통 적용 예시'
    const id = variant
    if (id in APPLY_FIELD_BY_ID) return `${APPLY_FIELD_BY_ID[id as keyof typeof APPLY_FIELD_BY_ID].title} 예시`
    return '적용 예시'
  })

  const genericHint = $derived(
    previewNote ||
      (previewVariant === 'default'
        ? '활용 분야를 아직 정하지 않았거나, 이 분야 전용 미리보기는 준비 중입니다. 아래는 색이 쓰일 수 있는 공통 예시입니다.'
        : `${genericTitle} — UI 목업으로 역할별 색 배치를 확인합니다.`),
  )
</script>

<div class="preview">
  {#if showPaletteBar}
    {#if barSegments && barSegments.length}
      <PaletteBarSegments segments={barSegments} label="비율 막대" />
    {:else}
      <PaletteBar {colors} {ratios} />
    {/if}
  {/if}
  <div class="samples" class:single={variant !== 'print'}>
    {#if variant === 'print'}
      <article style:background style:color={ink.color}>
        <p class="name">{brandName || '브랜드 이름'}</p>
        <p>{keywords.join(' · ') || '명함 예시'}</p>
      </article>
      <article class="menu">
        <h3 style:border-color={accentHex}>{brandName.trim() ? `${brandName} 메뉴·카드` : '홍보 카드 예시'}</h3>
        {#if multiAccent}
          <p><span>시그니처</span><b style:color={accentHex}>5,500</b></p>
          <p>
            <span>스페셜</span><b style:color={accentSecondaryHex ?? accentHex}>6,200</b>
          </p>
          <p><span>음료</span><b class="tabular">4,500</b></p>
        {:else}
          <p><span>시그니처</span><b style:color={accentHex}>5,500</b></p>
          <p><span>음료</span><b class="tabular">4,500</b></p>
        {/if}
      </article>
    {:else if variant === 'online'}
      <article class="browser" style:--frame={background}>
        <div class="browser-chrome">
          <span></span><span></span><span></span>
        </div>
        <div class="browser-body" style:background>
          <p class="name" style:color={ink.color}>{brandName || '브랜드 이름'}</p>
          <p class="browser-line" style:background={accentHex}></p>
          {#if multiAccent && accentSecondaryHex}
            <p class="browser-line browser-line-2" style:background={accentSecondaryHex}></p>
          {/if}
          <p class="browser-caption" style:color={ink.color}>{keywords.join(' · ') || '웹·SNS 콘텐츠 예시'}</p>
        </div>
      </article>
    {:else if variant === 'space'}
      <article class="space-sample">
        <div class="space-wall" style:background={background}></div>
        <div class="space-floor" style:background={accentHex}></div>
        <p class="space-label" style:color={ink.color}>{brandName || '공간 이름'}</p>
      </article>
    {:else if variant === 'product'}
      <article class="product-sample" style:--pack={background}>
        <div class="product-box" style:background>
          <span class="product-tag" style:background={accentHex}></span>
          {#if multiAccent && accentSecondaryHex}
            <span class="product-tag tag-2" style:background={accentSecondaryHex}></span>
          {/if}
          <p class="name" style:color={ink.color}>{brandName || '상품명'}</p>
        </div>
      </article>
    {:else}
      <article class="service-sample" style:background style:color={ink.color}>
        <p class="service-kicker" style:color={accentHex}>프로그램 안내</p>
        <p class="name">{brandName || '서비스·교육 예시'}</p>
        <p>{keywords.join(' · ') || '수업 자료, 안내 문구'}</p>
      </article>
    {/if}
  </div>
  {#if showVariantNote && (variant !== 'print' || previewVariant === 'default')}
    <p class="variant-note caption">{genericHint}</p>
  {/if}
  {#if showFootnote}
    <p class="caption foot">
      컬러 바는 선택한 비율이고, 아래는 색이 쓰이는 위치를 보여주는 예시입니다. 픽셀 면적이 비율과 같다고 보지 마세요.
      {#if variant === 'print' && previewVariant !== 'default'}
        · {genericTitle}
      {/if}
    </p>
  {/if}
</div>

<style>
  .samples {
    display: grid;
    gap: 12px;
    margin-top: 12px;
  }
  .samples.single {
    grid-template-columns: 1fr;
  }
  @media (min-width: 720px) {
    .samples:not(.single) {
      grid-template-columns: 1fr 1fr;
    }
  }
  article {
    min-height: 140px;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--hairline);
  }
  .name {
    font-size: 1.35rem;
    font-weight: 300;
    margin-bottom: 8px;
  }
  .menu h3 {
    border-bottom: 3px solid;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }
  .menu p {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  .browser {
    padding: 0;
    overflow: hidden;
  }
  .browser-chrome {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    background: var(--canvas-soft);
    border-bottom: 1px solid var(--hairline);
  }
  .browser-chrome span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--hairline);
  }
  .browser-body {
    padding: 20px;
    min-height: 120px;
  }
  .browser-line {
    height: 8px;
    width: 40%;
    border-radius: 4px;
    margin: 12px 0;
  }
  .browser-line-2 {
    width: 28%;
    margin-top: 0;
  }
  .browser-caption {
    font-size: 14px;
    opacity: 0.9;
  }
  .space-sample {
    position: relative;
    padding: 0;
    min-height: 160px;
    overflow: hidden;
  }
  .space-wall {
    height: 100px;
  }
  .space-floor {
    height: 60px;
    opacity: 0.85;
  }
  .space-label {
    position: absolute;
    left: 16px;
    top: 16px;
    font-weight: 600;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  }
  .product-sample {
    display: grid;
    place-items: center;
    background: var(--canvas-soft);
  }
  .product-box {
    width: min(100%, 200px);
    aspect-ratio: 4/5;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(13, 37, 61, 0.08);
  }
  .product-tag {
    display: block;
    width: 48px;
    height: 8px;
    border-radius: 4px;
    margin-bottom: 12px;
  }
  .product-tag.tag-2 {
    width: 32px;
    margin-bottom: 8px;
  }
  .service-sample .service-kicker {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .variant-note {
    margin-top: 10px;
  }
  .foot {
    margin-top: 8px;
  }
</style>
