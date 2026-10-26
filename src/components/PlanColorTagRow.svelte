<script lang="ts">
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import type { PlanTag } from '../domain/plan-document'

  let { hex, tags }: { hex: string; tags: PlanTag[] } = $props()
</script>

<div class="plan-color-tags">
  <i
    class="swatch color-chip color-chip--hairline-border"
    style:background={hex}
    class:light={needsPickSwatchHairline(hex)}
    aria-hidden="true"
  ></i>
  <ul class="tags">
    {#each tags as tag (tag.label)}
      <li>
        <span class="tag-label">{tag.label}</span>
        <span class="tag-value tabular">{tag.value}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .plan-color-tags {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  .swatch {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0;
    flex-shrink: 0;
  }
  .tags {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    margin: 0;
    padding: 8px 12px;
    list-style: none;
    flex: 1;
    min-width: 0;
    background: #f7f7fa;
    overflow-x: auto;
  }
  .tags li {
    display: inline-flex;
    flex-shrink: 0;
    align-items: baseline;
    gap: 6px;
    line-height: 1.3;
    padding: 0 12px;
  }
  .tags li:first-child {
    padding-left: 0;
  }
  .tags li + li {
    border-left: 1px solid var(--step-border, var(--hairline));
  }
  .tag-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-mute);
  }
  .tag-value {
    font-size: 13px;
    color: var(--ink);
  }
</style>
