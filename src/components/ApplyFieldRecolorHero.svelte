<script lang="ts">
  import { applyFieldRecolorAssets } from '../data/apply-field-recolor'
  import { applyFieldReferenceImageAlt } from '../data/apply-field-reference-image'
  import {
    APPLY_FIELD_REFERENCE_HEIGHT,
    APPLY_FIELD_REFERENCE_WIDTH,
  } from '../data/apply-field-reference-image'
  import {
    defaultCompositeStrength,
    renderApplyFieldCompositeToCanvas,
    type CompositeImageFit,
  } from '../domain/apply-field-composite'
  import type { ApplyFieldReferenceId } from '../data/apply-field-reference-image'

  let {
    applyFieldId,
    fieldTitle,
    primaryHex,
    secondaryHex,
    accentHex,
    readable = false,
    fit = 'cover',
    inline = false,
    onCompositeFailed,
    onCompositeSucceeded,
  }: {
    applyFieldId: ApplyFieldReferenceId
    fieldTitle: string
    primaryHex: string
    secondaryHex: string
    accentHex: string
    readable?: boolean
    /** cover: 무드보드 hero · contain: 계획서 등 프레임에 맞춤 */
    fit?: CompositeImageFit
    /** true면 부모가 aspect-ratio·크기를 정함 */
    inline?: boolean
    onCompositeFailed?: () => void
    onCompositeSucceeded?: () => void
  } = $props()

  const assets = $derived(applyFieldRecolorAssets(applyFieldId))
  const alt = $derived(applyFieldReferenceImageAlt(applyFieldId, fieldTitle))

  let canvasEl: HTMLCanvasElement | undefined = $state()
  let frameEl: HTMLDivElement | undefined = $state()
  let compositeOk = $state(true)

  function syncCanvasSize() {
    if (!canvasEl || !frameEl) return
    const rect = frameEl.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    if (canvasEl.width !== w || canvasEl.height !== h) {
      canvasEl.width = w
      canvasEl.height = h
    }
  }

  async function paint() {
    if (!canvasEl || !assets) return
    syncCanvasSize()
    compositeOk = true
    try {
      await renderApplyFieldCompositeToCanvas(
        canvasEl,
        {
          base: assets.base,
          maskPrimary: assets.maskPrimary,
          maskSecondary: assets.maskSecondary,
          maskAccent: assets.maskAccent,
        },
        { primary: primaryHex, secondary: secondaryHex, accent: accentHex },
        defaultCompositeStrength(readable),
        fit,
      )
      onCompositeSucceeded?.()
    } catch {
      compositeOk = false
      onCompositeFailed?.()
    }
  }

  $effect(() => {
    primaryHex
    secondaryHex
    accentHex
    readable
    fit
    assets
    canvasEl
    frameEl
    void paint()
  })

  $effect(() => {
    if (!frameEl) return
    const ro = new ResizeObserver(() => {
      void paint()
    })
    ro.observe(frameEl)
    return () => ro.disconnect()
  })
</script>

{#if assets}
  <div class="recolor-hero" class:inline bind:this={frameEl}>
    <canvas class="hero-canvas" bind:this={canvasEl} role="img" aria-label={alt}></canvas>
    {#if !compositeOk}
      <img
        class="fallback"
        class:contain={fit === 'contain'}
        src={assets.base}
        {alt}
        width={APPLY_FIELD_REFERENCE_WIDTH}
        height={APPLY_FIELD_REFERENCE_HEIGHT}
        loading="lazy"
        decoding="async"
      />
    {/if}
  </div>
{/if}

<style>
  .recolor-hero {
    position: relative;
    width: 100%;
    aspect-ratio: 1586 / 992;
    border-radius: 14px;
    overflow: hidden;
    background: var(--canvas-soft);
  }
  .recolor-hero.inline {
    height: 100%;
    aspect-ratio: auto;
    border-radius: 0;
  }
  .hero-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  .fallback.contain {
    object-fit: contain;
  }
</style>
