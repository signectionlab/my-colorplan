import { describe, expect, it } from 'vitest'
import { createDefaultProject } from './default-project'
import {
  brandImagePickKey,
  canAssignBrandPickToColorPlanSlot,
  paletteRatioBarSegments,
  type BrandColorPlanSlot,
} from './brand-image'
import { assignRoles } from './role-assignment'
import type { BrandImagePick } from '../types/project'

const samplePick = (hueId: string, toneId: string, hex: string): BrandImagePick => ({
  hueId,
  toneId,
  hex,
})

describe('canAssignBrandPickToColorPlanSlot', () => {
  it('allows the same pick on the slot that already has it', () => {
    const project = createDefaultProject()
    const a = samplePick('5R', 'v', '#aa0000')
    const b = samplePick('5Y', 'v', '#bbbb00')
    project.brand.imagePicks = [a, b, samplePick('5G', 'v', '#00aa00')]
    const keyA = brandImagePickKey(a)
    project.palette.colors[0].id = keyA
    project.palette.colors[0].hex = a.hex
    project.brand.accentPlanPickKeys = [null, null, null]

    expect(
      canAssignBrandPickToColorPlanSlot(project.brand, project.palette, { kind: 'role', index: 0 }, a),
    ).toBe(true)
  })

  it('blocks assigning a pick already used on another role', () => {
    const project = createDefaultProject()
    const a = samplePick('5R', 'v', '#aa0000')
    const b = samplePick('5Y', 'v', '#bbbb00')
    project.brand.imagePicks = [a, b, samplePick('5G', 'v', '#00aa00')]
    project.palette.colors[0].id = brandImagePickKey(a)
    project.palette.colors[1].id = brandImagePickKey(b)

    expect(
      canAssignBrandPickToColorPlanSlot(project.brand, project.palette, { kind: 'role', index: 1 }, a),
    ).toBe(false)
  })

  it('blocks duplicate accent keys across slots when 4 picks', () => {
    const project = createDefaultProject()
    const picks = [
      samplePick('5R', 'v', '#1'),
      samplePick('5Y', 'v', '#2'),
      samplePick('5G', 'v', '#3'),
      samplePick('5B', 'v', '#4'),
    ]
    project.brand.imagePicks = picks
    project.brand.accentPlanPickKeys = [brandImagePickKey(picks[2]), brandImagePickKey(picks[3]), null]
    project.palette.colors[0].id = brandImagePickKey(picks[0])
    project.palette.colors[1].id = brandImagePickKey(picks[1])
    project.palette.colors[2].id = brandImagePickKey(picks[2])

    const slot: BrandColorPlanSlot = { kind: 'accent', index: 1 }
    expect(canAssignBrandPickToColorPlanSlot(project.brand, project.palette, slot, picks[2])).toBe(false)
    expect(canAssignBrandPickToColorPlanSlot(project.brand, project.palette, slot, picks[0])).toBe(false)
  })
})

describe('paletteRatioBarSegments', () => {
  it('uses three palette slots when 3 picks', () => {
    const project = createDefaultProject()
    project.brand.imagePicks = [
      samplePick('5R', 'v', '#111111'),
      samplePick('5Y', 'v', '#222222'),
      samplePick('5G', 'v', '#333333'),
    ]
    project.palette.ratios = [60, 30, 10]

    const segs = paletteRatioBarSegments(project.brand, project.palette)
    expect(segs).toHaveLength(3)
    expect(segs.map((s) => s.widthPct)).toEqual([60, 30, 10])
  })

  it('splits accent role evenly when 4 picks', () => {
    const project = createDefaultProject()
    const picks = [
      samplePick('5R', 'v', '#111111'),
      samplePick('5Y', 'v', '#222222'),
      samplePick('5G', 'v', '#333333'),
      samplePick('5B', 'v', '#444444'),
    ]
    project.brand.imagePicks = picks
    project.palette.ratios = [70, 20, 10]
    project.brand.accentPlanPickKeys = [brandImagePickKey(picks[2]), brandImagePickKey(picks[3]), null]

    const segs = paletteRatioBarSegments(project.brand, project.palette)
    expect(segs).toHaveLength(4)
    expect(segs.map((s) => s.widthPct)).toEqual([70, 20, 5, 5])
    expect(segs[2].hex).toBe('#333333')
    expect(segs[3].hex).toBe('#444444')
  })

  it('keeps accent parts at 5% each when slot 2 stays 10% (4 picks)', () => {
    const project = createDefaultProject()
    const picks = [
      samplePick('5R', 'v', '#1'),
      samplePick('5Y', 'v', '#2'),
      samplePick('5G', 'v', '#3'),
      samplePick('5B', 'v', '#4'),
    ]
    project.brand.imagePicks = picks
    project.palette.ratios = [50, 40, 10]
    project.brand.accentPlanPickKeys = [brandImagePickKey(picks[2]), brandImagePickKey(picks[3]), null]

    const segs = paletteRatioBarSegments(project.brand, project.palette)
    expect(segs.map((s) => s.widthPct)).toEqual([50, 40, 5, 5])
  })

  it('splits accent into 10/3% each for 5 picks', () => {
    const project = createDefaultProject()
    const picks = [
      samplePick('5R', 'v', '#1'),
      samplePick('5Y', 'v', '#2'),
      samplePick('5G', 'v', '#3'),
      samplePick('5B', 'v', '#4'),
      samplePick('5P', 'v', '#5'),
    ]
    project.brand.imagePicks = picks
    project.palette.ratios = [70, 20, 10]
    project.brand.accentPlanPickKeys = [
      brandImagePickKey(picks[2]),
      brandImagePickKey(picks[3]),
      brandImagePickKey(picks[4]),
    ]

    const segs = paletteRatioBarSegments(project.brand, project.palette)
    expect(segs).toHaveLength(5)
    const accentParts = segs.slice(2)
    expect(accentParts.every((s) => Math.abs(s.widthPct - 10 / 3) < 0.001)).toBe(true)
  })

  it('orders bar by role when ratios reshuffle roles', () => {
    const project = createDefaultProject()
    project.brand.imagePicks = [
      samplePick('5R', 'v', '#aaa'),
      samplePick('5Y', 'v', '#bbb'),
      samplePick('5G', 'v', '#ccc'),
    ]
    project.palette.colors[0].hex = '#aaa'
    project.palette.colors[1].hex = '#bbb'
    project.palette.colors[2].hex = '#ccc'
    project.palette.ratios = [10, 60, 30]
    project.palette.roles = assignRoles(project.palette.ratios, ['주조색', '보조색', '강조색'])

    const segs = paletteRatioBarSegments(project.brand, project.palette)
    expect(segs.map((s) => s.hex)).toEqual(['#bbb', '#ccc', '#aaa'])
    expect(segs.map((s) => s.widthPct)).toEqual([60, 30, 10])
  })
})
