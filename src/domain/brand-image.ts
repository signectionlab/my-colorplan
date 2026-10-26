import { imagePickLabel } from '../data/munsell-brand-image'
import { normalizeAccentPartSplit } from './accent-part-ratios'
import { ROLE_DISPLAY_ORDER, slotIndexForRole } from './role-assignment'
import type { BrandImagePick, Project, RoleName } from '../types/project'

export const BRAND_IMAGE_PICK_MIN = 3
export const BRAND_IMAGE_PICK_MAX = 5

export function brandImagePickKey(pick: BrandImagePick): string {
  return `${pick.hueId}:${pick.toneId}`
}

export function brandImageLabels(brand: Project['brand']): string[] {
  if (brand.imagePicks.length) {
    return brand.imagePicks.map((pick) => imagePickLabel(pick.hueId, pick.toneId, pick.hex))
  }
  return [...brand.keywords]
}

/** 읽기 전용: 현재 슬롯 수 (derived·렌더에서 사용, state 변경 없음) */
export function effectiveImagePickSlotCount(brand: Project['brand']): number {
  const n = brand.imagePicks.length
  let slots = brand.imagePickSlotCount
  if (!Number.isFinite(slots) || slots < BRAND_IMAGE_PICK_MIN) slots = BRAND_IMAGE_PICK_MIN
  return Math.min(BRAND_IMAGE_PICK_MAX, Math.max(slots, n, BRAND_IMAGE_PICK_MIN))
}

/** 저장·로드·pick 변경 후에만 호출 (렌더/derived 안에서는 호출 금지) */
export function normalizeBrandImageSlots(brand: Project['brand']) {
  const n = brand.imagePicks.length
  brand.imagePickSlotCount = effectiveImagePickSlotCount(brand)
  if (n >= BRAND_IMAGE_PICK_MAX) {
    brand.imagePickAddingDone = true
    brand.imagePickSlotCount = BRAND_IMAGE_PICK_MAX
  }
  if (n < BRAND_IMAGE_PICK_MIN) {
    brand.imagePickAddingDone = false
  }
  if (brand.imagePickAddingDone !== true && brand.imagePickAddingDone !== false) {
    brand.imagePickAddingDone = false
  }
}

export function canAddBrandImagePick(brand: Project['brand']): boolean {
  if (brand.imagePickAddingDone) return false
  if (brand.imagePicks.length >= BRAND_IMAGE_PICK_MAX) return false
  return brand.imagePicks.length < effectiveImagePickSlotCount(brand)
}

export function canExpandBrandImageSlots(brand: Project['brand']): boolean {
  const slots = effectiveImagePickSlotCount(brand)
  if (slots >= BRAND_IMAGE_PICK_MAX) return false
  if (brand.imagePicks.length < 1) return false
  return brand.imagePicks.length === slots
}

export function canFinishBrandImageAdding(brand: Project['brand']): boolean {
  if (brand.imagePickAddingDone) return false
  return brand.imagePicks.length >= BRAND_IMAGE_PICK_MIN
}

/** 기본 3칸을 채운 뒤, 다음 칸에 색 추가·완료를 고르는 UI */
export function showImagePickDecisionSlot(brand: Project['brand']): boolean {
  if (brand.imagePickAddingDone) return false
  if (brand.imagePicks.length >= BRAND_IMAGE_PICK_MAX) return false
  if (brand.imagePicks.length < BRAND_IMAGE_PICK_MIN) return false
  return canExpandBrandImageSlots(brand)
}

/** 3~5개 선택을 마친 뒤(추가 완료 또는 5개) 색 스트립 등 노출용 */
export function isBrandImageSelectionSettled(brand: Project['brand']): boolean {
  const n = brand.imagePicks.length
  if (n < BRAND_IMAGE_PICK_MIN) return false
  return brand.imagePickAddingDone || n >= BRAND_IMAGE_PICK_MAX
}

export function hasBrandImage(brand: Project['brand']): boolean {
  const n = brand.imagePicks.length
  if (n >= BRAND_IMAGE_PICK_MAX) return true
  if (n >= BRAND_IMAGE_PICK_MIN && brand.imagePickAddingDone) return true
  if (n === 0 && brand.keywords.length > 0) return true
  return false
}

export function syncBrandKeywordsFromPicks(brand: Project['brand']) {
  brand.keywords = brandImageLabels(brand)
}

export function emptyAccentPlanPickKeys(): [string | null, string | null, string | null] {
  return [null, null, null]
}

/** 3색=1, 4색=2, 5색=3 강조 칸 */
export function accentPlanSlotCount(brand: Project['brand']): number {
  const n = brand.imagePicks.length
  if (n >= BRAND_IMAGE_PICK_MAX) return 3
  if (n >= 4) return 2
  return 1
}

export function multiAccentPlanEnabled(brand: Project['brand']): boolean {
  return accentPlanSlotCount(brand) > 1
}

/** @deprecated use multiAccentPlanEnabled */
export function dualAccentPlanEnabled(brand: Project['brand']): boolean {
  return multiAccentPlanEnabled(brand)
}

export function normalizeAccentPlanPickKeys(brand: Project['brand']) {
  const slots = accentPlanSlotCount(brand)
  const prev = brand.accentPlanPickKeys ?? emptyAccentPlanPickKeys()
  const pickKeys = new Set(brand.imagePicks.map(brandImagePickKey))
  const next = emptyAccentPlanPickKeys()
  for (let i = 0; i < 3; i += 1) {
    const k = prev[i] ?? null
    next[i] = k && pickKeys.has(k) ? k : null
  }
  if (slots < 3) next[2] = null
  if (slots < 2) next[1] = null
  const unchanged =
    (prev[0] ?? null) === next[0] && (prev[1] ?? null) === next[1] && (prev[2] ?? null) === next[2]
  if (!unchanged) brand.accentPlanPickKeys = next
}

