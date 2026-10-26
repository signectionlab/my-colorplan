<script lang="ts">
  import { REASON_HINTS } from '../types/project'
  let { onpick }: { onpick: (text: string) => void } = $props()
</script>

<div class="hints">
  <div class="chips">
    {#each REASON_HINTS as hint}
      <button type="button" class="chip" onclick={() => onpick(hint)}>{hint}</button>
    {/each}
  </div>
</div>
