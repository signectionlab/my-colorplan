<script lang="ts">
  import SaveStatus from './SaveStatus.svelte'
  import { goTo, saveProjectNow } from '../state/project-state.svelte'
</script>

<div class="app-save-bar">
  <div class="app-save-bar-inner">
    <button class="app-save-brand" type="button" onclick={() => goTo('brand')} aria-label="1단계 브랜드 화면으로 이동">
      MY BRAND COLOR
    </button>
    <SaveStatus compact onDark />
    <button class="btn btn-save" type="button" onclick={saveProjectNow}>저장하기</button>
  </div>
</div>

<style>
  .app-save-bar {
    position: sticky;
    top: 0;
    z-index: 30;
    min-height: var(--app-save-bar-h);
    background: var(--step-toolbar-bg, #202239);
    color: #fff;
    box-shadow: 0 6px 24px #171a2822;
  }
  .app-save-bar-inner {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    max-width: calc(var(--step-wrap, 940px) + 40px);
    margin: 0 auto;
    padding: 10px 20px;
  }
  .app-save-brand {
    margin-right: auto;
    padding: 4px 0;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #a89ef0;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }
  .app-save-brand:hover {
    color: #c4bcff;
  }
  .app-save-brand:focus-visible {
    outline: 2px solid #a89ef0;
    outline-offset: 3px;
    border-radius: 4px;
  }
  .btn-save {
    min-height: 36px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 700;
    background: #363950;
    color: #fff;
    border: 1px solid #50546f;
    border-radius: 8px;
  }
  .btn-save:hover {
    background: #424664;
  }
</style>
