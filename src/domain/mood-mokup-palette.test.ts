import { describe, expect, it } from 'vitest'
import {
  applyTemplateColorMap,
  buildTemplateToUserHexMap,
  estimateTemplateColorAreas,
  mapTemplateColorsToRoles,
} from './mood-mokup-color-map'

describe('mood-mokup-color-map', () => {
  it('assigns largest template areas to primary by ratio', () => {
    const svg = `
      <rect width="700" height="500" fill="#224466"/>
      <rect width="200" height="200" fill="#335577"/>
      <rect width="50" height="50" fill="#446688"/>
    `
    const areas = estimateTemplateColorAreas(svg)
    const roles = mapTemplateColorsToRoles(areas, { primaryPct: 70, secondaryPct: 20, accentPct: 10 })
    expect(roles.get('#224466')).toBe('primary')
    expect(roles.get('#446688')).toBe('accent')
  })

  it('applyTemplateColorMap replaces mapped hexes', () => {
    const roleMap = new Map([
      ['#111111', 'primary'],
      ['#333333', 'accent'],
    ] as const)
    const map = buildTemplateToUserHexMap(roleMap, {
      primary: '#AAAAAA',
      secondary: '#BBBBBB',
      accent: '#CCCCCC',
    })
    const out = applyTemplateColorMap('<rect fill="#111111"/><rect fill="#333333"/>', map)
    expect(out).toContain('#AAAAAA')
    expect(out).toContain('#CCCCCC')
  })
})
