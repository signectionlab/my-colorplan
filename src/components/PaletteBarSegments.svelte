<script lang="ts">
  import type { PaletteBarSegment } from '../domain/palette-preview-context'
  import { needsPickSwatchHairline } from '../domain/color-chip'

  let {
    segments,
    label = '현재 팔레트',
  }: {
    segments: readonly PaletteBarSegment[]
    label?: string
  } = $props()
</script>

<div class="bar-wrap">
  <p class="caption">{label}</p>
  <div
    class="bar"
    role="img"
    aria-label={segments.map((s) => `${s.name} ${s.widthPct}% ${s.roleLabel}`).join(', ')}
  >
    {#each segments as seg}
      <span class="seg" style:width="{seg.widthPct}%" style:background={seg.hex} title="{seg.name} · {seg.widthPct}% · {seg.roleLabel}"></span>
    {/each}
  </div>
  <ul class="legend">
    {#each segments as seg}
      <li>
        <i
          class="legend-swatch color-chip color-chip--hairline-border"
          style:background={seg.hex}
          class:light={needsPickSwatchHairline(seg.hex)}
          aria-hidden="true"
        ></i>
        <span>{seg.name} {seg.widthPct}% · {seg.roleLabel}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .bar {
    display: flex;
    height: 48px;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid var(--hairline);
    margin-top: 8px;
  }
  .seg {
    min-width: 0;
  }
  .legend {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    font-size: 12px;
    color: var(--ink-mute);
  }
  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .legend-swatch {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 4px;
    flex-shrink: 0;
  }
</style>
