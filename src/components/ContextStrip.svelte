<script lang="ts">
  import PaletteBar from './PaletteBar.svelte'
  import { store } from '../state/project-state.svelte'

  const brand = $derived(store.project.brand)
  const palette = $derived(store.project.palette)
  const colors = $derived(palette.colors.map((c) => ({ name: c.name, hex: c.hex })))
  const ratios = $derived(palette.ratios)
</script>

<aside class="context card">
  <div>
    <p class="caption">처음 정한 방향</p>
    <strong>{brand.name.trim() || '이름 작성 전'}</strong>
    <p>{brand.keywords.length ? brand.keywords.join(', ') : '키워드 작성 전'}</p>
  </div>
  <PaletteBar {colors} {ratios} />
</aside>

<style>
  .context {
    display: grid;
    gap: 16px;
  }

  strong {
    display: block;
    margin: 4px 0;
    font-size: 20px;
    font-weight: 300;
    letter-spacing: -0.2px;
  }

  p { margin: 0; color: #273951; }

  @media (min-width: 800px) {
    .context {
      grid-template-columns: minmax(180px, 280px) 1fr;
      align-items: center;
    }
  }
</style>
