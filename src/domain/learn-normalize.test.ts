import { describe, expect, it } from 'vitest'
import { brandImagePickKey } from './brand-image'
import { createDefaultProject } from './default-project'
import { mergeLearnFromRaw, normalizeLearnState } from './learn-normalize'
import { validateProjectFile } from './project-validation'

describe('learn normalize', () => {
  it('merges legacy learn without new fields', () => {
    const base = createDefaultProject().learn
    const merged = mergeLearnFromRaw(
      { interestIds: ['g-red'], reasons: { 'g-red': '메모' } },
      base,
    )
    expect(merged.interestIds).toEqual(['g-red'])
    expect(merged.reasons['g-red']).toBe('메모')
    expect(merged.focusPickKey).toBeNull()
    expect(merged.brandPickRecords).toEqual({})
  })

  it('creates brandPickRecords when picks exist', () => {
    const project = createDefaultProject()
    project.brand.imagePicks = [{ hueId: 'R', toneId: 'v', hex: '#cf0000' }]
    normalizeLearnState(project.learn, project.brand.imagePicks)
    const key = brandImagePickKey(project.brand.imagePicks[0])
    expect(project.learn.brandPickRecords[key]).toMatchObject({
      imageCompareSide: null,
      fitChoice: null,
      fitReason: '',
      compareToneId: expect.any(String),
    })
  })

  it('resets compare side when stored compareToneId is invalid', () => {
    const project = createDefaultProject()
    const pick = { hueId: 'R', toneId: 'v', hex: '#cf0000' }
    project.brand.imagePicks = [pick]
    const key = brandImagePickKey(pick)
    project.learn.brandPickRecords = {
      [key]: {
        imageCompareSide: 'other',
        compareToneId: 'invalid-tone',
        fitChoice: null,
        fitReason: '',
      },
    }
    normalizeLearnState(project.learn, project.brand.imagePicks)
    const rec = project.learn.brandPickRecords[key]
    expect(rec?.compareToneId).not.toBe('invalid-tone')
    expect(rec?.compareToneId).not.toBe('v')
    expect(rec?.imageCompareSide).toBeNull()
  })

  it('parses unsure compare side and compareToneId from raw', () => {
    const base = createDefaultProject().learn
    const merged = mergeLearnFromRaw(
      {
        brandPickRecords: {
          'R:v': { imageCompareSide: 'unsure', compareToneId: 'p', fitChoice: 'fit', fitReason: '' },
        },
      },
      base,
    )
    expect(merged.brandPickRecords['R:v']).toEqual({
      imageCompareSide: 'unsure',
      compareToneId: 'p',
      fitChoice: 'fit',
      fitReason: '',
    })
  })

  it('preserves v2 learn records on import', () => {
    const key = 'R:v'
    const result = validateProjectFile({
      kind: 'my-brand-color-canvas',
      version: 2,
      brand: {
        imagePicks: [{ hueId: 'R', toneId: 'v', hex: '#cf0000' }],
        imagePickSlotCount: 3,
        imagePickAddingDone: false,
      },
      learn: {
        focusPickKey: key,
        brandPickRecords: {
          [key]: { fitChoice: 'fit', fitReason: '분위기', imageCompareSide: 'mine' },
        },
      },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.project.learn.focusPickKey).toBe(key)
    expect(result.project.learn.brandPickRecords[key]?.fitReason).toBe('분위기')
  })
})
