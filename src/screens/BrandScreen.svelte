<script lang="ts">
  import ApplyFieldPicker from '../components/ApplyFieldPicker.svelte'
  import Field from '../components/Field.svelte'
  import ReasonHints from '../components/ReasonHints.svelte'
  import BrandImagePicker from '../components/BrandImagePicker.svelte'
  import BrandColorPlan from '../components/BrandColorPlan.svelte'
  import { isBrandImageSelectionSettled } from '../domain/brand-image'
  import { store, patchBrand } from '../state/project-state.svelte'

  const selectionSettled = $derived(isBrandImageSelectionSettled(store.project.brand))
</script>

<Field label="브랜드명 또는 사업 아이디어" value={store.project.brand.name} placeholder="예: 온기 베이커리" oninput={(value) => patchBrand({ name: value })} />

<ApplyFieldPicker />

<BrandImagePicker />

{#if selectionSettled}
  <section class="brand-step2-block card">
    <BrandColorPlan inset />
    <div class="brand-reason">
      <Field
        label="색과 톤을 고른 이유"
        caption="색을 고른 이유를 작성해주세요. 정답이나 점수는 아니에요."
        placeholder="예 : 따뜻한 느낌이 들어서"
        value={store.project.brand.keywordReason}
        multiline
        oninput={(value) => patchBrand({ keywordReason: value })}
      />
      <ReasonHints onpick={(text) => patchBrand({ keywordReason: text })} />
    </div>
  </section>
{/if}

<style>
  .brand-step2-block {
    padding: 0;
    margin-bottom: 24px;
    overflow: hidden;
  }
  .brand-reason {
    padding: 20px 24px 24px;
  }
  .brand-reason :global(.field:last-child) {
    margin-bottom: 0;
  }
</style>
