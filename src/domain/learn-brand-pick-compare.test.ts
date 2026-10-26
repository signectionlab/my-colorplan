import { describe, expect, it } from 'vitest'
import { NEUTRAL_VALUE_STEPS } from '../data/munsell-brand-image'
import {
  compareChoiceGaugeForPick,
  compareOtherSideView,
  compareToneCandidateIds,
  compareToneOptionsForPick,
  resolveCompareToneId,
} from './learn-brand-pick'
import type { BrandImagePick } from '../types/project'

describe('compare tone (activity 2)', () => {
  const redVivid: BrandImagePick = { hueId: 'R', toneId: 'v', hex: '#cf0000' }

  it('offers distinct chromatic compare tones excluding the original', () => {
    const ids = compareToneCandidateIds(redVivid)
    expect(ids.length).toBeGreaterThanOrEqual(3)
    expect(ids.length).toBeLessThanOrEqual(4)
    expect(ids).not.toContain('v')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves stored compare tone when valid', () => {
    const ids = compareToneCandidateIds(redVivid)
    expect(resolveCompareToneId(redVivid, ids[1], ids)).toBe(ids[1])
  })

  it('falls back when stored compare tone is invalid or same as pick', () => {
    const ids = compareToneCandidateIds(redVivid)
    expect(resolveCompareToneId(redVivid, 'v', ids)).toBe(ids[0])
    expect(resolveCompareToneId(redVivid, 'not-a-tone', ids)).toBe(ids[0])
  })

  it('matches option hex with other side view', () => {
    const ids = compareToneCandidateIds(redVivid)
    const toneId = ids[0]
    const opt = compareToneOptionsForPick(redVivid).find((o) => o.toneId === toneId)
    const other = compareOtherSideView(redVivid, toneId)
    expect(opt).toBeTruthy()
    expect(other?.hex).toBe(opt!.hex)
    expect(other?.toneLine).toBeTruthy()
  })

  it('compare choice gauge reflects side selection', () => {
    const ids = compareToneCandidateIds(redVivid)
    const otherHex = compareOtherSideView(redVivid, ids[0])!.hex
    expect(
      compareChoiceGaugeForPick(redVivid, {
        imageCompareSide: null,
        compareToneId: ids[0],
        fitChoice: null,
        fitReason: '',
      }).empty,
    ).toBe(true)
    expect(
      compareChoiceGaugeForPick(redVivid, {
        imageCompareSide: 'mine',
        compareToneId: ids[0],
        fitChoice: null,
        fitReason: '',
      }),
    ).toEqual({ hex: redVivid.hex, empty: false, differsFromStep1: false })
    expect(
      compareChoiceGaugeForPick(redVivid, {
        imageCompareSide: 'other',
        compareToneId: ids[0],
        fitChoice: null,
        fitReason: '',
      }),
    ).toEqual({ hex: otherHex, empty: false, differsFromStep1: true })
    expect(
      compareChoiceGaugeForPick(redVivid, {
        imageCompareSide: 'unsure',
        compareToneId: ids[0],
        fitChoice: null,
        fitReason: '',
      }).empty,
    ).toBe(true)
  })

  it('neutral pick compares value steps not chromatic tones', () => {
    const mid = NEUTRAL_VALUE_STEPS[4]
    const neutral: BrandImagePick = { hueId: 'N', toneId: mid.label, hex: mid.hex }
    const ids = compareToneCandidateIds(neutral)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids).not.toContain(mid.label)
    for (const id of ids) {
      expect(id).toMatch(/^N\d+\.\d$/)
    }
    const other = compareOtherSideView(neutral, ids[0])
    expect(other?.hex).not.toBe(neutral.hex)
  })
})
