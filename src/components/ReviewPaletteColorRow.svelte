<script lang="ts">
  import { needsPickSwatchHairline } from '../domain/color-chip'

  let {
    name,
    hex,
    roleLabel = '',
    widthPct = null as number | null,
    as = 'div',
  }: {
    name: string
    hex: string
    roleLabel?: string
    widthPct?: number | null
    as?: 'div' | 'li'
  } = $props()

  const pctLabel = $derived(
    widthPct === null ? '' : widthPct % 1 === 0 ? `${widthPct}%` : `${widthPct.toFixed(1)}%`,
  )
</script>

<svelte:element this={as} class="review-color-row">
  <i
    class="review-swatch color-chip color-chip--hairline-border"
    style:background={hex}
    class:light={needsPickSwatchHairline(hex)}
    aria-hidden="true"
  ></i>
  <div class="review-color-meta">
    <strong>{name}</strong>
    <span class="tabular hex">{hex}</span>
    {#if roleLabel || pctLabel}
      <span class="caption role">{roleLabel}{#if roleLabel && pctLabel} · {/if}{pctLabel}</span>
    {/if}
  </div>
</svelte:element>

<style>
  .review-color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-swatch {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }
  .review-color-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
    line-height: 1.35;
    min-width: 0;
  }
  .hex {
    font-size: 13px;
    color: var(--ink-mute);
  }
  .role {
    color: var(--ink-mute);
  }
</style>
