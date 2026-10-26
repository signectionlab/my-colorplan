import { colorsForTab } from '../data/colors'
import {
  COMPARE_TONE_IMAGE_HINTS,
  IMAGE_COMPARE_PERCEPTION_NOTE,
  NEUTRAL_COMPARE_STEP_HINTS,
} from '../data/compare-tone-education'
import { imageAdjectivesForPick } from '../data/color-education-data'
import type { BrandImagePick, LearnBrandPickRecord } from '../types/project'
import {
  ACHROMATIC_TONE_ID,
  hueById,
  imagePickLabel,
  NEUTRAL_HUE_ID,
  NEUTRAL_VALUE_STEPS,
  neutralPickColorName,
  neutralValueLevel,
  toneDefById,
  tonesForHue,
  type MunsellHue,
} from '../data/munsell-brand-image'
export type BrightnessVariant = { label: string; hex: string }

export type ImageComparePair = {
  mine: { hex: string; label: string }
  other: { hex: string; label: string; toneNote: string }
}

export type CompareToneOption = {
  toneId: string
  toneLabelKo: string
  hex: string
  imageHints: string[]
}

export type CompareSideView = {
  hex: string
  colorName: string
  toneLine: string
  summaryLabel: string
  imageHintLine: string | null
}

const CHROMATIC_COMPARE_BUCKETS = [
  ['lt', 'p', 'w', 'ltg'],
  ['v', 's'],
  ['dp', 'dk', 'dkg'],
  ['d', 'sf', 'g'],
] as const

function neutralStepHint(toneId: string): readonly [string, string] {
  const level = neutralValueLevel(toneId)
  if (level !== undefined && level >= 8) return NEUTRAL_COMPARE_STEP_HINTS.bright
  if (level !== undefined && level <= 3) return NEUTRAL_COMPARE_STEP_HINTS.dark
  return NEUTRAL_COMPARE_STEP_HINTS.mid
}

/** 활동 2 — 비교 후보 톤 ID (원래 톤 제외, 3~4개) */
export function compareToneCandidateIds(pick: BrandImagePick): string[] {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    const idx = NEUTRAL_VALUE_STEPS.findIndex((step) => step.label === pick.toneId)
    if (idx < 0) return []
    const repIdx = [1, 5, 8]
    const ids = new Set<string>()
    for (const i of repIdx) {
      if (i !== idx) ids.add(NEUTRAL_VALUE_STEPS[i].label)
    }
    if (idx > 0) ids.add(NEUTRAL_VALUE_STEPS[idx - 1].label)
    if (idx < NEUTRAL_VALUE_STEPS.length - 1) ids.add(NEUTRAL_VALUE_STEPS[idx + 1].label)
    ids.delete(pick.toneId)
    return [...ids].slice(0, 4)
  }
  const hue = hueById(pick.hueId)
  if (!hue || hue.group === 'achromatic' || pick.toneId === ACHROMATIC_TONE_ID) return []
  const available = new Set(tonesForHue(hue).map((t) => t.id))
  const out: string[] = []
  for (const bucket of CHROMATIC_COMPARE_BUCKETS) {
    for (const toneId of bucket) {
      if (toneId === pick.toneId || !available.has(toneId)) continue
      out.push(toneId)
      break
    }
  }
  return out.slice(0, 4)
}

export function resolveCompareToneId(
  pick: BrandImagePick,
  storedCompareToneId: string | null | undefined,
  candidateIds = compareToneCandidateIds(pick),
): string | null {
  if (!candidateIds.length) return null
  if (
    storedCompareToneId &&
    storedCompareToneId !== pick.toneId &&
    candidateIds.includes(storedCompareToneId)
  ) {
    return storedCompareToneId
  }
  return candidateIds.find((id) => id !== pick.toneId) ?? candidateIds[0] ?? null
}

