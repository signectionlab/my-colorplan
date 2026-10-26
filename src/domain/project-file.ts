import type { Project } from '../types/project'
import { createDefaultProject } from './default-project'
import { migrateApplyFieldFromLegacy, parseApplyFieldId } from './apply-field'
import { normalizeHex } from './color-validation'
import { mergeCompareFromRaw, mergePaletteMetaFromRaw } from './compare-normalize'
import { mergeLearnFromRaw, normalizeLearnState } from './learn-normalize'
import { mergePlanFromRaw } from './plan-document'
import { mergeReviewFromRaw } from './review-normalize'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseAccentPlanPickKeys(
  value: unknown,
  fallback: [string | null, string | null, string | null],
): [string | null, string | null, string | null] {
  if (!Array.isArray(value)) return [...fallback] as [string | null, string | null, string | null]
  const pick = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)
  return [pick(value[0]), pick(value[1]), pick(value[2])]
}

function asRatios(value: unknown, fallback: [number, number, number]): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) return fallback
  const nums = value.map((v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 0))
  const sum = nums[0] + nums[1] + nums[2]
  if (sum !== 100) return fallback
  return nums as [number, number, number]
}

function migrateV1(raw: UnknownRecord): Project {
  const base = createDefaultProject()
  const brand = isRecord(raw.brand) ? raw.brand : {}
  const learn = isRecord(raw.learn) ? raw.learn : {}
  const compare = isRecord(raw.compare) ? raw.compare : {}
  const palette = isRecord(raw.palette) ? raw.palette : {}
  const review = isRecord(raw.review) ? raw.review : {}
  const plan = isRecord(raw.plan) ? raw.plan : {}

  base.screen = 'start'
  base.brand = {
    ...base.brand,
    name: asString(brand.name),
    field: asString(brand.field),
    intro: asString(brand.intro),
    keywords: asStringArray(brand.keywords),
    keywordReason: asString(brand.keywordReason),
  }
  base.learn = mergeLearnFromRaw(learn, base.learn)

  base.compare = mergeCompareFromRaw(compare, { ...base.compare, baseline: null })

  const colorsRaw = Array.isArray(palette.colors) ? palette.colors : []
  const colors = base.palette.colors.map((fallback, i) => {
    const item = colorsRaw[i]
    if (!isRecord(item)) return fallback
    const hex = normalizeHex(asString(item.hex, fallback.hex)) ?? fallback.hex
    return {
      name: asString(item.name, fallback.name),
      hex,
      reason: asString(item.reason),
      usage: asString(item.usage),
    }
  }) as Project['palette']['colors']

  base.palette = mergePaletteMetaFromRaw(palette, {
    ...base.palette,
    colors,
    ratios: asRatios(palette.ratios, base.palette.ratios),
    roles: base.palette.roles,
    roleNote: asString(palette.roleNote),
    baseline: null,
  })

  base.review = {
    ...base.review,
    imageFit: asString(review.imageFit),
    contrastNote: asString(review.contrastNote),
    ratioNote: asString(review.ratioNote),
  }

  base.plan = mergePlanFromRaw(plan, base.plan)

  if (typeof raw.screen === 'string' && raw.screen !== 'start') {
    const step = raw.screen as Project['screen']
    if (['brand', 'learn', 'compare', 'palette', 'review', 'plan'].includes(step)) {
      base.screen = step
    }
  }

  normalizeLearnState(base.learn, base.brand.imagePicks)
  return base
}

function parseV2(raw: UnknownRecord): Project {
  const base = createDefaultProject()
  base.screen =
    typeof raw.screen === 'string' &&
    (raw.screen === 'start' ||
      ['brand', 'learn', 'compare', 'palette', 'review', 'plan'].includes(raw.screen))
      ? (raw.screen as Project['screen'])
      : base.screen
  if (isRecord(raw.brand)) {
    const b = raw.brand
    base.brand = {
      ...base.brand,
      name: asString(b.name),
      field: asString(b.field),
      applyFieldId: parseApplyFieldId(b.applyFieldId),
      applyFieldCustom: asString(b.applyFieldCustom),
      intro: asString(b.intro),
      keywords: asStringArray(b.keywords),
      keywordReason: asString(b.keywordReason),
      imagePickSlotCount:
        typeof b.imagePickSlotCount === 'number' && b.imagePickSlotCount >= 1 && b.imagePickSlotCount <= 5
          ? Math.round(b.imagePickSlotCount)
          : base.brand.imagePickSlotCount,
      imagePickAddingDone: Boolean(b.imagePickAddingDone),
      accentPlanPickKeys: parseAccentPlanPickKeys(b.accentPlanPickKeys, base.brand.accentPlanPickKeys),
      imagePicks: Array.isArray(b.imagePicks)
        ? b.imagePicks
            .filter((p): p is UnknownRecord => isRecord(p))
            .map((p) => ({
              hueId: asString(p.hueId),
              toneId: asString(p.toneId),
              hex: normalizeHex(asString(p.hex)) ?? asString(p.hex),
            }))
            .filter((p) => p.hueId && p.toneId && p.hex)
        : base.brand.imagePicks,
    }
    migrateApplyFieldFromLegacy(base.brand)
  }
  if (isRecord(raw.learn)) {
    base.learn = mergeLearnFromRaw(raw.learn, base.learn)
  }
  if (isRecord(raw.compare)) {
    base.compare = mergeCompareFromRaw(raw.compare, base.compare)
  }
  if (isRecord(raw.palette)) {
    const p = raw.palette
    const colorsRaw = Array.isArray(p.colors) ? p.colors : []
    const colors = base.palette.colors.map((fallback, i) => {
      const item = colorsRaw[i]
      if (!isRecord(item)) return fallback
      return {
        name: asString(item.name, fallback.name),
        hex: normalizeHex(asString(item.hex, fallback.hex)) ?? fallback.hex,
        reason: asString(item.reason),
        usage: asString(item.usage),
      }
    }) as Project['palette']['colors']
    base.palette = mergePaletteMetaFromRaw(p, {
      ...base.palette,
      colors,
      ratios: asRatios(p.ratios, base.palette.ratios),
      roles: base.palette.roles,
      roleNote: asString(p.roleNote),
      baseline: null,
    })
    if (isRecord(p.baseline) && Array.isArray(p.baseline.colors)) {
      /* keep baseline if valid */
    }
  }
  if (isRecord(raw.review)) {
    base.review = mergeReviewFromRaw(raw.review, base.review, base.brand, base.palette)
  }
  if (isRecord(raw.plan)) {
    base.plan = mergePlanFromRaw(raw.plan, base.plan)
  }
  base.kind = 'my-brand-color-canvas'
  base.version = 2
  normalizeLearnState(base.learn, base.brand.imagePicks)
  return base
}

export type ValidateResult =
  | { ok: true; project: Project }
  | { ok: false; error: string }

export function validateProjectFile(data: unknown): ValidateResult {
  if (!isRecord(data)) {
    return { ok: false, error: 'JSON 객체가 아닙니다.' }
  }
  if (data.kind !== 'my-brand-color-canvas') {
    return { ok: false, error: '이 앱에서 저장한 파일이 아닙니다.' }
  }
  const version = data.version
  if (version === 1) {
    return { ok: true, project: migrateV1(data) }
  }
  if (version === 2) {
    return { ok: true, project: parseV2(data) }
  }
  return { ok: false, error: '지원하지 않는 버전입니다.' }
}