/** 4단계 palette.colors 동기화 트리거 — pick·강조 칸 배정이 바뀔 때만 */
export function brandColorPlanSyncSignature(brand: Project['brand']): string {
  const keys = brand.accentPlanPickKeys ?? emptyAccentPlanPickKeys()
  const pickPart = brand.imagePicks.map(brandImagePickKey).join('|')
  return `${pickPart}::${keys[0] ?? ''}|${keys[1] ?? ''}|${keys[2] ?? ''}`
}

export function pickByPlanKey(brand: Project['brand'], key: string | null): BrandImagePick | undefined {
  if (!key) return undefined
  return brand.imagePicks.find((p) => brandImagePickKey(p) === key)
}

/** 색채계획 게이지·강조 칸에 색을 지정할 때 쓰는 슬롯 */
export type BrandColorPlanSlot =
  | { kind: 'role'; index: 0 | 1 }
  | { kind: 'accent'; index: 0 | 1 | 2 }

export function brandColorPlanPickKeySet(brand: Project['brand']): Set<string> {
  return new Set(brand.imagePicks.map(brandImagePickKey))
}

export function brandColorPlanSlots(brand: Project['brand']): BrandColorPlanSlot[] {
  const accentSlots = accentPlanSlotCount(brand)
  const slots: BrandColorPlanSlot[] = [
    { kind: 'role', index: 0 },
    { kind: 'role', index: 1 },
  ]
  for (let i = 0; i < accentSlots; i += 1) {
    slots.push({ kind: 'accent', index: i as 0 | 1 | 2 })
  }
  return slots
}

export function brandColorPlanSlotPickKey(
  brand: Project['brand'],
  palette: Project['palette'],
  slot: BrandColorPlanSlot,
): string | null {
  if (slot.kind === 'role') {
    const id = palette.colors[slot.index]?.id?.trim()
    return id ? id : null
  }
  const k = brand.accentPlanPickKeys?.[slot.index]?.trim()
  return k ? k : null
}

export function brandColorPlanSlotFromRoleIndex(roleIndex: 0 | 1 | 2): BrandColorPlanSlot {
  if (roleIndex === 0) return { kind: 'role', index: 0 }
  if (roleIndex === 1) return { kind: 'role', index: 1 }
  return { kind: 'accent', index: 0 }
}

/** 다른 역할·강조 칸에 이미 쓰인 브랜드 색은 같은 슬롯 재선택만 허용 */
export function brandColorPlanHasAssignments(
  brand: Project['brand'],
  palette: Project['palette'],
): boolean {
  const pickKeys = brandColorPlanPickKeySet(brand)
  for (const slot of brandColorPlanSlots(brand)) {
    const key = brandColorPlanSlotPickKey(brand, palette, slot)
    if (key && pickKeys.has(key)) return true
  }
  return false
}

export function canAssignBrandPickToColorPlanSlot(
  brand: Project['brand'],
  palette: Project['palette'],
  slot: BrandColorPlanSlot,
  pick: BrandImagePick,
): boolean {
  const key = brandImagePickKey(pick)
  const pickKeys = brandColorPlanPickKeySet(brand)
  if (!pickKeys.has(key)) return false

  const current = brandColorPlanSlotPickKey(brand, palette, slot)
  if (current === key) return true

  for (const other of brandColorPlanSlots(brand)) {
    if (other.kind === slot.kind && other.index === slot.index) continue
    const assigned = brandColorPlanSlotPickKey(brand, palette, other)
    if (assigned === key) return false
  }
  return true
}

export type PalettePlanBarSegment = {
  hex: string
  name: string
  widthPct: number
}

function pushRoleSegment(
  segments: PalettePlanBarSegment[],
  palette: Project['palette'],
  role: RoleName,
) {
  const i = slotIndexForRole(palette.roles, role, palette.ratios)
  if (i < 0) return
  const widthPct = palette.ratios[i]
  if (widthPct <= 0) return
  segments.push({
    hex: palette.colors[i].hex,
    name: palette.colors[i].name,
    widthPct,
  })
}

/** 주·보·강 순 표시. 강조 10% 고정, 2·3색이면 5%·10/3%씩 */
export function paletteRatioBarSegments(
  brand: Project['brand'],
  palette: Project['palette'],
): PalettePlanBarSegment[] {
  const pickCount = brand.imagePicks.length
  const accentSlots = accentPlanSlotCount(brand)
  const splitAccentBar = pickCount >= 3 && accentSlots > 1
  const segments: PalettePlanBarSegment[] = []

  for (const role of ROLE_DISPLAY_ORDER) {
    if (role === '강조색' && splitAccentBar) {
      const accentIdx = slotIndexForRole(palette.roles, '강조색', palette.ratios)
      if (accentIdx < 0) continue
      const accentTotal = palette.ratios[accentIdx]
      const split = normalizeAccentPartSplit(accentSlots, accentTotal, palette.accentPartRatios)
      for (let s = 0; s < accentSlots; s += 1) {
        const partPct = palette.accentPartRatios ? (split[s] ?? 0) : accentTotal / accentSlots
        const pick = pickByPlanKey(brand, brand.accentPlanPickKeys?.[s] ?? null)
        const label = pick
          ? imagePickLabel(pick.hueId, pick.toneId, pick.hex)
          : `${palette.colors[accentIdx].name} ${s + 1}`
        segments.push({
          hex: pick?.hex ?? palette.colors[accentIdx].hex,
          name: label,
          widthPct: partPct,
        })
      }
      continue
    }
    pushRoleSegment(segments, palette, role)
  }
  return segments
}