export function compareToneOptionsForPick(pick: BrandImagePick): CompareToneOption[] {
  const hue = hueById(pick.hueId)
  if (pick.hueId === NEUTRAL_HUE_ID) {
    return compareToneCandidateIds(pick).map((toneId) => {
      const step = NEUTRAL_VALUE_STEPS.find((s) => s.label === toneId)
      const hints = [...neutralStepHint(toneId)]
      return {
        toneId,
        toneLabelKo: step?.grayName ?? toneId,
        hex: step?.hex ?? pick.hex,
        imageHints: hints,
      }
    })
  }
  if (!hue || hue.group === 'achromatic') return []
  const tones = tonesForHue(hue)
  return compareToneCandidateIds(pick).flatMap((toneId) => {
    const tone = tones.find((t) => t.id === toneId)
    const def = toneDefById(toneId)
    if (!tone || !def) return []
    const hints = COMPARE_TONE_IMAGE_HINTS[toneId]
    return [
      {
        toneId,
        toneLabelKo: def.nameKo,
        hex: tone.hex,
        imageHints: hints ? [...hints] : [def.nameKo],
      },
    ]
  })
}

function compareHexForTone(pick: BrandImagePick, compareToneId: string): string | null {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    return NEUTRAL_VALUE_STEPS.find((s) => s.label === compareToneId)?.hex ?? null
  }
  const hue = hueById(pick.hueId)
  if (!hue || hue.group === 'achromatic') return null
  return tonesForHue(hue).find((t) => t.id === compareToneId)?.hex ?? null
}

export function compareMineSideView(pick: BrandImagePick): CompareSideView {
  return {
    hex: pick.hex,
    colorName: pickChipColorName(pick),
    toneLine: pickChipToneLine(pick),
    summaryLabel: pickSummaryLabel(pick),
    imageHintLine: null,
  }
}

export type CompareChoiceGauge = {
  hex: string | null
  empty: boolean
  differsFromStep1: boolean
}

/** 활동 2 — 톤 비교 후 사용자가 고른 쪽의 색(게이지 2행용) */
export function compareChoiceGaugeForPick(
  pick: BrandImagePick,
  record: LearnBrandPickRecord,
): CompareChoiceGauge {
  const side = record.imageCompareSide
  if (!side || side === 'unsure') {
    return { hex: null, empty: true, differsFromStep1: false }
  }
  if (side === 'mine') {
    return { hex: pick.hex, empty: false, differsFromStep1: false }
  }
  const toneId = resolveCompareToneId(pick, record.compareToneId)
  if (!toneId) return { hex: null, empty: true, differsFromStep1: false }
  const hex = compareHexForTone(pick, toneId)
  if (!hex) return { hex: null, empty: true, differsFromStep1: false }
  const differsFromStep1 = hex.toLowerCase() !== pick.hex.toLowerCase()
  return { hex, empty: false, differsFromStep1 }
}

export function compareOtherSideView(
  pick: BrandImagePick,
  compareToneId: string,
): CompareSideView | null {
  if (compareToneId === pick.toneId) return null
  const hex = compareHexForTone(pick, compareToneId)
  if (!hex) return null
  const otherPick: BrandImagePick = { ...pick, toneId: compareToneId, hex }
  const option = compareToneOptionsForPick(pick).find((o) => o.toneId === compareToneId)
  const hintLine = option?.imageHints.length
    ? option.imageHints.slice(0, 2).join(', ')
    : null
  return {
    hex,
    colorName: pickChipColorName(otherPick),
    toneLine: pickChipToneLine(otherPick),
    summaryLabel: pickSummaryLabel(otherPick),
    imageHintLine: hintLine,
  }
}

export { IMAGE_COMPARE_PERCEPTION_NOTE }

