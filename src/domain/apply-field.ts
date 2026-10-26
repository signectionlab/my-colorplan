import { APPLY_FIELD_BY_ID } from '../data/apply-fields'
import type { ApplyFieldId, Project } from '../types/project'

const APPLY_FIELD_IDS = new Set<string>(['space', 'product', 'online', 'print', 'service', 'other'])

export function parseApplyFieldId(value: unknown): ApplyFieldId | null {
  if (typeof value !== 'string' || !APPLY_FIELD_IDS.has(value)) return null
  return value as ApplyFieldId
}

/** 계획서·레거시 field 문자열 */
export function applyFieldDisplayText(brand: Project['brand']): string {
  if (brand.applyFieldId) {
    if (brand.applyFieldId === 'other') {
      const custom = brand.applyFieldCustom.trim()
      return custom || '직접 입력·아직 미정'
    }
    return APPLY_FIELD_BY_ID[brand.applyFieldId].title
  }
  return brand.field.trim()
}

export function syncApplyFieldLegacy(brand: Project['brand']) {
  brand.field = applyFieldDisplayText(brand)
}

/** 저장본에 id가 없고 field만 있을 때 */
export function migrateApplyFieldFromLegacy(brand: Project['brand']) {
  if (brand.applyFieldId) {
    syncApplyFieldLegacy(brand)
    return
  }
  const legacy = brand.field.trim()
  if (!legacy) {
    brand.applyFieldCustom = brand.applyFieldCustom ?? ''
    syncApplyFieldLegacy(brand)
    return
  }
  brand.applyFieldId = 'other'
  brand.applyFieldCustom = legacy
  syncApplyFieldLegacy(brand)
}

/** 계획서용 한 줄. 완전 미선택이면 null */
export function applyFieldPlanLine(brand: Project['brand']): string | null {
  if (!brand.applyFieldId) {
    return brand.field.trim() ? brand.field.trim() : null
  }
  if (brand.applyFieldId === 'other' && !brand.applyFieldCustom.trim()) {
    return '아직 정하지 않음'
  }
  return applyFieldDisplayText(brand)
}
