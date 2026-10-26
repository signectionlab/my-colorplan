<script lang="ts">
  let {
    label,
    caption = '',
    value,
    placeholder = '',
    multiline = false,
    oninput,
  }: {
    label: string
    caption?: string
    value: string
    placeholder?: string
    multiline?: boolean
    oninput: (value: string) => void
  } = $props()
</script>

<label class="field">
  <span class="field-label-row">
    <span class="field-label">{label}</span>
    {#if caption.trim()}
      <small class="caption caption-guide field-caption">{caption}</small>
    {/if}
  </span>
  {#if multiline}
    <textarea rows="1" {placeholder} {value} oninput={(e) => oninput(e.currentTarget.value)}></textarea>
  {:else}
    <input {placeholder} {value} oninput={(e) => oninput(e.currentTarget.value)} />
  {/if}
</label>

<style>
  .field-label-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px 10px;
  }
  .field-label {
    font-size: 14px;
    font-weight: 600;
  }
  .field-caption {
    margin: 0;
    font-size: 12px;
  }
</style>
