<script lang="ts">
  import { previewInk } from '../domain/preview-ink'
  import type { PaletteColor, RoleName } from '../types/project'

  export type PaletteAccentPreviewItem = {
    hex: string
    label: string
  }

  let {
    brandName,
    subtitle = '선택한 색을 어디에 어떻게 사용할지 확인해 보세요.',
    colors,
    ratios,
    roles,
    readable = false,
    /** pick 4~5: 강조 칸별 색·라벨(미리보기 UI 분기) */
    accentItems = [],
  }: {
    brandName: string
    subtitle?: string
    colors: PaletteColor[] | { name: string; hex: string }[]
    ratios: readonly number[]
    roles: readonly RoleName[]
    readable?: boolean
    accentItems?: readonly PaletteAccentPreviewItem[]
  } = $props()

  const multiAccentPreview = $derived(accentItems.length > 1)

  const mainIdx = $derived(roles.findIndex((role) => role === '주조색'))
  const accentIdx = $derived(roles.findIndex((role) => role === '강조색'))
  const supportIdx = $derived(roles.findIndex((role) => role === '보조색'))

  const background = $derived(mainIdx >= 0 ? colors[mainIdx].hex : colors[0].hex)
  const accentHex = $derived(accentIdx >= 0 ? colors[accentIdx].hex : colors[2]?.hex ?? '#c0392b')
  const supportHex = $derived(supportIdx >= 0 ? colors[supportIdx].hex : colors[1]?.hex ?? '#e67e22')

  const titleInk = $derived(previewInk('#2c1810', background))
  const bodyInk = $derived(
    readable ? previewInk(supportHex, background) : { color: supportHex, adjusted: false },
  )
  const headline = $derived(brandName.trim() || '우리 브랜드의 새로운 이야기')

  const singleCtaInk = $derived(previewInk('#ffffff', accentHex))
</script>

<article
  class="hero"
  class:hero-multi-accent={multiAccentPreview}
  style:background
  aria-label={multiAccentPreview ? '브랜드 적용 미리보기(강조색 여러 개)' : '브랜드 적용 미리보기'}
>
  <span class="kicker">BRAND PREVIEW</span>
  <span class="star" style:color={supportHex} aria-hidden="true">★</span>
  <h3 class="title" style:color={readable && titleInk.adjusted ? titleInk.color : '#2c1810'}>{headline}</h3>
  <p class="sub" style:color={bodyInk.color}>{subtitle}</p>

  {#if multiAccentPreview}
    <p class="multi-lede">강조색 {accentItems.length}가지 — 각각 다른 요소에 쓰는 예시</p>
    <div class="accent-use-row" role="group" aria-label="강조색 적용 예시">
      {#each accentItems as item, i (item.hex + i)}
        {@const ink = previewInk('#ffffff', item.hex)}
        <div class="accent-use-card">
          <span class="accent-use-tag tabular">강조 {i + 1}</span>
          <button
            type="button"
            class="accent-use-btn"
            style:background={item.hex}
            style:color={ink.color}
          >
            {item.label}
          </button>
          <span class="accent-use-hint">버튼·링크·뱃지 등</span>
        </div>
      {/each}
    </div>
  {:else}
    <button
      type="button"
      class="cta"
      style:background={accentHex}
      style:color={singleCtaInk.color}
    >
      자세히 보기
    </button>
  {/if}
</article>

<style>
  .hero {
    position: relative;
    padding: 28px 24px 32px;
    border-radius: 16px;
    border: 1px solid var(--hairline);
    min-height: 200px;
    box-shadow: 0 8px 24px rgba(13, 37, 61, 0.06);
  }
  .hero-multi-accent {
    padding-bottom: 28px;
  }
  .kicker {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--ink-mute);
    opacity: 0.85;
    margin-bottom: 12px;
  }
  .star {
    position: absolute;
    top: 22px;
    right: 22px;
    font-size: 28px;
    line-height: 1;
    opacity: 0.95;
  }
  .title {
    margin: 0 0 10px;
    font-size: clamp(1.25rem, 4vw, 1.65rem);
    font-weight: 600;
    line-height: 1.35;
    max-width: 18em;
  }
  .sub {
    margin: 0 0 20px;
    font-size: 15px;
    line-height: 1.5;
    max-width: 22em;
    opacity: 0.92;
  }
  .multi-lede {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-mute);
  }
  .accent-use-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .accent-use-card {
    flex: 1 1 140px;
    min-width: min(100%, 140px);
    max-width: 100%;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .accent-use-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }
  .accent-use-btn {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: default;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .accent-use-hint {
    font-size: 11px;
    color: var(--ink-mute);
    line-height: 1.35;
  }
  .cta {
    border: 0;
    border-radius: 999px;
    padding: 12px 22px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    cursor: default;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
</style>
