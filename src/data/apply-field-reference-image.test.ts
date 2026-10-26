import { describe, expect, it } from 'vitest'
import {
  applyFieldReferenceImageAlt,
  applyFieldReferenceImageFileName,
  applyFieldReferenceImageSrc,
  isApplyFieldReferenceId,
} from './apply-field-reference-image'

describe('apply-field-reference-image', () => {
  it('maps known apply fields to public image paths', () => {
    expect(applyFieldReferenceImageSrc('space')).toBe('/images/apply-fields/apply-space.png')
    expect(applyFieldReferenceImageSrc('product')).toBe('/images/apply-fields/apply-product.png')
    expect(applyFieldReferenceImageSrc('online')).toBe('/images/apply-fields/apply-online.png')
    expect(applyFieldReferenceImageSrc('print')).toBe('/images/apply-fields/apply-print.png')
    expect(applyFieldReferenceImageSrc('service')).toBe('/images/apply-fields/apply-service.png')
  })

  it('returns null for other and unset', () => {
    expect(applyFieldReferenceImageSrc('other')).toBeNull()
    expect(applyFieldReferenceImageSrc(null)).toBeNull()
  })

  it('guards reference ids', () => {
    expect(isApplyFieldReferenceId('online')).toBe(true)
    expect(isApplyFieldReferenceId('other')).toBe(false)
    expect(isApplyFieldReferenceId(null)).toBe(false)
  })

  it('builds alt text and file names', () => {
    expect(applyFieldReferenceImageAlt('print', '홍보·인쇄물')).toContain('홍보·인쇄물')
    expect(applyFieldReferenceImageFileName('space')).toBe('apply-space.png')
  })
})
