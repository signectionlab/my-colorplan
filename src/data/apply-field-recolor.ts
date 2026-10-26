import type { ApplyFieldReferenceId } from './apply-field-reference-image'
import { applyFieldReferenceImageSrc, isApplyFieldReferenceId } from './apply-field-reference-image'

/**
 * 마스크 3장(+베이스) 준비된 분야 (Tier 2 Canvas 영역 배색).
 * product / online / print / service — wash(Tier 1) 유지, 에셋·QA 후 id를 순차 추가.
 */
export const APPLY_FIELD_RECOLOR_READY = ['space'] as const satisfies readonly ApplyFieldReferenceId[]

const RECOLOR_READY_SET = new Set<string>(APPLY_FIELD_RECOLOR_READY)

export type ApplyFieldRecolorAssets = {
  base: string
  maskPrimary: string
  maskSecondary: string
  /** 없으면 강조 레이어 스킵 (URL은 항상 규칙상 존재) */
  maskAccent: string | null
}

export function applyFieldMaskPrimarySrc(id: ApplyFieldReferenceId): string {
  return `/images/apply-fields/apply-${id}-mask-primary.png`
}

export function applyFieldMaskSecondarySrc(id: ApplyFieldReferenceId): string {
  return `/images/apply-fields/apply-${id}-mask-secondary.png`
}

export function applyFieldMaskAccentSrc(id: ApplyFieldReferenceId): string {
  return `/images/apply-fields/apply-${id}-mask-accent.png`
}

/** space 등 accent 마스크 파일이 있는 분야 */
export function applyFieldHasAccentMask(id: ApplyFieldReferenceId): boolean {
  return id === 'space'
}

export function applyFieldRecolorAssets(id: ApplyFieldReferenceId | null): ApplyFieldRecolorAssets | null {
  if (!id || !isApplyFieldReferenceId(id) || !RECOLOR_READY_SET.has(id)) return null
  const base = applyFieldReferenceImageSrc(id)
  if (!base) return null
  return {
    base,
    maskPrimary: applyFieldMaskPrimarySrc(id),
    maskSecondary: applyFieldMaskSecondarySrc(id),
    maskAccent: applyFieldHasAccentMask(id) ? applyFieldMaskAccentSrc(id) : null,
  }
}

export function hasApplyFieldRecolor(id: ApplyFieldReferenceId | null): id is ApplyFieldReferenceId {
  return id !== null && RECOLOR_READY_SET.has(id)
}