function mixWithWhite(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(c + (255 - c) * ratio)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function mixWithBlack(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(c * (1 - ratio))
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** 선택 색 기준 밝기 비교용 근사 변형 (측색값 아님) */
export function brightnessVariants(hex: string): BrightnessVariant[] {
  return [
    { label: '더 어두운 쪽 (근사)', hex: mixWithBlack(hex, 0.28) },
    { label: '고른 색', hex: hex.toLowerCase() },
    { label: '더 밝은 쪽 (근사)', hex: mixWithWhite(hex, 0.28) },
  ]
}

/** @deprecated 활동 2 UI는 compareToneOptionsForPick 사용. 하위 호환·요약용 */
export function imageComparePairForPick(pick: BrandImagePick): ImageComparePair | null {
  const compareToneId = resolveCompareToneId(pick, null)
  if (!compareToneId) return null
  const other = compareOtherSideView(pick, compareToneId)
  if (!other) return null
  const mineLabel = imagePickLabel(pick.hueId, pick.toneId, pick.hex)
  return {
    mine: { hex: pick.hex, label: mineLabel },
    other: {
      hex: other.hex,
      label: other.summaryLabel,
      toneNote: other.imageHintLine
        ? `참고 이미지: ${other.imageHintLine}`
        : '톤 비교 예시(근사)',
    },
  }
}

export type PickConceptLines = {
  /** 관찰 UI — 선택 색상 강조 (유채색) */
  hueHighlight: string | null
  /** 관찰 UI — 선택 색조·무채 선택 요약 강조 */
  toneHighlight: string | null
  observeLine: string
  isNeutral: boolean
}

export function pickConceptLines(pick: BrandImagePick): PickConceptLines {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    return {
      hueHighlight: null,
      toneHighlight: imagePickLabel(pick.hueId, pick.toneId, pick.hex),
      observeLine: '주변 색이나 면적에 따라 더 밝거나 어둡게 느껴질 수 있어요.',
      isNeutral: true,
    }
  }
  const hue = hueById(pick.hueId)
  const tone = toneDefById(pick.toneId)
  const hueName = hue ? `${hue.name}(${hue.code})` : '색상'
  const toneKo = tone?.nameKo ?? null
  return {
    hueHighlight: hue ? hueName : null,
    toneHighlight: toneKo,
    observeLine: '밝기·채도는 화면과 조명에 따라 다르게 느껴질 수 있어요. 아래 칩을 나란히 보며 관찰해 보세요.',
    isNeutral: false,
  }
}

export type NeighborToneSwatch = {
  toneId: string
  hex: string
  nameKo: string
  /** 유채색만: tone.nameKo + hue.name 교육용 예시 */
  educationColorName: string | null
}

/**
 * 교육용 형용색명(계통색이름 예시). 무채색(N)은 12톤 합성 없이 명도·기본색명만.
 */
export function educationToneColorName(hueId: string, toneId: string): string {
  if (hueId === NEUTRAL_HUE_ID) {
    return neutralPickColorName(toneId)
  }
  const hue = hueById(hueId)
  if (!hue) return toneId
  if (hue.group === 'achromatic' || toneId === ACHROMATIC_TONE_ID) {
    return hue.name
  }
  const tone = toneDefById(toneId)
  if (!tone) return hue.name
  return `${tone.nameKo} ${hue.name}`
}

export function pickImageAdjectives(pick: BrandImagePick) {
  return imageAdjectivesForPick(pick.hueId, pick.toneId)
}

const HUE_EN_REF: Record<string, string> = {
  R: 'Red',
  YR: 'Yellow Red',
  Y: 'Yellow',
  GY: 'Green Yellow',
  G: 'Green',
  BG: 'Blue Green',
  B: 'Blue',
  PB: 'Purple Blue',
  P: 'Purple',
  PR: 'Red Purple',
}

/** hero 카드 상단 — 예: 빨강 · Red (R) */
export function pickHueDisplayLine(pick: BrandImagePick): string {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    return `${neutralPickColorName(pick.toneId)} · 무채색`
  }
  const hue = hueById(pick.hueId)
  if (!hue) return pick.hex
  if (hue.group === 'achromatic') return `${hue.name} · ${hue.code}`
  const en = HUE_EN_REF[hue.id] ?? hue.code
  return `${hue.name} · ${en} (${hue.code})`
}

