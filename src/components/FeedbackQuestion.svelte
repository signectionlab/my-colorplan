<script lang="ts">
  let {
    question,
    value,
    hint = '',
    placeholder = '한 줄만 적어도 됩니다.',
    oninput,
  }: {
    question: string
    value: string
    hint?: string
    placeholder?: string
    oninput: (value: string) => void
  } = $props()
</script>

<label class="field">
  <span>{question}</span>
  {#if hint}
    <p class="hint caption caption-guide">{hint}</p>
  {/if}
  <textarea rows="1" {value} {placeholder} oninput={(e) => oninput(e.currentTarget.value)}></textarea>
</label>

<style>
  .hint {
    margin: 4px 0 6px;
  }
</style>
