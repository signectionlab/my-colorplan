import { describe, expect, it } from 'vitest'
import { setPaletteBarSegment, paletteBarSegmentPercents } from './accent-part-ratios'
import { roleForSlotRatio } from './role-assignment'

describe('setPaletteBarSegment', () => {
  it('splits two accent colors independently on the full bar', () => {
    const base = { ratios: [70, 20, 10] as [number, number, number], parts: [5, 5, 0] as [number, number, number] }
    const next = setPaletteBarSegment(base.ratios, 2, base.parts, 2, 7)
    const segs = paletteBarSegmentPercents(next.ratios, 2, next.parts)
    expect(segs.reduce((a, b) => a + b, 0)).toBe(100)
    expect(segs[2]).toBe(7)
    expect(segs[0] + segs[1]).toBeLessThan(90)
  })

  it('maps accent share to role bands on the full bar', () => {
    const next = setPaletteBarSegment([60, 20, 20], 2, [10, 10, 0], 2, 15)
    const segs = paletteBarSegmentPercents(next.ratios, 2, next.parts)
    expect(roleForSlotRatio(segs[2])).toBe('보조색')
  })
})