export function pickBasicColorName(pick: BrandImagePick): string {
  if (pick.hueId === NEUTRAL_HUE_ID) return neutralPickColorName(pick.toneId)
  return hueById(pick.hueId)?.name ?? '색'
}

/** STEP 1·2 칩 — KS 기본색명 (유채색은 기호 포함) */
export function pickChipColorName(pick: BrandImagePick): string {
  if (pick.hueId === NEUTRAL_HUE_ID) return neutralPickColorName(pick.toneId)
  const hue = hueById(pick.hueId)
  if (!hue) return '—'
  if (hue.group === 'achromatic') {
    return hue.code ? `${hue.name} (${hue.code})` : hue.name
  }
  return hue.code ? `${hue.name} (${hue.code})` : hue.name
}

/** STEP 1·2 칩 — 톤(유채) 또는 무채색 명도 단계 */
export function pickChipToneLine(pick: BrandImagePick): string {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    const level = neutralValueLevel(pick.toneId)
    const detail = [level !== undefined ? `${level}단계` : null, pick.toneId].filter(Boolean).join(' · ')
    return detail || '—'
  }
  const hue = hueById(pick.hueId)
  if (!hue || hue.group === 'achromatic' || pick.toneId === ACHROMATIC_TONE_ID) return '—'
  const tone = toneDefById(pick.toneId)
  if (!tone) return '—'
  return `${tone.english} (${tone.nameKo})`
}

/** 같은 기준색 환의 다른 톤 칩 (현재 선택 제외, 최대 5) */
export function neighborToneSwatches(pick: BrandImagePick): NeighborToneSwatch[] {
  if (pick.hueId === NEUTRAL_HUE_ID) {
    const idx = NEUTRAL_VALUE_STEPS.findIndex((s) => s.label === pick.toneId)
    if (idx < 0) return []
    const out: NeighborToneSwatch[] = []
    for (let d = -2; d <= 2; d += 1) {
      if (d === 0) continue
      const step = NEUTRAL_VALUE_STEPS[idx + d]
      if (!step) continue
      out.push({
        toneId: step.label,
        hex: step.hex,
        nameKo: step.grayName ?? step.label,
        educationColorName: null,
      })
    }
    return out.slice(0, 5)
  }
  const hue = hueById(pick.hueId)
  if (!hue || hue.group === 'achromatic') return []
  const tones = tonesForHue(hue)
  const idx = tones.findIndex((t) => t.id === pick.toneId)
  const ordered =
    idx >= 0
      ? [...tones.slice(Math.max(0, idx - 2), idx), ...tones.slice(idx + 1, idx + 4)]
      : tones.slice(0, 5)
  return ordered.slice(0, 5).map((t) => ({
    toneId: t.id,
    hex: t.hex,
    nameKo: t.nameKo,
    educationColorName: `${t.nameKo} ${hue.name}`,
  }))
}

export function pickSummaryLabel(pick: BrandImagePick): string {
  return imagePickLabel(pick.hueId, pick.toneId, pick.hex)
}

export function isLightHex(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 190
}

export { needsPickSwatchHairline } from './color-chip'

export function chromaticHueForPick(pick: BrandImagePick): MunsellHue | undefined {
  return hueById(pick.hueId)
}

function hexDistance(a: string, b: string): number {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const dr = ((pa >> 16) & 255) - ((pb >> 16) & 255)
  const dg = ((pa >> 8) & 255) - ((pb >> 8) & 255)
  const db = (pa & 255) - (pb & 255)
  return dr * dr + dg * dg + db * db
}

/** 가까운 일반색명 예시 (교육용, 정확한 KS 색명 매칭 아님) */
export function nearestGeneralColorLabel(hex: string): string | null {
  const pool = colorsForTab('general')
  let best: { name: string; dist: number } | null = null
  for (const entry of pool) {
    const dist = hexDistance(hex.toLowerCase(), entry.hex.toLowerCase())
    if (!best || dist < best.dist) best = { name: entry.name, dist }
  }
  return best?.name ?? null
}
