<script lang="ts">
  import { paletteBarSegmentPercents } from '../domain/accent-part-ratios'
  import { MIN_PALETTE_RATIO_PCT, roleForSlotRatio } from '../domain/role-assignment'
  import { needsPickSwatchHairline } from '../domain/color-chip'

  export type AccentSliderItem = { hex: string; label: string }

  let {
    ratios,
    accentParts,
    items,
    onchange,
  }: {
    ratios: readonly [number, number, number]
    accentParts: readonly [number, number, number]
    items: readonly AccentSliderItem[]
    onchange: (segmentIndex: number, value: number) => void
  } = $props()

  const segmentPercents = $derived(paletteBarSegmentPercents(ratios, items.length, accentParts))
  const minPct = MIN_PALETTE_RATIO_PCT

  function segmentMax(segmentCount: number): number {
    return 100 - (segmentCount - 1) * minPct
  }
</script>

<ul class="accent-sliders">
  {#each items as item, i}
    {@const segIdx = 2 + i}
    {@const pct = segmentPercents[segIdx] ?? accentParts[i]}
    {@const role = roleForSlotRatio(pct)}
    {@const segCount = segmentPercents.length}
    <li class="row">
      <span
        class="swatch color-chip color-chip--hairline-border"
        style:background={item.hex}
        class:light={needsPickSwatchHairline(item.hex)}
        aria-hidden="true"
      ></span>
      <div class="copy">
        <span class="title">{item.label}</span>
        <span class="caption">막대 전체 {pct}% · {role}</span>
      </div>
      <input
        type="range"
        class="range"
        min={minPct}
        max={segmentMax(segCount)}
        step="1"
        value={pct}
        aria-valuetext="{pct}% {role}"
        aria-label="{item.label} 사용 비율"
        oninput={(e) => onchange(segIdx, Number(e.currentTarget.value))}
      />
      <span class="pct tabular">{pct}%</span>
    </li>
  {/each}
</ul>

<style>
  .accent-sliders {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row {
    display: grid;
    grid-template-columns: 28px 1fr minmax(100px, 1.2fr) 40px;
    gap: 10px;
    align-items: center;
  }
  .swatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
  .title {
    display: block;
    font-size: 13px;
    font-weight: 600;
  }
  .copy .caption {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: var(--ink-mute);
  }
  .range {
    width: 100%;
  }
  .pct {
    font-weight: 700;
    text-align: right;
  }
</style>
