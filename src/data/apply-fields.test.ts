import { describe, expect, it } from 'vitest'
import {
  APPLY_FIELD_PREVIEW_FALLBACK,
  APPLY_PREVIEW_TABS,
  defaultPreviewForApplyField,
} from './apply-fields'

describe('apply-fields preview tabs', () => {
  it('lists five moodboard tabs without common default', () => {
    expect(APPLY_PREVIEW_TABS).toHaveLength(5)
    expect(APPLY_PREVIEW_TABS.some((t) => (t.id as string) === 'default')).toBe(false)
  })

  it('falls back to space when field unset or other', () => {
    expect(defaultPreviewForApplyField(null)).toBe(APPLY_FIELD_PREVIEW_FALLBACK)
    expect(defaultPreviewForApplyField('other')).toBe('space')
    expect(defaultPreviewForApplyField('print')).toBe('print')
  })
})
