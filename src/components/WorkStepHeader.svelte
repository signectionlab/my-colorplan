<script lang="ts">
  import StepHero from './StepHero.svelte'
  import { store } from '../state/project-state.svelte'
  import { STEP_META, STEPS, type StepId } from '../types/project'

  interface Props {
    title: string
    lede: string
  }
  let { title, lede }: Props = $props()

  const stepIndex = $derived(STEPS.indexOf(store.project.screen as StepId))
  const total = STEP_META.length
</script>

<StepHero {stepIndex} {total} {title} {lede} />
