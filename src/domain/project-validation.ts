import { migrateApplyFieldFromLegacy, parseApplyFieldId } from './apply-field'
import { BRAND_IMAGE_PICK_MAX, normalizeAccentPlanPickKeys, normalizeBrandImageSlots } from './brand-image'
import {
  isKnownProjectKind,
  PROJECT_KIND,
  type BrandImagePick,
  type Project,
  type RoleName,
} from '../types/project'
import { createDefaultProject } from './default-project'
import { mergeCompareFromRaw, mergePaletteMetaFromRaw } from './compare-normalize'
import { mergeLearnFromRaw, normalizeLearnState } from './learn-normalize'
import { normalizeHex } from './color-validation'
import { assignRoles } from './role-assignment'
import { mergePlanFromRaw } from './plan-document'
import { mergeReviewFromRaw } from './review-normalize'

type Rec = Record<string, unknown>

function rec(value: unknown): Rec | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Rec) : null
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function hex(value: unknown, fallback: string): string {
  return normalizeHex(str(value, fallback)) ?? fallback
}

function ratios(value: unknown, fallback: [number, number, number]): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) return fallback
  const next = value.map((item) => (typeof item === 'number' && Number.isFinite(item) ? Math.round(item) : NaN))
  if (next.some((item) => Number.isNaN(item) || item < 0 || item > 100)) return fallback
  if (next[0] + next[1] + next[2] !== 100) return fallback
  return next as [number, number, number]
}

function roles(value: unknown, fallback: [RoleName, RoleName, RoleName]): [RoleName, RoleName, RoleName] {
  const allowed = new Set(['주조색', '보조색', '강조색'])
  if (!Array.isArray(value) || value.length !== 3 || value.some((item) => !allowed.has(String(item)))) {
    return fallback
  }
  return value as [RoleName, RoleName, RoleName]
}

function parseAccentPlanKeys(value: unknown): [string | null, string | null, string | null] {
  if (!Array.isArray(value)) return [null, null, null]
  const pick = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)
  return [pick(value[0]), pick(value[1]), pick(value[2])]
}

function imagePicks(value: unknown): BrandImagePick[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const row = rec(item)
      if (!row) return null
      const hueId = str(row.hueId)
      const toneId = str(row.toneId)
      const pickHex = hex(row.hex, '#000000')
      if (!hueId || !toneId) return null
      return { hueId, toneId, hex: pickHex }
    })
    .filter((item): item is BrandImagePick => item !== null)
    .slice(0, BRAND_IMAGE_PICK_MAX)
}

function screen(value: unknown): Project['screen'] {
  const allowed = ['start', 'brand', 'learn', 'compare', 'palette', 'review', 'plan']
  return typeof value === 'string' && allowed.includes(value) ? (value as Project['screen']) : 'start'
}

export function validateProjectFile(data: unknown): { ok: true; project: Project } | { ok: false; error: string } {
  const raw = rec(data)
  if (!raw) return { ok: false, error: 'JSON 객체가 아닙니다.' }
  if (!isKnownProjectKind(raw.kind)) return { ok: false, error: '이 앱에서 저장한 파일이 아닙니다.' }
  if (raw.version !== 1 && raw.version !== 2) return { ok: false, error: '지원하지 않는 버전입니다.' }

  const base = createDefaultProject()
  const brand = rec(raw.brand)
  const learn = rec(raw.learn)
  const compare = rec(raw.compare)
  const palette = rec(raw.palette)
  const review = rec(raw.review)
  const plan = rec(raw.plan)

  if (brand) {
    base.brand = {
      name: str(brand.name),
      field: str(brand.field),
      applyFieldId: parseApplyFieldId(brand.applyFieldId),
      applyFieldCustom: str(brand.applyFieldCustom),
      intro: str(brand.intro),
      keywords: strings(brand.keywords),
      imagePicks: imagePicks(brand.imagePicks),
      imagePickSlotCount:
        typeof brand.imagePickSlotCount === 'number' && Number.isFinite(brand.imagePickSlotCount)
          ? brand.imagePickSlotCount
          : 3,
      imagePickAddingDone: brand.imagePickAddingDone === true,
      accentPlanPickKeys: parseAccentPlanKeys(brand.accentPlanPickKeys),
      keywordReason: str(brand.keywordReason),
    }
    normalizeBrandImageSlots(base.brand)
    normalizeAccentPlanPickKeys(base.brand)
    migrateApplyFieldFromLegacy(base.brand)
    if (!base.brand.imagePicks.length && base.brand.keywords.length) {
      /* v1·키워드만 있던 저장본 유지 */
    }
  }
  if (learn) {
    base.learn = mergeLearnFromRaw(learn, base.learn)
  }
  if (compare) {
    base.compare = mergeCompareFromRaw(compare, base.compare)
  }
  if (palette) {
    const items = Array.isArray(palette.colors) ? palette.colors : []
    const colors = base.palette.colors.map((fallback, index) => {
      const item = rec(items[index])
      if (!item) return fallback
      return {
        id: str(item.id, fallback.id),
        name: str(item.name, fallback.name),
        hex: hex(item.hex, fallback.hex),
        reason: str(item.reason),
        usage: str(item.usage),
      }
    }) as Project['palette']['colors']
    const nextRatios = ratios(palette.ratios, base.palette.ratios)
    base.palette = mergePaletteMetaFromRaw(palette, {
      ...base.palette,
      colors,
      ratios: nextRatios,
      roles: assignRoles(nextRatios, roles(palette.roles, base.palette.roles)),
      roleNote: str(palette.roleNote),
      baseline: null,
    })
    const baseline = rec(palette.baseline)
    if (baseline && Array.isArray(baseline.colors) && baseline.colors.length === 3) {
      const baselineRatios = ratios(baseline.ratios, nextRatios)
      const baselineRoles = roles(baseline.roles, base.palette.roles)
    const baselineColors = [0, 1, 2].map((index) => {
      const color = rec((baseline.colors as unknown[])[index])
      return {
        id: str(color?.id, colors[index].id),
        name: str(color?.name, colors[index].name),
        hex: hex(color?.hex, colors[index].hex),
      }
    }) as Project['palette']['baseline'] extends null ? never : NonNullable<Project['palette']['baseline']>['colors']
    base.palette.baseline = {
      colors: baselineColors,
      ratios: baselineRatios,
      roles: assignRoles(baselineRatios, baselineRoles),
    }
    }
  }
  if (review) {
    base.review = mergeReviewFromRaw(review, base.review, base.brand, base.palette)
  }
  if (plan) {
    base.plan = mergePlanFromRaw(plan, base.plan)
  }
  base.screen = screen(raw.screen)
  base.version = 2
  base.kind = PROJECT_KIND
  normalizeLearnState(base.learn, base.brand.imagePicks)
  return { ok: true, project: base }
}
