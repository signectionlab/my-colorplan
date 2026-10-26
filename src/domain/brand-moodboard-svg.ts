/** 목업 SVG에 박혀 있는 템플릿 팔레트 hex */
export const MOODBOARD_TEMPLATE_PRIMARY = '#315E53'
export const MOODBOARD_TEMPLATE_SECONDARY = '#E6D9BE'
export const MOODBOARD_TEMPLATE_ACCENT = '#DF925D'

export type MoodboardSvgColors = {
  primary: string
  secondary: string
  accent: string
  accentSecondary?: string | null
  accentTertiary?: string | null
}

export function escapeXmlForSvg(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function normalizeMoodboardHex(hex: string): string {
  const t = hex.trim()
  const six = /^#?([0-9a-f]{6})$/i.exec(t)
  if (six) return `#${six[1].toUpperCase()}`
  const three = /^#?([0-9a-f]{3})$/i.exec(t)
  if (three) {
    const [r, g, b] = three[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  return t.startsWith('#') ? t : `#${t}`
}

export function replaceHexList(svg: string, fromList: readonly string[], to: string): string {
  let out = svg
  for (const from of fromList) {
    const pattern = new RegExp(from.replace('#', '#'), 'gi')
    out = out.replace(pattern, to)
  }
  return out
}

const BRAND_PLACEHOLDERS = [
  'MY BRAND',
  'MY SPACE',
  'YOUR NAME',
  'PRODUCT NAME',
  'BRAND EXPERIENCE',
] as const

/** 템플릿 SVG → 사용자 팔레트·브랜드명 */
export function personalizeMoodboardSvg(
  svgMarkup: string,
  brandName: string,
  colors: MoodboardSvgColors,
): string {
  const primary = normalizeMoodboardHex(colors.primary)
  const secondary = normalizeMoodboardHex(colors.secondary)
  const accent = normalizeMoodboardHex(colors.accent)
  const accent2 = colors.accentSecondary ? normalizeMoodboardHex(colors.accentSecondary) : accent

  const safeName = escapeXmlForSvg(brandName.trim() || 'MY BRAND')
  let out = svgMarkup

  out = out.replaceAll('var(--primary, #315E53)', primary)
  out = out.replaceAll('var(--secondary, #E6D9BE)', secondary)
  out = out.replaceAll('var(--accent, #DF925D)', accent)
  out = out.replaceAll('var(--accent-2, #DF925D)', accent2)

  out = out.replaceAll(MOODBOARD_TEMPLATE_PRIMARY, primary)
  out = out.replaceAll(MOODBOARD_TEMPLATE_SECONDARY, secondary)
  out = out.replaceAll(MOODBOARD_TEMPLATE_ACCENT, accent)

  for (const placeholder of BRAND_PLACEHOLDERS) {
    out = out.replaceAll(placeholder, safeName)
  }

  out = out.replaceAll('>BRAND</text>', `>${safeName}</text>`)

  return out
}
