import { describe, expect, it } from 'vitest'
import { createDefaultProject } from './default-project'
import { mergeCompareFromRaw, mergePaletteMetaFromRaw } from './compare-normalize'

describe('mergeCompareFromRaw', () => {
  it('keeps defaults when raw is empty', () => {
    const base = createDefaultProject().compare
    const merged = mergeCompareFromRaw({}, base)
    expect(merged.readabilityChoice).toBe(base.readabilityChoice)
    expect(merged.surroundBgA).toBe(base.surroundBgA)
    expect(merged.surroundShape).toBe(base.surroundShape)
  })

  it('falls back surroundShape to shape when missing in raw', () => {
    const base = createDefaultProject().compare
    const merged = mergeCompareFromRaw({ shape: '#112233' }, { ...base, surroundShape: '#112233' })
    expect(merged.surroundShape).toBe('#112233')
  })

  it('accepts valid observation choices', () => {
    const base = createDefaultProject().compare
    const merged = mergeCompareFromRaw(
      { readabilityChoice: 'mood_diff', surroundChoice: 'similar', brandExperimentChoice: 'light_bg' },
      base,
    )
    expect(merged.readabilityChoice).toBe('mood_diff')
    expect(merged.surroundChoice).toBe('similar')
    expect(merged.brandExperimentChoice).toBe('light_bg')
  })

  it('ignores invalid choice strings', () => {
    const base = createDefaultProject().compare
    const merged = mergeCompareFromRaw({ readabilityChoice: 'invalid' }, { ...base, readabilityChoice: 'current' })
    expect(merged.readabilityChoice).toBe('current')
  })
})

describe('mergePaletteMetaFromRaw', () => {
  it('merges combo reason fields', () => {
    const base = createDefaultProject().palette
    const merged = mergePaletteMetaFromRaw({ comboReasonChoice: 'balance', comboReason: '테스트' }, base)
    expect(merged.comboReasonChoice).toBe('balance')
    expect(merged.comboReason).toBe('테스트')
  })
})
