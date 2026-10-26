<script lang="ts">
  import {
    APPLY_FIELD_REFERENCE_HEIGHT,
    APPLY_FIELD_REFERENCE_WIDTH,
    applyFieldReferenceImageAlt,
    applyFieldReferenceImageFileName,
    applyFieldReferenceImageSrc,
    isApplyFieldReferenceId,
  } from '../data/apply-field-reference-image'
  import type { ApplyFieldId } from '../types/project'

  interface Props {
    applyFieldId: ApplyFieldId | null
    fieldTitle: string
    /** compact: 2단계 맥락 · plan: 6단계(부모 프레임) · hero: 5단계 무드보드 */
    layout?: 'compact' | 'hero' | 'plan'
  }

  let { applyFieldId, fieldTitle, layout = 'compact' }: Props = $props()

  const referenceId = $derived(
    isApplyFieldReferenceId(applyFieldId) ? applyFieldId : null,
  )
  const src = $derived(referenceId ? applyFieldReferenceImageSrc(referenceId) : null)
  const alt = $derived(
    referenceId ? applyFieldReferenceImageAlt(referenceId, fieldTitle) : '',
  )
  const missingFile = $derived(
    referenceId ? applyFieldReferenceImageFileName(referenceId) : '',
  )

  let imageFailed = $state(false)

  $effect(() => {
    applyFieldId
    imageFailed = false
  })
</script>

{#if src}
  <div
    class="apply-ref-media"
    class:hero={layout === 'hero'}
    class:plan={layout === 'plan'}
  >
    {#if !imageFailed}
      <img
        {src}
        {alt}
        width={APPLY_FIELD_REFERENCE_WIDTH}
        height={APPLY_FIELD_REFERENCE_HEIGHT}
        loading="lazy"
        decoding="async"
        onerror={() => (imageFailed = true)}
      />
    {:else}
      <p class="apply-ref-fallback" role="status">
        참고 이미지(<span class="tabular">{missingFile}</span>)를 불러올 수 없어요. 화면은 그대로
        이용할 수 있습니다.
      </p>
    {/if}
  </div>
{/if}

<style>
  .apply-ref-media {
    width: min(100%, 280px);
    margin-inline: 0;
    aspect-ratio: 1586 / 992;
    border: 1px solid var(--hairline);
    border-radius: 12px;
    overflow: hidden;
    background: var(--canvas-soft);
  }
  .apply-ref-media.hero {
    width: 100%;
    max-width: none;
    border-radius: 14px;
  }
  .apply-ref-media.plan {
    width: 100%;
    height: 100%;
    max-width: none;
    aspect-ratio: auto;
    border: none;
    border-radius: 0;
  }
  .apply-ref-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: var(--canvas-soft);
  }
  .apply-ref-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0;
    padding: 16px 20px;
    font-size: 14px;
    line-height: 1.45;
    text-align: center;
    color: var(--ink-mute);
  }
</style>
