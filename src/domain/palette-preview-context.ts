import { normalizeAccentPartSplit, paletteBarSegmentPercents } from './accent-part-ratios'
import { accentPlanSlotCount, pickByPlanKey } from './brand-image'
import type { Project } from '../types/project'
import { pickChipColorName } from './learn-brand-pick'
import { roleForSlotRatio } from './role-assignment'

export type PlanAccentPreviewItem = { hex: string; label: string; barPct: number }

export function palettePreviewSubtitle(brand: Project['brand']): string {
  if (brand.intro.trim()) {
    const t = brand.intro.trim()
    return t.length > 56 ? `${t.slice(0, 56)}…` : t
  }
  return '선택한 색을 어디에 어떻게 사용할지 확인해 보세요.'
}

export function accentPartRatiosLive(
  brand: Project['brand'],
  palette: Project['palette'],
): [number, number, number] {
  const accentSlots = accentPlanSlotCount(brand)
  return normalizeAccentPartSplit(accentSlots, palette.ratios[2], palette.accentPartRatios ?? null)
}

export function planAccentPreviewItems(
  brand: Project['brand'],
  palette: Project['palette'],
): PlanAccentPreviewItem[] {
  const pickCount = brand.imagePicks.length
  const accentSlots = accentPlanSlotCount(brand)
  if (pickCount < 3 || accentSlots <= 1) return []
  const parts = accentPartRatiosLive(brand, palette)
  return Array.from({ length: accentSlots }, (_, s) => {
    const pick = pickByPlanKey(brand, brand.accentPlanPickKeys?.[s as 0 | 1 | 2] ?? null)
    const hex = pick?.hex ?? palette.colors[2].hex
    const label = pick ? pickChipColorName(pick) : `강조 ${s + 1}`
    return { hex, label, barPct: parts[s] ?? 0 }
  })
}

export type PaletteRoleColors = {
  background: string
  body: string
  accentHex: string
  accentSecondaryHex: string | null
}

function segmentHex(brand: Project['brand'], palette: Project['palette'], index: number): string {
  if (index === 0) return palette.colors[0].hex
  if (index === 1) return palette.colors[1].hex
  const pick = pickByPlanKey(brand, brand.accentPlanPickKeys?.[(index - 2) as 0 | 1 | 2] ?? null)
  return pick?.hex ?? palette.colors[2].hex
}

/** 막대 segment % 기준 주·보·강조 hex (multi-accent 반영) */
export function paletteRoleColors(
  brand: Project['brand'],
  palette: Project['palette'],
): PaletteRoleColors {
  const accentSlots = accentPlanSlotCount(brand)
  const parts = accentPartRatiosLive(brand, palette)
  const segs = paletteBarSegmentPercents(palette.ratios, accentSlots, parts)

  let background = palette.colors[0].hex
  let body = palette.colors[1].hex
  let accentHex = palette.colors[2].hex
  let accentSecondaryHex: string | null = null

  for (let i = 0; i < segs.length; i += 1) {
    const hex = segmentHex(brand, palette, i)
    const role = roleForSlotRatio(segs[i])
    if (role === '주조색') background = hex
    else if (role === '보조색') body = hex
    else if (role === '강조색') accentHex = hex
  }

  if (accentSlots > 1) {
    accentHex = segmentHex(brand, palette, 2)
    accentSecondaryHex = segmentHex(brand, palette, 3)
  }

  return { background, body, accentHex, accentSecondaryHex }
}

/** 강조 1·2·3 슬롯 hex (슬롯 미사용 시 1번 강조색으로 채움) */
export function paletteAccentSlotHexes(
  brand: Project['brand'],
  palette: Project['palette'],
): [string, string, string] {
  const slots = accentPlanSlotCount(brand)
  const accent1 = segmentHex(brand, palette, 2)
  const accent2 = slots >= 2 ? segmentHex(brand, palette, 3) : accent1
  const accent3 = slots >= 3 ? segmentHex(brand, palette, 4) : accent1
  return [accent1, accent2, accent3]
}

export type PaletteBarSegment = { hex: string; name: string; widthPct: number; roleLabel: string }

export function paletteBarSegmentsForDisplay(
  brand: Project['brand'],
  palette: Project['palette'],
): PaletteBarSegment[] {
  const accentSlots = accentPlanSlotCount(brand)
  const parts = accentPartRatiosLive(brand, palette)
  const segs = paletteBarSegmentPercents(palette.ratios, accentSlots, parts)
  const labels =
    accentSlots > 1
      ? [
          `${palette.colors[0].name}`,
          `${palette.colors[1].name}`,
          ...planAccentPreviewItems(brand, palette).map((p) => p.label),
        ]
      : palette.colors.map((c) => c.name)

  return segs.map((widthPct, i) => ({
    hex:
      i < 2
        ? palette.colors[i].hex
        : (planAccentPreviewItems(brand, palette)[i - 2]?.hex ?? palette.colors[2].hex),
    name: labels[i] ?? `색 ${i + 1}`,
    widthPct,
    roleLabel: roleForSlotRatio(widthPct),
  }))
}
