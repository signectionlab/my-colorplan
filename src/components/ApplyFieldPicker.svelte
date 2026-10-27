<script lang="ts">
  import Field from './Field.svelte'
  import { APPLY_FIELD_OPTIONS, applyFieldIconMarkup } from '../data/apply-fields'
  import { applyFieldDisplayText } from '../domain/apply-field'
  import type { ApplyFieldId } from '../types/project'
  import { setApplyField, store } from '../state/project-state.svelte'

  const brand = $derived(store.project.brand)
  const selectedId = $derived(brand.applyFieldId)

  function select(id: ApplyFieldId) {
    if (selectedId === id) {
      setApplyField(null)
      return
    }
    setApplyField(id)
  }

  function onCustomInput(value: string) {
    setApplyField('other', value)
  }

  const summary = $derived.by(() => {
    if (!selectedId) return null
    return applyFieldDisplayText(brand)
  })
</script>

<section class="apply-field" aria-labelledby="apply-field-heading">
  <h3 id="apply-field-heading">선택한 색상을 어디에 사용하고 싶나요?</h3>
  <p class="lede">적용할 곳을 하나 선택하세요. 나중에 바꿀 수 있어요.</p>

  <div class="card-grid" role="radiogroup" aria-labelledby="apply-field-heading">
    {#each APPLY_FIELD_OPTIONS as option (option.id)}
      {@const selected = selectedId === option.id}
      <button
        type="button"
        class="apply-card"
        class:selected
        role="radio"
        aria-checked={selected}
        aria-label="{option.title}. 예: {option.examples}"
        onclick={() => select(option.id)}
      >
        <span class="apply-icon" aria-hidden="true">{@html applyFieldIconMarkup(option.id)}</span>
        <span class="apply-card-body">
          <span class="apply-title">{option.title}</span>
          <span class="apply-examples">{option.examples}</span>
        </span>
        {#if selected}
          <span class="apply-check" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="var(--primary)" />
              <path d="M6 10.2 8.6 12.8 14 7.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        {/if}
      </button>
    {/each}
  </div>

  {#if selectedId === 'other'}
    <div class="custom-wrap">
      <Field
        label="직접 입력 (선택)"
        value={brand.applyFieldCustom}
        placeholder="예: 차량 래핑, 행사 부스"
        oninput={onCustomInput}
      />
    </div>
  {/if}

  {#if summary}
    <p class="summary" aria-live="polite">
      <span class="summary-label">선택한 활용 분야</span>
      <strong>{summary}</strong>
    </p>
  {/if}
</section>

<style>
  .apply-field {
    margin: 24px 0;
    padding: 20px;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: #fff;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 1.05rem;
    font-weight: 600;
  }
  .lede {
    margin: 0 0 4px;
    color: var(--ink-mute);
    font-size: 15px;
    line-height: 1.5;
  }
  .optional {
    margin: 0 0 16px;
  }
  .card-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 960px) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .other-hint {
    margin-top: -8px;
  }
  .apply-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 14px 14px 14px 12px;
    text-align: left;
    border: 2px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: var(--canvas-soft);
    color: var(--ink);
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      box-shadow 0.15s ease;
  }
  .apply-card:hover {
    border-color: var(--primary);
    background: #fff;
  }
  .apply-card.selected {
    border-color: var(--primary);
    background: #f8f6ff;
    box-shadow: 0 0 0 1px rgba(83, 58, 253, 0.12);
  }
  .apply-card:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .apply-icon {
    flex-shrink: 0;
    color: var(--primary-press);
    line-height: 0;
  }
  .apply-card-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding-right: 24px;
  }
  .apply-title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
  .apply-examples {
    font-size: 13px;
    line-height: 1.4;
    color: var(--ink-mute);
  }
  .apply-check {
    position: absolute;
    top: 10px;
    right: 10px;
    line-height: 0;
  }
  .custom-wrap {
    margin-top: 14px;
  }
  .summary {
    margin: 16px 0 0;
    padding: 14px 14px 14px 12px;
    border: none;
    border-radius: var(--radius-lg);
    background: #f8f6ff;
    font-size: 15px;
    line-height: 1.5;
    color: var(--ink);
  }
  .summary-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--primary-press);
    margin-bottom: 4px;
  }
  .summary strong {
    font-weight: 600;
  }
</style>
