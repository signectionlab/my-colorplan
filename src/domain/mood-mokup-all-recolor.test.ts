import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyMokupAllPalette } from './mood-mokup-all-recolor'

const ALL_SVG = readFileSync(
  resolve(process.cwd(), 'public/images/mood-mokup/mokup-all.svg'),
  'utf8',
)

describe('mood-mokup-all-recolor', () => {
  it('maps template hex table to user palette', () => {
    const out = applyMokupAllPalette(ALL_SVG, {
      primary: '#111111',
      secondary: '#222222',
      accent1: '#333333',
      accent2: '#444444',
      accent3: '#555555',
    })

    expect(out).toContain('fill="#111111"')
    expect(out).toContain('fill="#222222"')
    expect(out).toContain('fill="#333333"')
    expect(out).toContain('fill="#444444"')
    expect(out).toContain('fill="#555555"')
    expect(out).not.toMatch(/#99A7C1/i)
    expect(out).not.toMatch(/#343845/i)
    expect(out).not.toMatch(/#B7A265/i)
    expect(out).not.toMatch(/#FF57FF/i)
    expect(out).not.toMatch(/#00CBE7/i)
  })

  it('replaces #B7A265 (보조) including self-closing rects', () => {
    const snippet =
      '<?xml?><style>.cls-5 { fill: #b7a265; }</style><rect class="cls-5" width="10" height="10"/>'
    const out = applyMokupAllPalette(snippet, {
      primary: '#111111',
      secondary: '#AABBCC',
      accent1: '#FFFFFF',
      accent2: '#FF57FF',
      accent3: '#00CBE7',
    })
    expect(out).not.toMatch(/b7a265/i)
    expect(out).toMatch(/\.cls-5\s*\{[^}]*fill:\s*#AABBCC/i)
    expect(out).toContain('class="cls-5" width="10" height="10" fill="#AABBCC"/>')
  })
})
