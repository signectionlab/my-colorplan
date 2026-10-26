import { describe, expect, it } from 'vitest'
import {
  APPLY_FIELD_RECOLOR_READY,
  applyFieldHasAccentMask,
  applyFieldMaskAccentSrc,
  applyFieldMaskPrimarySrc,
  applyFieldMaskSecondarySrc,
  applyFieldRecolorAssets,
  hasApplyFieldRecolor,
} from './apply-field-recolor'

describe('apply-field-recolor', () => {
  it('lists space as recolor-ready', () => {
    expect(APPLY_FIELD_RECOLOR_READY).toEqual(['space'])
    expect(hasApplyFieldRecolor('space')).toBe(true)
    expect(hasApplyFieldRecolor('product')).toBe(false)
    expect(hasApplyFieldRecolor(null)).toBe(false)
  })

  it('returns asset URLs for ready fields', () => {
    expect(applyFieldMaskPrimarySrc('space')).toBe('/images/apply-fields/apply-space-mask-primary.png')
    expect(applyFieldMaskSecondarySrc('space')).toBe('/images/apply-fields/apply-space-mask-secondary.png')
    expect(applyFieldMaskAccentSrc('space')).toBe('/images/apply-fields/apply-space-mask-accent.png')
    expect(applyFieldHasAccentMask('space')).toBe(true)
    expect(applyFieldHasAccentMask('product')).toBe(false)

    const assets = applyFieldRecolorAssets('space')
    expect(assets?.base).toBe('/images/apply-fields/apply-space.png')
    expect(assets?.maskPrimary).toContain('mask-primary')
    expect(assets?.maskAccent).toContain('mask-accent')
    expect(applyFieldRecolorAssets('online')).toBeNull()
  })
})
