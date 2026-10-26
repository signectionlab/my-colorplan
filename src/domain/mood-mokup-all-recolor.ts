import { normalizeMoodboardHex } from './brand-moodboard-svg'
import { applyTemplateColorMap } from './mood-mokup-color-map'

/** mokup-all.svg 샘플 HEX → 사용자 역할 (표 기준) */
export const MOKUP_TEMPLATE_PRIMARY = ['#99A7C1', '#343845'] as const
export const MOKUP_TEMPLATE_SECONDARY = ['#B7A265'] as const
export const MOKUP_TEMPLATE_ACCENT1 = ['#FFFFFF', '#FFF', '#fff'] as const
export const MOKUP_TEMPLATE_ACCENT2 = ['#FF57FF'] as const
export const MOKUP_TEMPLATE_ACCENT3 = ['#00CBE7'] as const

/** 샘플 hex ↔ 현재 Illustrator cls (채색용만) */
const MOKUP_PAINT_CLASS: Record<string, keyof MokupAllUserPalette> = {
  'cls-4': 'primary',
  'cls-6': 'primary',
  'cls-5': 'secondary',
  'cls-3': 'accent1',
  'cls-2': 'accent2',
  'cls-1': 'accent3',
}

export type MokupAllUserPalette = {
  primary: string
  secondary: string
  accent1: string
  accent2: string
  accent3: string
}

const SHAPE_TAG = 'rect|path|ellipse|circle|polygon|polyline|line'

function normalizePalette(user: MokupAllUserPalette): MokupAllUserPalette {
  return {
    primary: normalizeMoodboardHex(user.primary),
    secondary: normalizeMoodboardHex(user.secondary),
    accent1: normalizeMoodboardHex(user.accent1),
    accent2: normalizeMoodboardHex(user.accent2),
    accent3: normalizeMoodboardHex(user.accent3),
  }
}

function shorthandHex(hex6: string): string | null {
  const n = normalizeMoodboardHex(hex6)
  if (!/^#[0-9A-F]{6}$/.test(n)) return null
  const r = n[1]
  const g = n[3]
  const b = n[5]
  if (n[1] !== n[2] || n[3] !== n[4] || n[5] !== n[6]) return null
  return `#${r}${g}${b}`
}

function bindTemplate(map: Map<string, string>, template: string, userHex: string) {
  const to = normalizeMoodboardHex(userHex)
  const from6 = normalizeMoodboardHex(template)
  map.set(from6, to)
  const short = shorthandHex(from6)
  if (short) {
    map.set(short.toUpperCase(), to)
    map.set(short.toLowerCase(), to)
  }
}

export function buildMokupAllTemplateMap(user: MokupAllUserPalette): Map<string, string> {
  const u = normalizePalette(user)
  const map = new Map<string, string>()
  for (const hex of MOKUP_TEMPLATE_PRIMARY) bindTemplate(map, hex, u.primary)
  for (const hex of MOKUP_TEMPLATE_SECONDARY) bindTemplate(map, hex, u.secondary)
  for (const hex of MOKUP_TEMPLATE_ACCENT1) bindTemplate(map, hex, u.accent1)
  for (const hex of MOKUP_TEMPLATE_ACCENT2) bindTemplate(map, hex, u.accent2)
  for (const hex of MOKUP_TEMPLATE_ACCENT3) bindTemplate(map, hex, u.accent3)
  return map
}

export function stripMokupXmlProlog(svgMarkup: string): string {
  return svgMarkup.replace(/^\s*<\?xml[^?]*\?>\s*/i, '')
}

export function stripMokupRasterImages(svgMarkup: string): string {
  return svgMarkup.replace(/<image\b[\s\S]*?\/>/gi, '')
}

function patchStyleClassFill(svgMarkup: string, className: string, hex: string): string {
  const fill = normalizeMoodboardHex(hex)
  const re = new RegExp(
    `(\\.${className}\\s*\\{[^}]*?fill:\\s*)#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})`,
    'i',
  )
  return svgMarkup.replace(re, `$1${fill}`)
}

function applyClassStyleFills(svgMarkup: string, user: MokupAllUserPalette): string {
  const u = normalizePalette(user)
  let out = svgMarkup
  for (const [cls, role] of Object.entries(MOKUP_PAINT_CLASS)) {
    out = patchStyleClassFill(out, cls, u[role])
  }
  return out
}

function applyInlineFills(svgMarkup: string, user: MokupAllUserPalette): string {
  const u = normalizePalette(user)
  let out = svgMarkup
  for (const [cls, role] of Object.entries(MOKUP_PAINT_CLASS)) {
    const fill = u[role]
    const tagRe = new RegExp(
      `<(${SHAPE_TAG})\\b([^>]*\\bclass="[^"]*\\b${cls}\\b[^"]*"[^>]*?)(\\/?>)`,
      'gi',
    )
    out = out.replace(tagRe, (_full, tag, attrs, close) => {
      let next = attrs.replace(/\/\s*$/, '')
      if (/\bfill="/i.test(next)) {
        next = next.replace(/\bfill="[^"]*"/i, `fill="${fill}"`)
      } else {
        next = `${next} fill="${fill}"`
      }
      return close === '/>' ? `<${tag}${next}/>` : `<${tag}${next}>`
    })
  }
  return out
}

/** mokup-all.svg — 사용자 팔레트 반영 */
export function applyMokupAllPalette(svgMarkup: string, user: MokupAllUserPalette): string {
  let out = stripMokupXmlProlog(stripMokupRasterImages(svgMarkup))
  out = applyTemplateColorMap(out, buildMokupAllTemplateMap(user))
  out = applyClassStyleFills(out, user)
  out = applyInlineFills(out, user)
  return out
}
