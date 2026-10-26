import { describe, expect, it } from 'vitest'
import {
  IMAGE_ADJECTIVE_SECONDARY_DISPLAY_MAX,
  imageAdjectivesForPick,
} from './color-education-data'
import { educationToneColorName } from '../domain/learn-brand-pick'

describe('imageAdjectivesForPick', () => {
  it('covers 10 chromatic hueIds including PR', () => {
    expect(imageAdjectivesForPick('R', 'v')?.primary).toBe('열정적인')
    expect(imageAdjectivesForPick('YR', 'lt')?.primary).toBe('활기찬')
    expect(imageAdjectivesForPick('B', 'dp')?.primary).toBe('시원한')
    expect(imageAdjectivesForPick('P', 'v')?.primary).toBe('신비로운')
    expect(imageAdjectivesForPick('PR', 'v')?.primary).toBe('화려한')
    expect(imageAdjectivesForPick('PR', 'v')?.secondary).toHaveLength(4)
    expect(imageAdjectivesForPick('PR', 'v')!.secondary.length).toBeLessThanOrEqual(
      IMAGE_ADJECTIVE_SECONDARY_DISPLAY_MAX,
    )
  })

  it('maps neutral N levels to achromatic adjectives', () => {
    expect(imageAdjectivesForPick('N', 'N9.5')?.primary).toBe('깨끗한')
    expect(imageAdjectivesForPick('N', 'N1.5')?.primary).toBe('강렬한')
    expect(imageAdjectivesForPick('N', 'N5.0')?.primary).toBe('차분한')
  })
})

describe('educationToneColorName', () => {
  it('combines KS_BASIC_TONE_DEFS label with hue name', () => {
    expect(educationToneColorName('R', 'v')).toBe('선명한 빨강')
    expect(educationToneColorName('R', 'lt')).toBe('밝은 빨강')
    expect(educationToneColorName('B', 'dp')).toBe('진한 파랑')
  })

  it('does not apply chromatic tone pattern to neutral', () => {
    const name = educationToneColorName('N', 'N5.0')
    expect(name).not.toContain('선명한')
    expect(name).toMatch(/회/)
  })
})
