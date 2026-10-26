import { normalizeMoodboardHex } from './brand-moodboard-svg'

export type MoodboardRoleRatios = {
  primaryPct: number
  secondaryPct: number
  accentPct: number
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(normalizeMoodboardHex(hex))
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

/** 밝은 배경면만 보조로 고정 (어두운 잉크·UI는 비율 매핑에 포함) */
function isNeutralSurface(hex: string): boolean {
  return relativeLuminance(hex) > 0.9
}

/** SVG 마크업에서 도형 크기 기반 면적 추정 (Node·테스트용) */
export function estimateTemplateColorAreas(svgMarkup: string): Map<string, number> {
  const weights = new Map<string, number>()
  const add = (raw: string, area: number) => {
    const hex = normalizeMoodboardHex(raw)
    if (!/^#[0-9A-F]{6}$/.test(hex)) return
    weights.set(hex, (weights.get(hex) ?? 0) + area)
  }

  const tagRe = /<(rect|circle|ellipse|path|polygon)[^>]*>/gi
  let tag: RegExpExecArray | null
  while ((tag = tagRe.exec(svgMarkup))) {
    const chunk = tag[0]
    const fill = chunk.match(/fill="(#[0-9a-fA-F]{6})"/)?.[1]
    if (!fill) continue
    const w = Number(chunk.match(/width="([\d.]+)"/)?.[1] ?? 0)
    const h = Number(chunk.match(/height="([\d.]+)"/)?.[1] ?? 0)
    const r = Number(chunk.match(/\sr="([\d.]+)"/)?.[1] ?? 0)
    const rx = Number(chunk.match(/\srx="([\d.]+)"/)?.[1] ?? 0)
    const ry = Number(chunk.match(/\sry="([\d.]+)"/)?.[1] ?? 0)
    let area = 800
    if (w > 0 && h > 0) area = w * h
    else if (r > 0) area = Math.PI * r * r
    else if (rx > 0 && ry > 0) area = Math.PI * rx * ry
    add(fill, area)
  }

  const stopRe = /stop-color="(#[0-9a-fA-F]{6})"/gi
  let stop: RegExpExecArray | null
  while ((stop = stopRe.exec(svgMarkup))) {
    add(stop[1], 400)
  }

  if (weights.size === 0) {
    const hexRe = /#([0-9a-fA-F]{6})\b/g
    let m: RegExpExecArray | null
    while ((m = hexRe.exec(svgMarkup))) {
      add(`#${m[1]}`, 100)
    }
  }

  return weights
}

/** 브라우저: 렌더 픽셀 기준 면적 (더 정확) */
export async function measureTemplateColorAreasFromCanvas(svgMarkup: string): Promise<Map<string, number>> {
  if (typeof document === 'undefined') {
    return estimateTemplateColorAreas(svgMarkup)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
    img.onload = () => {
      try {
        const w = 400
        const h = 280
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(estimateTemplateColorAreas(svgMarkup))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        const counts = new Map<string, number>()
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue
          const hex = rgbToHex(data[i], data[i + 1], data[i + 2])
          counts.set(hex, (counts.get(hex) ?? 0) + 1)
        }
        URL.revokeObjectURL(url)
        resolve(counts)
      } catch {
        URL.revokeObjectURL(url)
        resolve(estimateTemplateColorAreas(svgMarkup))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('svg rasterize failed'))
    }
    img.src = url
  })
}

export type TemplateColorRole = 'primary' | 'secondary' | 'accent'

/** 템플릿 색 → 주·보·강 (4단계 막대 % 기준 누적 면적) */
export function mapTemplateColorsToRoles(
  areaByColor: Map<string, number>,
  ratios: MoodboardRoleRatios,
): Map<string, TemplateColorRole> {
  const neutral = new Map<string, number>()
  const chromatic = new Map<string, number>()

  for (const [hex, area] of areaByColor) {
    if (isNeutralSurface(hex)) neutral.set(hex, (neutral.get(hex) ?? 0) + area)
    else chromatic.set(hex, (chromatic.get(hex) ?? 0) + area)
  }

  const roleMap = new Map<string, TemplateColorRole>()
  for (const hex of neutral.keys()) {
    roleMap.set(hex, 'secondary')
  }

  const sorted = [...chromatic.entries()].sort((a, b) => b[1] - a[1])
  const total = sorted.reduce((s, [, w]) => s + w, 0)
  if (total <= 0) return roleMap

  const pPct = Math.max(0, ratios.primaryPct)
  const sPct = Math.max(0, ratios.secondaryPct)
  const aPct = Math.max(0, ratios.accentPct)
  const sum = pPct + sPct + aPct || 100
  const targetP = total * (pPct / sum)
  const targetS = total * (sPct / sum)

  let used = 0
  for (const [hex, weight] of sorted) {
    let role: TemplateColorRole = 'accent'
    if (used < targetP) role = 'primary'
    else if (used < targetP + targetS) role = 'secondary'
    roleMap.set(hex, role)
    used += weight
  }

  return roleMap
}

export function buildTemplateToUserHexMap(
  roleMap: Map<string, TemplateColorRole>,
  user: { primary: string; secondary: string; accent: string },
): Map<string, string> {
  const out = new Map<string, string>()
  for (const [template, role] of roleMap) {
    if (role === 'primary') out.set(template, user.primary)
    else if (role === 'secondary') out.set(template, user.secondary)
    else out.set(template, user.accent)
  }
  return out
}

export function applyTemplateColorMap(svgMarkup: string, templateToUser: Map<string, string>): string {
  const entries = [...templateToUser.entries()].sort((a, b) => b[0].length - a[0].length)
  let out = svgMarkup
  for (const [from, to] of entries) {
    if (from.toUpperCase() === to.toUpperCase()) continue
    const escaped = from.replace('#', '\\#')
    const pattern = new RegExp(`${escaped}(?![0-9a-fA-F])`, 'gi')
    out = out.replace(pattern, to)
  }
  return out
}
