<script lang="ts">
  import './brand-moodboard-panel.css'
  import {
    fetchMoodMokupSvg,
    moodMokupSvgUrlForField,
  } from '../data/brand-moodboard'
  import { applyMokupAllPalette } from '../domain/mood-mokup-all-recolor'
  import type { ApplyFieldId } from '../types/project'

  let {
    applyFieldId,
    primaryHex,
    secondaryHex,
    accent1Hex,
    accent2Hex,
    accent3Hex,
    panelLabel = '브랜드 무드보드',
  }: {
    applyFieldId: ApplyFieldId | null
    primaryHex: string
    secondaryHex: string
    accent1Hex: string
    accent2Hex: string
    accent3Hex: string
    panelLabel?: string
  } = $props()

  const mokupUrl = $derived(moodMokupSvgUrlForField(applyFieldId))

  let svgHtml = $state('')
  let loadError = $state(false)

  $effect(() => {
    const url = mokupUrl
    const palette = {
      primary: primaryHex,
      secondary: secondaryHex,
      accent1: accent1Hex,
      accent2: accent2Hex,
      accent3: accent3Hex,
    }
    loadError = false
    svgHtml = ''

    if (!url) return

    let cancelled = false
    void (async () => {
      try {
        const raw = await fetchMoodMokupSvg(url)
        if (cancelled) return
        svgHtml = applyMokupAllPalette(raw, palette)
      } catch {
        if (!cancelled) loadError = true
      }
    })()

    return () => {
      cancelled = true
    }
  })
</script>

<div class="moodboard-panel" aria-label={panelLabel}>
  <div class="moodboard-stage">
    {#if loadError}
      <p class="moodboard-fallback" role="status">목업 이미지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
    {:else if svgHtml}
      <div class="moodboard-svg-host">{@html svgHtml}</div>
    {:else}
      <p class="moodboard-fallback" aria-busy="true">목업을 준비하고 있어요…</p>
    {/if}
  </div>
</div>
