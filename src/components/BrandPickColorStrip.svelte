<script lang="ts">
  import { brandImagePickKey, isBrandImageSelectionSettled } from '../domain/brand-image'
  import { needsPickSwatchHairline } from '../domain/color-chip'
  import { store } from '../state/project-state.svelte'

  const brand = $derived(store.project.brand)
  const show = $derived(isBrandImageSelectionSettled(brand))
  const picks = $derived(brand.imagePicks)
</script>

{#if show && picks.length}
  <div
    class="pick-color-strip"
    role="img"
    aria-label="선택한 브랜드 색 {picks.length}개"
  >
    {#each picks as pick (brandImagePickKey(pick))}
      <span
        class="pick-color-segment color-chip"
        style:background={pick.hex}
        class:light={needsPickSwatchHairline(pick.hex)}
      ></span>
    {/each}
  </div>
{/if}

<style>
  .pick-color-strip {
    display: flex;
    width: 100%;
    min-height: 48px;
    margin-bottom: 16px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--hairline);
  }
  .pick-color-segment {
    flex: 1 1 0;
    min-width: 0;
    min-height: 48px;
  }
</style>
