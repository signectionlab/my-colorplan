import { describe, expect, it } from 'vitest'
import {
  blendColorMode,
  compositeImageDataLayers,
  hexToRgb,
  tintImageDataWithMask,
} from './apply-field-composite'

function mockImageData(w: number, h: number, pixels: number[]): ImageData {
  return {
    width: w,
    height: h,
    data: new Uint8ClampedArray(pixels),
    colorSpace: 'srgb',
  } as ImageData
}

describe('apply-field-composite', () => {
  it('parses hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('invalid')).toBeNull()
  })

  it('tints masked pixels toward target hue', () => {
    const w = 2
    const h = 1
    const base = mockImageData(w, h, [128, 128, 128, 255, 200, 200, 200, 255])
    const mask = mockImageData(w, h, [255, 255, 255, 255, 0, 0, 0, 255])

    const tinted = new Uint8ClampedArray(base.data)
    tintImageDataWithMask(tinted, mask.data, '#0000ff', 1)

    expect(tinted[0]).not.toBe(128)
    expect(tinted[2]).toBeGreaterThan(tinted[1])
    expect(tinted[4]).toBe(200)
    expect(tinted[5]).toBe(200)
  })

  it('compositeImageDataLayers applies primary then secondary', () => {
    const base = mockImageData(1, 1, [100, 100, 100, 255])
    const full = mockImageData(1, 1, [255, 255, 255, 255])
    const empty = mockImageData(1, 1, [0, 0, 0, 255])

    const out = compositeImageDataLayers(
      base,
      { primary: full, secondary: empty, accent: null },
      { primary: '#ff0000', secondary: '#00ff00', accent: '#0000ff' },
      { primary: 1, secondary: 1, accent: 1 },
    )
    const [r, g, b] = blendColorMode(100, 100, 100, 255, 0, 0)
    expect(out.data[0]).toBe(r)
    expect(out.data[1]).toBe(g)
    expect(out.data[2]).toBe(b)
    expect(out.width).toBe(1)
  })
})
