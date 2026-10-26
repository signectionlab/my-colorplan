<script lang="ts">
  import { store } from '../state/project-state.svelte'

  interface Props {
    compact?: boolean
    /** 상단 다크 저장 바 등 어두운 배경 */
    onDark?: boolean
  }
  let { compact = false, onDark = false }: Props = $props()
</script>

<p class="save-status caption" class:compact class:on-dark={onDark} aria-live="polite">
  {#if store.saveStatus === 'saving'}
    {compact ? '저장 중…' : '저장 중'}
  {:else if store.saveStatus === 'saved'}
    {compact ? '저장됨' : '이 브라우저에 자동 저장됨'}
  {:else if store.saveStatus === 'error'}
    {store.saveError}
  {:else if compact}
    자동 저장
  {/if}
</p>

<style>
  .save-status {
    margin: 0;
    white-space: nowrap;
  }
  .save-status.compact {
    font-size: 12px;
    color: var(--ink-mute);
    padding: 0 4px;
  }
  .save-status.compact.on-dark {
    color: #c5c8d8;
  }
</style>
