<script lang="ts">
  import AppSaveBar from './components/AppSaveBar.svelte'
  import WorkStepHeader from './components/WorkStepHeader.svelte'
  import StartScreen from './screens/StartScreen.svelte'
  import BrandScreen from './screens/BrandScreen.svelte'
  import LearnScreen from './screens/LearnScreen.svelte'
  import CompareScreen from './screens/CompareScreen.svelte'
  import PaletteScreen from './screens/PaletteScreen.svelte'
  import ReviewScreen from './screens/ReviewScreen.svelte'
  import PlanScreen from './screens/PlanScreen.svelte'
  import { STEP_META } from './types/project'
  import AppCopyright from './components/AppCopyright.svelte'
  import { store, goNext, goPrev, goTo } from './state/project-state.svelte'

  const meta = $derived(STEP_META.find((step) => step.id === store.project.screen) ?? null)
  const ready = $derived(
    store.project.screen !== 'brand' ||
      Boolean(store.project.brand.name.trim() || store.project.brand.keywords.length),
  )

  $effect(() => {
    document.title = '컬러플랜'
  })
</script>

{#if store.project.screen === 'start'}
  <StartScreen />
{:else}
  <div class="app-work-shell">
    <AppSaveBar />
    <main class="app-main">
      {#if store.project.screen === 'plan'}
        <PlanScreen />
      {:else}
        <div class="app-work-wrap">
          {#if meta}
            <WorkStepHeader title={meta.title} lede={meta.lede} />
          {/if}
          {#if store.project.screen === 'brand'}<BrandScreen />
          {:else if store.project.screen === 'learn'}<LearnScreen />
          {:else if store.project.screen === 'compare'}<CompareScreen />
          {:else if store.project.screen === 'palette'}<PaletteScreen />
          {:else if store.project.screen === 'review'}<ReviewScreen />{/if}
        </div>
      {/if}
    </main>
    <footer class="app-footer" aria-label="단계 이동">
      <div class="app-footer-nav">
        <button class="btn btn-ghost" type="button" onclick={() => goTo('start')}>처음</button>
        <button class="btn btn-secondary" type="button" onclick={goPrev}>이전</button>
        {#if meta?.nextLabel}
          <button
            class="btn btn-primary"
            type="button"
            disabled={!ready}
            title={meta.nextLabel}
            onclick={goNext}
          >
            다음단계
          </button>
        {/if}
      </div>
      <AppCopyright />
    </footer>
  </div>
{/if}
