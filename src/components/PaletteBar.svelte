<script lang="ts">
  let { colors, ratios, label = '현재 팔레트' }: { colors: { name: string; hex: string }[]; ratios: readonly number[]; label?: string } = $props()
</script>

<div>
  <p class="caption">{label}</p>
  <div class="bar" role="img" aria-label={colors.map((color, i) => `${color.name} ${ratios[i]}퍼센트`).join(', ')}>
    {#each colors as color, i}
      <span style:width="{ratios[i]}%" style:background={color.hex}></span>
    {/each}
  </div>
</div>

<style>
  .bar { display: flex; height: 48px; overflow: hidden; border-radius: 8px; border: 1px solid var(--hairline); margin-top: 8px; }
  span { min-width: 0; }
</style>
