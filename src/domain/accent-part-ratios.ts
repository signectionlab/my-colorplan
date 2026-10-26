import { MIN_PALETTE_RATIO_PCT } from './role-assignment'

export type AccentPartTriple = [number, number, number]

export function defaultAccentPartSplit(accentSlots: number, accentTotal: number): AccentPartTriple {
  const next: AccentPartTriple = [0, 0, 0]
  if (accentSlots <= 1) {
    next[0] = accentTotal
    return next
  }
  if (accentSlots === 2) {
    const a = Math.max(MIN_PALETTE_RATIO_PCT, Math.floor(accentTotal / 2))
    next[0] = a
    next[1] = accentTotal - a
    return next
  }
  const each = Math.max(MIN_PALETTE_RATIO_PCT, Math.floor(accentTotal / 3))
  next[0] = each
  next[1] = each
  next[2] = accentTotal - each - each
  return next
}

export function normalizeAccentPartSplit(
  accentSlots: number,
  accentTotal: number,
  raw?: AccentPartTriple | null,
): AccentPartTriple {
  const min = MIN_PALETTE_RATIO_PCT
  if (accentSlots <= 1) {
    return [Math.max(min, Math.round(accentTotal)), 0, 0]
  }
  const base = raw ? [...raw] : defaultAccentPartSplit(accentSlots, accentTotal)
  const next: AccentPartTriple = [0, 0, 0]
  for (let i = 0; i < accentSlots; i += 1) {
    next[i] = Math.max(min, Math.round(base[i] ?? 0))
  }
  let sum = next.slice(0, accentSlots).reduce((a, b) => a + b, 0)
  if (sum !== accentTotal) {
    const scaled = defaultAccentPartSplit(accentSlots, accentTotal)
    for (let i = 0; i < accentSlots; i += 1) next[i] = scaled[i]
    sum = accentTotal
  }
  if (sum !== accentTotal) {
    next[accentSlots - 1] += accentTotal - sum
  }
  return next
}

/** pick 4~5: 막대 전체 기준 [주, 보, 강1, (강2…)] */
export function paletteBarSegmentPercents(
  ratios: readonly [number, number, number],
  accentSlots: number,
  parts: AccentPartTriple,
): number[] {
  if (accentSlots <= 1) return [ratios[0], ratios[1], ratios[2]]
  const split = normalizeAccentPartSplit(accentSlots, ratios[2], parts)
  return [ratios[0], ratios[1], ...split.slice(0, accentSlots)]
}

function clampSegment(value: number, segmentCount: number): number {
  const min = MIN_PALETTE_RATIO_PCT
  const max = 100 - (segmentCount - 1) * min
  return Math.round(Math.max(min, Math.min(max, value)))
}

/** 한 강조(또는 주·보) 막대 % 변경 — 합 100, 각 칸 최소 1% */
export function setPaletteBarSegment(
  ratios: readonly [number, number, number],
  accentSlots: number,
  parts: AccentPartTriple,
  segmentIndex: number,
  rawValue: number,
): { ratios: [number, number, number]; parts: AccentPartTriple } {
  const segs = paletteBarSegmentPercents(ratios, accentSlots, parts)
  const n = segs.length
  const idx = Math.max(0, Math.min(n - 1, segmentIndex))
  const nextVal = clampSegment(rawValue, n)
  const nextSegs = [...segs]
  const delta = nextVal - nextSegs[idx]
  if (delta === 0) {
    return { ratios: [ratios[0], ratios[1], ratios[2]], parts: normalizeAccentPartSplit(accentSlots, ratios[2], parts) }
  }
  nextSegs[idx] = nextVal
  let othersSum = 0
  for (let i = 0; i < n; i += 1) {
    if (i !== idx) othersSum += segs[i]
  }
  let remaining = 100 - nextVal
  for (let i = 0; i < n; i += 1) {
    if (i === idx) continue
    const share = othersSum <= 0 ? remaining / (n - 1) : (segs[i] / othersSum) * remaining
    nextSegs[i] = Math.max(MIN_PALETTE_RATIO_PCT, Math.round(share))
  }
  let sum = nextSegs.reduce((a, b) => a + b, 0)
  if (sum !== 100) {
    const fix = n - 1 === idx ? 0 : idx === 0 ? 1 : 0
    if (fix !== idx) nextSegs[fix] += 100 - sum
  }

  if (accentSlots <= 1) {
    return {
      ratios: [nextSegs[0], nextSegs[1], nextSegs[2]] as [number, number, number],
      parts: [nextSegs[2], 0, 0],
    }
  }
  const accentParts: AccentPartTriple = [0, 0, 0]
  for (let i = 0; i < accentSlots; i += 1) {
    accentParts[i] = nextSegs[2 + i]
  }
  const accentTotal = accentParts.slice(0, accentSlots).reduce((a, b) => a + b, 0)
  return {
    ratios: [nextSegs[0], nextSegs[1], accentTotal] as [number, number, number],
    parts: normalizeAccentPartSplit(accentSlots, accentTotal, accentParts),
  }
}

/** 스택 막대 ratios[2]만 바뀐 뒤 강조 분할 유지·스케일 */
export function syncAccentPartsToAccentTotal(
  accentSlots: number,
  accentTotal: number,
  parts: AccentPartTriple | null | undefined,
): AccentPartTriple {
  if (accentSlots <= 1) return [accentTotal, 0, 0]
  const prev = parts ?? defaultAccentPartSplit(accentSlots, accentTotal)
  const prevSum = prev.slice(0, accentSlots).reduce((a, b) => a + b, 0)
  if (prevSum <= 0) return defaultAccentPartSplit(accentSlots, accentTotal)
  const next: AccentPartTriple = [0, 0, 0]
  let allocated = 0
  for (let i = 0; i < accentSlots; i += 1) {
    if (i === accentSlots - 1) {
      next[i] = accentTotal - allocated
    } else {
      next[i] = Math.max(MIN_PALETTE_RATIO_PCT, Math.round((prev[i] / prevSum) * accentTotal))
      allocated += next[i]
    }
  }
  return normalizeAccentPartSplit(accentSlots, accentTotal, next)
}
