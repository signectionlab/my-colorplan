<script lang="ts">
  let {
    label,
    hex,
    onchange,
    hexInDetails = false,
  }: {
    label: string
    hex: string
    onchange: (hex: string) => void
    /** true면 HEX 입력을 상세 설정 접힘 영역에 둡니다 */
    hexInDetails?: boolean
  } = $props()
</script>

<div class="picker" class:compact={hexInDetails}>
  <span class="label">{label}</span>
  <input aria-label="{label} 색상" type="color" value={hex} oninput={(e) => onchange(e.currentTarget.value)} />
  {#if !hexInDetails}
    <input
      class="text-input tabular"
      aria-label="{label} 색 코드"
      value={hex}
      onchange={(e) => onchange(e.currentTarget.value)}
    />
  {/if}
</div>
{#if hexInDetails}
  <details class="hex-details">
    <summary>색 코드(HEX) 직접 입력</summary>
    <input
      class="text-input tabular"
      aria-label="{label} 색 코드"
      value={hex}
      onchange={(e) => onchange(e.currentTarget.value)}
    />
  </details>
{/if}

<style>
  .picker {
    display: grid;
    grid-template-columns: auto 52px 1fr;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
  .picker.compact {
    grid-template-columns: auto 52px;
    margin-bottom: 4px;
  }
  input[type='color'] {
    width: 52px;
    height: 40px;
    padding: 0;
    border: 0;
    background: transparent;
  }
  .hex-details {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--ink-mute);
  }
  .hex-details input {
    width: 100%;
    margin-top: 8px;
  }
  .label {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }
</style>
