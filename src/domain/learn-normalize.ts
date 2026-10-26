import { brandImagePickKey } from './brand-image'
import { compareToneCandidateIds, resolveCompareToneId } from './learn-brand-pick'
import type { BrandImagePick, LearnBrandFitChoice, LearnBrandPickRecord, Project } from '../types/project'

export function emptyLearnBrandPickRecord(): LearnBrandPickRecord {
  return { imageCompareSide: null, compareToneId: null, fitChoice: null, fitReason: '' }
}

const FIT_CHOICES = new Set<LearnBrandFitChoice>(['fit', 'unsure', 'explore'])

function parseBrandPickRecord(raw: unknown): LearnBrandPickRecord {
  if (typeof raw !== 'object' || raw === null) return emptyLearnBrandPickRecord()
  const row = raw as Record<string, unknown>
  const side = row.imageCompareSide
  const fit = row.fitChoice
  const compareToneId =
    typeof row.compareToneId === 'string' && row.compareToneId.trim() ? row.compareToneId.trim() : null
  return {
    imageCompareSide:
      side === 'mine' || side === 'other' || side === 'unsure' ? side : null,
    compareToneId,
    fitChoice: typeof fit === 'string' && FIT_CHOICES.has(fit as LearnBrandFitChoice) ? (fit as LearnBrandFitChoice) : null,
    fitReason: typeof row.fitReason === 'string' ? row.fitReason : '',
  }
}

export function parseLearnBrandPickRecords(raw: unknown): Record<string, LearnBrandPickRecord> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
  const out: Record<string, LearnBrandPickRecord> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key !== 'string' || !key.trim()) continue
    out[key] = parseBrandPickRecord(value)
  }
  return out
}

export function mergeLearnFromRaw(raw: unknown, base: Project['learn']): Project['learn'] {
  if (typeof raw !== 'object' || raw === null) return base
  const learn = raw as Record<string, unknown>
  const reasonsRaw = learn.reasons
  const reasons =
    typeof reasonsRaw === 'object' && reasonsRaw !== null && !Array.isArray(reasonsRaw)
      ? Object.fromEntries(
          Object.entries(reasonsRaw).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        )
      : base.reasons
  const interestIds = Array.isArray(learn.interestIds)
    ? learn.interestIds.filter((id): id is string => typeof id === 'string')
    : base.interestIds
  const focusPickKey =
    typeof learn.focusPickKey === 'string' && learn.focusPickKey.trim() ? learn.focusPickKey.trim() : base.focusPickKey
  const brandPickRecords = learn.brandPickRecords
    ? { ...base.brandPickRecords, ...parseLearnBrandPickRecords(learn.brandPickRecords) }
    : base.brandPickRecords
  return { interestIds, reasons, focusPickKey, brandPickRecords }
}

/** 브랜드 색 목록과 learn 기록 키를 맞춥니다. 기존 기록은 유지합니다. */
export function normalizeLearnState(learn: Project['learn'], picks: BrandImagePick[]) {
  const validKeys = new Set(picks.map(brandImagePickKey))
  const records = { ...learn.brandPickRecords }
  for (const key of Object.keys(records)) {
    if (!validKeys.has(key)) delete records[key]
  }
  for (const pick of picks) {
    const key = brandImagePickKey(pick)
    const prev = records[key] ?? emptyLearnBrandPickRecord()
    const candidates = compareToneCandidateIds(pick)
    if (!candidates.length) {
      let side = prev.imageCompareSide
      if (side === 'other') side = null
      records[key] = { ...prev, compareToneId: null, imageCompareSide: side }
      continue
    }
    const storedCompare = prev.compareToneId
    const resolved = resolveCompareToneId(pick, storedCompare, candidates)
    let side = prev.imageCompareSide
    if (storedCompare !== null && storedCompare !== resolved) side = null
    records[key] = { ...prev, compareToneId: resolved, imageCompareSide: side }
  }
  learn.brandPickRecords = records
  if (learn.focusPickKey && !validKeys.has(learn.focusPickKey)) {
    learn.focusPickKey = picks[0] ? brandImagePickKey(picks[0]) : null
  }
}

export function effectiveLearnFocusKey(learn: Project['learn'], picks: BrandImagePick[]): string | null {
  if (!picks.length) return null
  if (learn.focusPickKey && picks.some((p) => brandImagePickKey(p) === learn.focusPickKey)) {
    return learn.focusPickKey
  }
  return brandImagePickKey(picks[0])
}

export function learnRecordForKey(learn: Project['learn'], key: string): LearnBrandPickRecord {
  return learn.brandPickRecords[key] ?? emptyLearnBrandPickRecord()
}
