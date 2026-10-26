/** 컬러 칩 hairline — 흰·거의 무채 밝은색만 (유채 밝은색·노랑 등 제외). design.md § 컬러 칩 hairline */
export function needsPickSwatchHairline(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  if (Number.isNaN(n)) return false
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const spread = Math.max(r, g, b) - Math.min(r, g, b)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma >= 225 && spread <= 28
}
