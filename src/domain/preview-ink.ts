import { contrastRatio } from './contrast'

const WHITE = '#ffffff'
const INK = '#0d253d'

export function previewInk(textHex: string, backgroundHex: string): { color: string; adjusted: boolean } {
  const current = contrastRatio(textHex, backgroundHex)
  if (current !== null && current >= 4.5) return { color: textHex, adjusted: false }
  const white = contrastRatio(WHITE, backgroundHex) ?? 0
  const ink = contrastRatio(INK, backgroundHex) ?? 0
  return { color: white >= ink ? WHITE : INK, adjusted: true }
}
