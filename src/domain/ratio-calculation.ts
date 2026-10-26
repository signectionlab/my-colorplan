import {
  ACCENT_PALETTE_SLOT_INDEX,
  MIN_PALETTE_RATIO_PCT,
  MULTI_PICK_ACCENT_SLOT_MAX_PCT,
} from './role-assignment'

export const DEFAULT_RATIOS: [number, number, number] = [60, 30, 10]

/** 브랜드 Step 2 색채계획 고정 비율 */
export const BRAND_PLAN_RATIOS: [number, number, number] = [70, 20, 10]

function distribute(values: number[], target: number): number[] {
  const floored = values.map((value) => Math.floor(value))
  let rest = target - floored.reduce((sum, value) => sum + value, 0)
  const order = values
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  const next = [...floored]
  for (const item of order) {
    if (rest <= 0) break
    next[item.index] += 1
    rest -= 1
  }
  return next
}

export function setRatio(
  ratios: readonly [number, number, number],
  index: number,
  nextValue: number,
): [number, number, number] {
  const clamped = Math.max(MIN_PALETTE_RATIO_PCT, Math.min(100, Math.round(nextValue)))
  const others = [0, 1, 2].filter((i) => i !== index)
  const remaining = 100 - clamped
  const otherSum = ratios[others[0]] + ratios[others[1]]
  const scaled =
    otherSum === 0 ? [remaining / 2, remaining / 2] : others.map((i) => (ratios[i] / otherSum) * remaining)
  const distributed = distribute(scaled, remaining)
  const next: [number, number, number] = [ratios[0], ratios[1], ratios[2]]
  next[index] = clamped
  next[others[0]] = distributed[0]
  next[others[1]] = distributed[1]
  return next
}

/** 합 100·슬롯별 최소 비율을 맞춘다 */
export function normalizeRatiosTriple(
  raw: readonly [number, number, number],
): [number, number, number] {
  const min = MIN_PALETTE_RATIO_PCT
  let r: [number, number, number] = [
    Math.max(min, Math.round(raw[0])),
    Math.max(min, Math.round(raw[1])),
    Math.max(min, Math.round(raw[2])),
  ]
  let sum = r[0] + r[1] + r[2]
  if (sum === 100) return r
  if (sum > 100) {
    let over = sum - 100
    const order = [0, 1, 2].sort((a, b) => r[b] - r[a])
    for (const i of order) {
      const take = Math.min(over, r[i] - min)
      r[i] -= take
      over -= take
      if (over <= 0) break
    }
    return r
  }
  let under = 100 - sum
  const order = [0, 1, 2].sort((a, b) => r[b] - r[a])
  for (const i of order) {
    r[i] += under
    break
  }
  return r
}

/** pick 4~5: 3번 슬롯(강조) 합계를 10% 이하로 맞추고 초과분을 0·1번에 배분 */
export function capMultiPickAccentSlot(
  ratios: readonly [number, number, number],
  enforce: boolean,
): [number, number, number] {
  if (!enforce) return normalizeRatiosTriple(ratios)
  const idx = ACCENT_PALETTE_SLOT_INDEX
  if (ratios[idx] <= MULTI_PICK_ACCENT_SLOT_MAX_PCT) return normalizeRatiosTriple(ratios)
  const excess = ratios[idx] - MULTI_PICK_ACCENT_SLOT_MAX_PCT
  const r: [number, number, number] = [ratios[0], ratios[1], MULTI_PICK_ACCENT_SLOT_MAX_PCT]
  const sum01 = r[0] + r[1]
  if (sum01 <= 0) {
    r[0] += excess
  } else {
    const add0 = Math.round((excess * r[0]) / sum01)
    r[0] += add0
    r[1] += excess - add0
  }
  return normalizeRatiosTriple(r)
}
