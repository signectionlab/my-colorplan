import type {
  CompareBrandExperimentChoice,
  CompareReadabilityChoice,
  CompareSurroundChoice,
  Project,
} from '../types/project'
import { normalizeHex } from './color-validation'

const READABILITY = new Set<CompareReadabilityChoice>(['current', 'saved_baseline', 'mood_diff', 'unsure'])
const SURROUND = new Set<CompareSurroundChoice>(['more_different', 'similar', 'unsure'])
const BRAND_EXP = new Set<CompareBrandExperimentChoice>(['light_bg', 'dark_bg', 'unsure'])

function pickChoice<T extends string>(value: unknown, allowed: ReadonlySet<T>): T | null {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : null
}

function hexField(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  return normalizeHex(value) ?? fallback
}

export function mergeCompareFromRaw(raw: unknown, base: Project['compare']): Project['compare'] {
  if (typeof raw !== 'object' || raw === null) return base
  const row = raw as Record<string, unknown>
  const baseline = row.baseline
  let baselineSnap = base.baseline
  if (typeof baseline === 'object' && baseline !== null) {
    const b = baseline as Record<string, unknown>
    baselineSnap = {
      background: hexField(b.background, base.background),
      text: hexField(b.text, base.text),
      shape: hexField(b.shape, base.shape),
    }
  }
  return {
    background: hexField(row.background, base.background),
    text: hexField(row.text, base.text),
    shape: hexField(row.shape, base.shape),
    observation: typeof row.observation === 'string' ? row.observation : base.observation,
    baseline: baselineSnap,
    readabilityChoice: pickChoice(row.readabilityChoice, READABILITY) ?? base.readabilityChoice,
    surroundChoice: pickChoice(row.surroundChoice, SURROUND) ?? base.surroundChoice,
    brandExperimentChoice: pickChoice(row.brandExperimentChoice, BRAND_EXP) ?? base.brandExperimentChoice,
    observationDetail: typeof row.observationDetail === 'string' ? row.observationDetail : base.observationDetail,
    surroundBgA: hexField(row.surroundBgA, base.surroundBgA),
    surroundBgB: hexField(row.surroundBgB, base.surroundBgB),
    surroundShape: hexField(row.surroundShape, base.surroundShape ?? base.shape),
  }
}

function parseAccentPartRatiosRaw(value: unknown): [number, number, number] | undefined {
  if (!Array.isArray(value) || value.length !== 3) return undefined
  const next = value.map((item) => (typeof item === 'number' && Number.isFinite(item) ? Math.round(item) : NaN))
  if (next.some((item) => Number.isNaN(item) || item < 0 || item > 100)) return undefined
  return next as [number, number, number]
}

export function mergePaletteMetaFromRaw(raw: unknown, base: Project['palette']): Project['palette'] {
  if (typeof raw !== 'object' || raw === null) return base
  const row = raw as Record<string, unknown>
  const choice = row.comboReasonChoice
  const allowed = new Set(['brand_image', 'balance', 'clarity', 'ratio_compare', 'custom'])
  const accentPartRatios = parseAccentPartRatiosRaw(row.accentPartRatios)
  return {
    ...base,
    comboReasonChoice:
      typeof choice === 'string' && allowed.has(choice) ? (choice as Project['palette']['comboReasonChoice']) : base.comboReasonChoice,
    comboReason: typeof row.comboReason === 'string' ? row.comboReason : base.comboReason,
    accentPartRatios: accentPartRatios ?? base.accentPartRatios,
  }
}
