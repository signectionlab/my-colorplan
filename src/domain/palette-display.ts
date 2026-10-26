import { hueById, neutralPickColorName, toneDefById, NEUTRAL_HUE_ID } from '../data/munsell-brand-image'
import type { BrandImagePick, PaletteColor } from '../types/project'

/** 카드·미리보기용 짧은 색 이름 (긴 KS 라벨 대신) */
export function pickShortLabel(pick: BrandImagePick): string {
  if (pick.hueId === NEUTRAL_HUE_ID) return neutralPickColorName(pick.toneId)
  const hue = hueById(pick.hueId)
  if (!hue) return pick.hex
  const tone = toneDefById(pick.toneId)
  if (tone) return `${tone.nameKo} ${hue.name}`
  return hue.name
}

export function paletteCardTitle(color: PaletteColor, index: number, role: string): string {
  const name = color.name.trim()
  if (name && name.length <= 12 && !name.includes('(')) return name
  return name.split('(')[0]?.trim() || `색 ${index + 1}`
}
