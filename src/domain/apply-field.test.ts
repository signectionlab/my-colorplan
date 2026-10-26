import { describe, expect, it } from 'vitest'
import { createDefaultProject } from './default-project'
import { applyFieldDisplayText, migrateApplyFieldFromLegacy, parseApplyFieldId } from './apply-field'

describe('apply-field', () => {
  it('parses stable ids', () => {
    expect(parseApplyFieldId('online')).toBe('online')
    expect(parseApplyFieldId('invalid')).toBeNull()
  })

  it('migrates legacy free-text field to other+custom', () => {
    const project = createDefaultProject()
    project.brand.field = '동네 카페'
    migrateApplyFieldFromLegacy(project.brand)
    expect(project.brand.applyFieldId).toBe('other')
    expect(project.brand.applyFieldCustom).toBe('동네 카페')
    expect(applyFieldDisplayText(project.brand)).toBe('동네 카페')
  })

  it('shows card title when id is set', () => {
    const project = createDefaultProject()
    project.brand.applyFieldId = 'print'
    migrateApplyFieldFromLegacy(project.brand)
    expect(applyFieldDisplayText(project.brand)).toBe('홍보·인쇄물')
  })
})
