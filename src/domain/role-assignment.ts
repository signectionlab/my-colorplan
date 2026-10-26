import type { RoleName } from '../types/project'

/** 1단계 색채계획 슬롯 index와 항상 같은 역할 라벨 */
export const FIXED_PLAN_SLOT_ROLES: [RoleName, RoleName, RoleName] = ['주조색', '보조색', '강조색']

export const ROLE_DISPLAY_ORDER: readonly RoleName[] = ['주조색', '보조색', '강조색']

export const PRIMARY_ROLE_MIN_PCT = 51
export const PRIMARY_ROLE_MAX_PCT = 70
export const SECONDARY_ROLE_MIN_PCT = 11
export const SECONDARY_ROLE_MAX_PCT = 50
export const ACCENT_ROLE_MIN_PCT = 1
export const ACCENT_ROLE_MAX_PCT = 10
export const MIN_PALETTE_RATIO_PCT = 1

export const ACCENT_ROLE_TOTAL_PCT = 10
export const MULTI_PICK_ACCENT_SLOT_MAX_PCT = ACCENT_ROLE_TOTAL_PCT
export const ACCENT_PALETTE_SLOT_INDEX = 2

export function accentPartWidthPercentOfBar(accentSlotCount: number): number {
  const n = Math.max(1, Math.min(3, Math.round(accentSlotCount)))
  return ACCENT_ROLE_TOTAL_PCT / n
}

/** 슬롯·강조 조각의 막대 전체 % → 역할 라벨 (단일 출처) */
export function roleForSlotRatio(ratio: number): RoleName {
  if (ratio >= PRIMARY_ROLE_MIN_PCT && ratio <= PRIMARY_ROLE_MAX_PCT) return '주조색'
  if (ratio >= SECONDARY_ROLE_MIN_PCT && ratio <= SECONDARY_ROLE_MAX_PCT) return '보조색'
  if (ratio >= ACCENT_ROLE_MIN_PCT && ratio <= ACCENT_ROLE_MAX_PCT) return '강조색'
  if (ratio > PRIMARY_ROLE_MAX_PCT) return '보조색'
  return '보조색'
}

export function roleBandFromRatio(ratio: number): RoleName {
  return roleForSlotRatio(ratio)
}

export function slotIndexForRole(
  roles: readonly [RoleName, RoleName, RoleName],
  role: RoleName,
  ratios?: readonly [number, number, number],
): number {
  if (ratios) {
    const active = roles.findIndex((r, i) => r === role && ratios[i] > 0)
    if (active >= 0) return active
  }
  return roles.findIndex((r) => r === role)
}

export function roleLabel(role: RoleName, _ratio?: number): string {
  return role
}

export function assignRoles(
  ratios: readonly [number, number, number],
  _previous: readonly [RoleName, RoleName, RoleName],
): [RoleName, RoleName, RoleName] {
  return [roleForSlotRatio(ratios[0]), roleForSlotRatio(ratios[1]), roleForSlotRatio(ratios[2])]
}

export function describeRoleChanges(input: {
  names: string[]
  ratiosBefore: readonly number[]
  ratiosAfter: readonly number[]
  rolesBefore: readonly RoleName[]
  rolesAfter: readonly RoleName[]
}): string {
  const parts: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const name = input.names[i]?.trim() || `색 ${i + 1}`
    const before = input.ratiosBefore[i]
    const after = input.ratiosAfter[i]
    const beforeRole = input.rolesBefore[i]
    const afterRole = input.rolesAfter[i]
    if (before === after && beforeRole === afterRole) continue
    parts.push(`${name}의 비율이 ${before}%에서 ${after}%로 바뀌어 ${afterRole} 구간으로 표시됩니다.`)
  }
  if (!parts.length) return ''
  return `${parts.join(' ')} (주 ${PRIMARY_ROLE_MIN_PCT}~${PRIMARY_ROLE_MAX_PCT}% · 보 ${SECONDARY_ROLE_MIN_PCT}~${SECONDARY_ROLE_MAX_PCT}% · 강 ${ACCENT_ROLE_MIN_PCT}~${ACCENT_ROLE_MAX_PCT}%)`
}

export function describeFixedPlanRatioChanges(input: {
  names: string[]
  ratiosBefore: readonly number[]
  ratiosAfter: readonly number[]
}): string {
  const parts: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const before = input.ratiosBefore[i]
    const after = input.ratiosAfter[i]
    if (before === after) continue
    const name = input.names[i]?.trim() || `색 ${i + 1}`
    parts.push(`${FIXED_PLAN_SLOT_ROLES[i]}(${name}) ${before}%→${after}%`)
  }
  if (!parts.length) return ''
  return `${parts.join(' · ')}. 역할(주·보·강)과 색 슬롯은 1단계 계획과 같습니다.`
}
