import { describe, expect, it } from 'vitest'
import { MOODBOARD_TEMPLATE_PRIMARY, personalizeMoodboardSvg } from './brand-moodboard-svg'

describe('personalizeMoodboardSvg', () => {
  const sample = `<svg><rect fill="var(--primary, #315E53)"/><text>MY BRAND</text></svg>`

  it('applies palette and brand name', () => {
    const out = personalizeMoodboardSvg(sample, '시그넥션', {
      primary: '#112233',
      secondary: '#AABBCC',
      accent: '#FF5500',
    })
    expect(out).toContain('#112233')
    expect(out).not.toContain(MOODBOARD_TEMPLATE_PRIMARY)
    expect(out).toContain('시그넥션')
    expect(out).not.toContain('MY BRAND')
  })

  it('replaces standalone BRAND label text', () => {
    const sticker = `<text>BRAND</text>`
    const out = personalizeMoodboardSvg(sticker, '라브', {
      primary: '#111111',
      secondary: '#222222',
      accent: '#333333',
    })
    expect(out).toContain('>라브</text>')
  })

  it('escapes xml in brand name', () => {
    const out = personalizeMoodboardSvg(sample, 'A & B', {
      primary: '#111111',
      secondary: '#222222',
      accent: '#333333',
    })
    expect(out).toContain('A &amp; B')
  })
})
