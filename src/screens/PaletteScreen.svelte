<script lang="ts">
  import BrandColorPlan from '../components/BrandColorPlan.svelte'
  import PaletteHeroPreview from '../components/PaletteHeroPreview.svelte'
  import PaletteAccentPartSliders from '../components/PaletteAccentPartSliders.svelte'
  import PaletteRatioStackEditor from '../components/PaletteRatioStackEditor.svelte'
  import { applyFieldDisplayText } from '../domain/apply-field'
  import {
    accentPlanSlotCount,
    brandColorPlanSyncSignature,
    brandImagePickKey,
  } from '../domain/brand-image'
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import { pickChipColorName, pickChipToneLine } from '../domain/learn-brand-pick'
  import {
    accentPartRatiosLive,
    planAccentPreviewItems,
    palettePreviewSubtitle,
  } from '../domain/palette-preview-context'
  import { paletteCardTitle } from '../domain/palette-display'
  import { ACCENT_ROLE_TOTAL_PCT } from '../domain/role-assignment'
  import {
    store,
    resetRatios,
    refreshPaletteColorsFromBrandColorPlan,
    setPaletteRatios,
    applyPaletteRatioPreset,
    updatePaletteBarSegment,
    savePaletteBaseline,
  } from '../state/project-state.svelte'

  const brand = $derived(store.project.brand)
  const palette = $derived(store.project.palette)

  const brandImageLine = $derived.by(() => {
    if (brand.keywords.length) return brand.keywords.join(' · ')
    if (brand.keywordReason.trim()) return brand.keywordReason.trim()
    return ''
  })

  const previewSubtitle = $derived(palettePreviewSubtitle(brand))

  let selected = $state(0)
  let readablePreview = $state(false)

  const pickCount = $derived(brand.imagePicks.length)
  const accentSlots = $derived(accentPlanSlotCount(brand))
  const accentPartsLive = $derived(accentPartRatiosLive(brand, palette))
  const multiAccentRatioBar = $derived(pickCount >= 3 && accentSlots > 1)
  const accentPreviewItems = $derived(planAccentPreviewItems(brand, palette))
  const accentSliderItems = $derived(accentPreviewItems.map((p) => ({ hex: p.hex, label: p.label })))
  const accentSplitHint = $derived.by(() => {
    if (pickCount < 3) return ''
    if (accentSlots === 1) return `강조 ${ACCENT_ROLE_TOTAL_PCT}%`
    if (accentSlots === 2) return '강조색마다 슬라이더로 나눠 조절'
    return `강조 각 ${(ACCENT_ROLE_TOTAL_PCT / 3).toFixed(1).replace(/\.0$/, '')}%`
  })
  const planSyncSig = $derived(brandColorPlanSyncSignature(brand))
  let syncedPlanSig = $state('')

  $effect(() => {
    if (pickCount < 3) {
      syncedPlanSig = ''
      return
    }
    const sig = planSyncSig
    if (sig === syncedPlanSig) return
    refreshPaletteColorsFromBrandColorPlan()
    syncedPlanSig = sig
  })

  function displayName(color: (typeof palette.colors)[0], index: number): string {
    const t = paletteCardTitle(color, index, palette.roles[index])
    return t.length > 8 ? t : color.name.trim() || t
  }


</script>

