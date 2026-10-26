import { describe, expect, it } from 'vitest'
import { moodMokupSvgUrlForField, MOKUP_ALL_SVG_URL } from './brand-moodboard'

describe('brand-moodboard', () => {
  it('always uses unified mokup-all svg for step 5', () => {
    expect(moodMokupSvgUrlForField('space')).toBe(MOKUP_ALL_SVG_URL)
    expect(moodMokupSvgUrlForField(null)).toBe(MOKUP_ALL_SVG_URL)
  })
})
