import { describe, expect, it } from 'vitest'
import { normalizeRatiosTriple, setRatio, capMultiPickAccentSlot } from './ratio-calculation'
import {
  assignRoles,
  describeRoleChanges,
  FIXED_PLAN_SLOT_ROLES,
  PRIMARY_ROLE_MIN_PCT,
  PRIMARY_ROLE_MAX_PCT,
  ACCENT_ROLE_MAX_PCT,
  ACCENT_ROLE_TOTAL_PCT,
  accentPartWidthPercentOfBar,
  roleForSlotRatio,
} from './role-assignment'
import { contrastRatio } from './contrast'
import { buildDraft } from './draft-template'
import { validateProjectFile } from './project-validation'
import { createDefaultProject } from './default-project'

describe('setRatio', () => {
  it('keeps 100 when one ratio becomes 10', () => {
    const next = setRatio([60, 30, 10], 0, 10)
    expect(next[0]).toBe(10)
    expect(next.reduce((sum, value) => sum + value, 0)).toBe(100)
  })
})

describe('normalizeRatiosTriple', () => {
  it('keeps sum 100 with minimum per slot', () => {
    const next = normalizeRatiosTriple([40, 35, 20])
    expect(next.reduce((s, v) => s + v, 0)).toBe(100)
    expect(next.every((v) => v >= 1)).toBe(true)
  })
})

describe('accentPartWidthPercentOfBar', () => {
  it('splits 10% by accent count', () => {
    expect(accentPartWidthPercentOfBar(1)).toBe(ACCENT_ROLE_TOTAL_PCT)
    expect(accentPartWidthPercentOfBar(2)).toBe(5)
    expect(accentPartWidthPercentOfBar(3)).toBeCloseTo(10 / 3, 5)
  })
})

describe('capMultiPickAccentSlot', () => {
  it('limits slot 2 to 10% and redistributes', () => {
    const next = capMultiPickAccentSlot([50, 35, 15], true)
    expect(next[2]).toBe(10)
    expect(next.reduce((s, v) => s + v, 0)).toBe(100)
  })
})

describe('roles', () => {
  it('maps each slot by its own ratio only', () => {
    expect(assignRoles([10, 60, 30], ['주조색', '보조색', '강조색'])).toEqual([
      '강조색',
      '주조색',
      '보조색',
    ])
    const note = describeRoleChanges({
      names: ['하양', '남색', '주황'],
      ratiosBefore: [60, 30, 10],
      ratiosAfter: [10, 60, 30],
      rolesBefore: ['주조색', '보조색', '강조색'],
      rolesAfter: assignRoles([10, 60, 30], ['주조색', '보조색', '강조색']),
    })
    expect(note).toContain('남색')
  })

  it('uses primary band 51–70%', () => {
    expect(roleForSlotRatio(65)).toBe('주조색')
    expect(roleForSlotRatio(51)).toBe('주조색')
    expect(roleForSlotRatio(50)).toBe('보조색')
    expect(roleForSlotRatio(71)).toBe('보조색')
    expect(assignRoles([70, 20, 10], ['주조색', '보조색', '강조색'])).toEqual([
      '주조색',
      '보조색',
      '강조색',
    ])
  })

  it(`uses accent at ${ACCENT_ROLE_MAX_PCT}% or below`, () => {
    expect(roleForSlotRatio(10)).toBe('강조색')
    expect(roleForSlotRatio(11)).toBe('보조색')
    expect(assignRoles([70, 10, 20], ['주조색', '보조색', '강조색'])).toEqual([
      '주조색',
      '강조색',
      '보조색',
    ])
  })

  it('shows both 보조 when slots 0 and 1 are equal', () => {
    expect(assignRoles([50, 50, 0], ['주조색', '보조색', '강조색']).slice(0, 2)).toEqual([
      '보조색',
      '보조색',
    ])
  })

  it('maps each slot only by its ratio (no pair override)', () => {
    expect(assignRoles([51, 49, 0], ['보조색', '보조색', '강조색'])).toEqual([
      '주조색',
      '보조색',
      '보조색',
    ])
    expect(assignRoles([15, 34, 51], ['보조색', '보조색', '강조색'])).toEqual([
      '보조색',
      '보조색',
      '주조색',
    ])
  })

  it('fixes slot roles for brand color plan indices', () => {
    expect(FIXED_PLAN_SLOT_ROLES).toEqual(['주조색', '보조색', '강조색'])
  })
})

describe('contrast and draft', () => {
  it('calculates black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThan(20)
  })

  it('uses only entered facts', () => {
    const project = createDefaultProject()
    project.brand.name = '테스트'
    const draft = buildDraft(project)
    expect(draft).toContain('테스트')
  })
})

describe('project file', () => {
  it('keeps a v1 brand name', () => {
    const result = validateProjectFile({
      kind: 'my-brand-color-canvas',
      version: 1,
      brand: { name: 'V1' },
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.project.brand.name).toBe('V1')
  })
})
