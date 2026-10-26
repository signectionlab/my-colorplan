import type { ApplyFieldId } from '../types/project'

/** STEP 2 참고 이미지가 있는 활용 분야 (other 제외) */
export const APPLY_FIELD_REFERENCE_IDS = [
  'space',
  'product',
  'online',
  'print',
  'service',
] as const satisfies readonly ApplyFieldId[]

export type ApplyFieldReferenceId = (typeof APPLY_FIELD_REFERENCE_IDS)[number]

/** public/images/apply-fields/apply-*.png 공통 픽셀 크기 (IHDR) */
export const APPLY_FIELD_REFERENCE_WIDTH = 1586
export const APPLY_FIELD_REFERENCE_HEIGHT = 992

const REFERENCE_SET = new Set<string>(APPLY_FIELD_REFERENCE_IDS)

export function isApplyFieldReferenceId(id: ApplyFieldId | null): id is ApplyFieldReferenceId {
  return id !== null && REFERENCE_SET.has(id)
}

/** public/images/apply-fields/ 기준 URL. other·null이면 null */
export function applyFieldReferenceImageSrc(id: ApplyFieldId | null): string | null {
  if (!isApplyFieldReferenceId(id)) return null
  return `/images/apply-fields/apply-${id}.png`
}

export function applyFieldReferenceImageAlt(id: ApplyFieldReferenceId, fieldTitle: string): string {
  return `${fieldTitle} 활용 참고 이미지 — 브랜드 색이 사용될 장면을 상상해 보세요`
}

export function applyFieldReferenceImageFileName(id: ApplyFieldReferenceId): string {
  return `apply-${id}.png`
}