<section class="activity card" aria-labelledby="pal-s1">
  <p class="step-badge">STEP 4 · 활동 1</p>
  <div class="activity-head-row">
    <h2 id="pal-s1" class="activity-title">색의 역할</h2>
    {#if !pickCount || pickCount < 3}
      <button type="button" class="btn btn-ghost btn-sm" onclick={resetRatios}>예시 팔레트</button>
    {/if}
  </div>
  {#if brand.imagePicks.length}
    <h3 class="pal-sub" id="pal-brand-picks">1단계에서 고른 색</h3>
    <ul class="brand-pick-blocks">
      {#each brand.imagePicks as pick (brandImagePickKey(pick))}
        <li class="brand-pick-block">
          <span
            class="brand-pick-swatch color-chip color-chip--hairline-border"
            style:background={pick.hex}
            class:light={needsPickSwatchHairline(pick.hex)}
            aria-hidden="true"
          ></span>
          <span class="brand-pick-copy">
            <span class="brand-pick-name">{pickChipColorName(pick)}</span>
            <span class="brand-pick-tone">{pickChipToneLine(pick)}</span>
            <span class="brand-pick-hex tabular">{pick.hex.toUpperCase()}</span>
          </span>
        </li>
      {/each}
    </ul>
  {:else if brandImageLine}
    <p class="strip-keywords pal-brand-line">{brandImageLine}</p>
  {/if}
  {#if pickCount >= 3}
    <p class="activity-lede role-intro">
      <strong>1단계 색채계획</strong>을 그대로 보여 줍니다(주조·보조 각 1색, 강조 10%
      {#if accentSlots > 1}
        · {accentSlots}색
      {/if}
      ). 역할·색 배정을 바꾸려면 1단계로 돌아가 주세요.
    </p>
    <BrandColorPlan embedded readonly heading="1단계 색채계획" />
  {:else}
    <p class="activity-lede role-intro">
      1단계에서 색을 3개 이상 고르면, 주조·보조·강조 역할을 1단계 색채계획과 같이 지정할 수 있어요. 지금은 예시
      팔레트로 역할 카드를 눌러 색을 바꿀 수 있습니다.
    </p>
    <div class="role-tiles">
      {#each palette.colors as color, index}
        <button
          type="button"
          class="role-tile"
          class:selected={selected === index}
          onclick={() => (selected = index)}
          aria-pressed={selected === index}
        >
          <span class="role-tag">{palette.roles[index]}</span>
          <span
            class="tile-swatch color-chip color-chip--hairline-border"
            style:background={color.hex}
            class:light={needsPickSwatchHairline(color.hex)}
          ></span>
          <span class="tile-name">{displayName(color, index)}</span>
        </button>
      {/each}
    </div>
  {/if}
</section>

<section class="activity card" aria-labelledby="pal-s2">
  <p class="step-badge">STEP 4 · 활동 2</p>
  <h2 id="pal-s2" class="activity-title">비율·미리보기</h2>

  <h3 class="pal-sub" id="pal-s2-ratio">사용 비율 조절</h3>
  <p class="activity-lede">
    막대에서 색 <strong>경계</strong>를 드래그해 비율을 바꿔 보세요. 칸마다 색은 고정이고, 역할·미리보기는 바로 따라옵니다.
    {#if pickCount >= 3}
      강조 영역은 합 <strong>{ACCENT_ROLE_TOTAL_PCT}%</strong>{#if accentSplitHint}
        ({accentSplitHint})
      {/if}
      입니다.
    {/if}
  </p>
  <div class="ratio-presets" role="group" aria-label="비율 프리셋">
    {#if pickCount >= 3}
      <button type="button" class="btn btn-ghost btn-sm ratio-preset" onclick={() => applyPaletteRatioPreset('70-20-10')}>
        70 · 20 · 10
      </button>
    {/if}
    <button type="button" class="btn btn-ghost btn-sm ratio-preset" onclick={() => applyPaletteRatioPreset('60-30-10')}>
      60 · 30 · 10
    </button>
    <button type="button" class="btn btn-ghost btn-sm ratio-preset" onclick={savePaletteBaseline}>
      이 조합을 기준안으로 저장
    </button>
  </div>
  {#if palette.baseline}
    <p class="caption caption-guide">기준안을 저장했습니다. 5단계에서 현재 조합과 비교할 수 있어요.</p>
  {/if}
  <PaletteRatioStackEditor
    colors={palette.colors}
    ratios={palette.ratios}
    roles={palette.roles}
    accentParts={multiAccentRatioBar ? accentPreviewItems : []}
    accentSlotMaxPct={pickCount >= 3 && accentSlots <= 1 ? ACCENT_ROLE_TOTAL_PCT : null}
    onchange={setPaletteRatios}
  />
  {#if multiAccentRatioBar}
    <PaletteAccentPartSliders
      ratios={palette.ratios}
      accentParts={accentPartsLive}
      items={accentSliderItems}
      onchange={updatePaletteBarSegment}
    />
    <p class="caption caption-guide accent-slider-hint">
      강조색 슬라이더는 <strong>막대 전체</strong> 기준 %예요. 주 51~70% · 보 11~50% · 강 1~10% 구간에 맞춰 역할 텍스트가 바뀝니다.
    </p>
  {/if}
  {#if palette.roleNote}
    <p class="live caption" aria-live="polite">{palette.roleNote}</p>
  {/if}

  <div class="live-preview-block" id="pal-s3">
    <div class="live-preview-head">
      <h3 class="live-preview-title">적용 결과 미리보기</h3>
      <label class="toggle-readable">
        <input type="checkbox" bind:checked={readablePreview} />
        읽기 쉽게 보정
      </label>
    </div>
    <PaletteHeroPreview
      brandName={brand.name}
      subtitle={previewSubtitle}
      colors={palette.colors}
      ratios={palette.ratios}
      roles={palette.roles}
      readable={readablePreview}
      accentItems={accentPreviewItems}
    />
    {#if applyFieldDisplayText(brand)}
      <p class="caption foot">활용 분야 · {applyFieldDisplayText(brand)}</p>
    {/if}
    <p class="caption foot">
      미리보기는 학습용 예시입니다. 막대 면적과 같다고 보지 마세요.
    </p>
  </div>
</section>

<style>
  .pal-sub {
    margin: 20px 0 12px;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
  }
  .activity-title + .pal-sub,
  .activity-head-row + .pal-sub {
    margin-top: 14px;
  }
  .pal-brand-line {
    margin: 0 0 16px;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--ink);
  }
  .brand-pick-blocks {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .brand-pick-block {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 0 0 auto;
    width: min(100%, 200px);
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--hairline);
    background: #fff;
    box-sizing: border-box;
  }
  .brand-pick-swatch {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    flex-shrink: 0;
  }
  .brand-pick-swatch.color-chip--hairline-border:global(.light) {
    border: 1px solid var(--hairline);
  }
  .brand-pick-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .brand-pick-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--ink);
  }
  .brand-pick-tone {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    color: var(--ink-mute);
  }
  .brand-pick-hex {
    font-size: 11px;
    color: var(--ink-mute);
    letter-spacing: 0.02em;
  }
  .strip-keywords {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--ink);
  }
  .btn-sm {
    font-size: 13px;
    padding: 6px 12px;
    flex-shrink: 0;
  }
  .role-tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (max-width: 520px) {
    .role-tiles {
      grid-template-columns: 1fr;
    }
  }
  .role-tile {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    border: 2px solid var(--hairline);
    border-radius: 14px;
    background: var(--canvas);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .role-tile.selected {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }
  .role-tag {
    padding: 10px 12px 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
  }
  .tile-swatch {
    flex: 1;
    min-height: 88px;
    margin: 0 10px;
    border-radius: 10px;
  }
  .tile-name {
    padding: 10px 12px 14px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-mute);
  }
  .ratio-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ratio-preset {
    font-variant-numeric: tabular-nums;
  }
  .live-preview-block {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed var(--hairline);
  }
  .live-preview-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .live-preview-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
  }
  .toggle-readable {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    margin: 0;
    cursor: pointer;
  }
  .foot {
    margin: 10px 0 0;
  }
</style>
