import { describe, expect, it } from 'vitest'
import type { BrandImagePick } from '../types/project'
import {
  brandCompareSeedFromPicks,
  compareMatchesStartExample,
  COMPARE_START_EXAMPLE,
  readableTextOnBackground,
} from './compare-ux'

describe('compare-ux brand helpers', () => {
  it('picks readable text by contrast on background', () => {
    expect(readableTextOnBackground('#ffffff')).toBe('#000000')
    expect(readableTextOnBackground('#0d253d')).toBe('#ffffff')
  })

  it('seeds compare from first brand pick', () => {
    const picks: BrandImagePick[] = [
      { hueId: 'R', toneId: 'v', hex: '#cf0000' },
      { hueId: 'B', toneId: 'dp', hex: '#003366' },
    ]
    const seed = brandCompareSeedFromPicks(picks)!
    expect(seed.background).toBe('#cf0000')
    expect(seed.text).toBe('#333333')
    expect(seed.shape).toBe('#003366')
    expect(seed.surroundShape).toBe('#cf0000')
    expect(seed.surroundBgB).toBe('#003366')
  })

  it('detects start example snapshot', () => {
    expect(compareMatchesStartExample(COMPARE_START_EXAMPLE)).toBe(true)
    expect(
      compareMatchesStartExample({ ...COMPARE_START_EXAMPLE, background: '#cf0000' }),
    ).toBe(false)
  })
})
