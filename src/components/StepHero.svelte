<script lang="ts">
  interface Props {
    stepIndex: number
    total?: number
    title: string
    lede: string
    pill?: string
  }
  let { stepIndex, total = 6, title, lede, pill }: Props = $props()

  const pillLabel = $derived(
    pill ?? `STEP ${String(stepIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  )
</script>

<header class="step-hero">
  <div class="step-hero-topline">
    <span class="step-hero-eyebrow">COLOR PLAN</span>
    <span class="step-hero-pill">{pillLabel}</span>
  </div>
  <div class="step-hero-progress" aria-hidden="true">
    {#each Array.from({ length: total }) as _, index (index)}
      <span class:current={index === stepIndex}></span>
    {/each}
  </div>
  <h1 class="step-hero-title">{title}</h1>
  <p class="step-hero-lede">{lede}</p>
</header>
