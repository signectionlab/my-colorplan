export type CompositeColors = {
  primary: string
  secondary: string
  accent: string
}

export type CompositeStrength = {
  primary: number
  secondary: number
  accent: number
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHsl(r: number, g: number, b: number): [h: number, s: number, l: number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [h, s, l]
}

export function hslToRgb(h: number, s: number, l: number): [r: number, g: number, b: number] {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

/** CSS mix-blend-mode: color — 밝기는 base, hue/sat는 tint */
export function blendColorMode(
  baseR: number,
  baseG: number,
  baseB: number,
  tintR: number,
  tintG: number,
  tintB: number,
): [number, number, number] {
  const [, , bl] = rgbToHsl(baseR, baseG, baseB)
  const [th, ts] = rgbToHsl(tintR, tintG, tintB)
  return hslToRgb(th, ts, bl)
}

export function tintImageDataWithMask(
  target: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  hex: string,
  strength: number,
): void {
  const tint = hexToRgb(hex)
  if (!tint || strength <= 0) return
  const pixelCount = target.length / 4
  for (let px = 0; px < pixelCount; px += 1) {
    const w = (mask[px * 4] / 255) * strength
    if (w <= 0) continue
    const i = px * 4
    const br = target[i]
    const bg = target[i + 1]
    const bb = target[i + 2]
    const [nr, ng, nb] = blendColorMode(br, bg, bb, tint.r, tint.g, tint.b)
    target[i] = Math.round(br * (1 - w) + nr * w)
    target[i + 1] = Math.round(bg * (1 - w) + ng * w)
    target[i + 2] = Math.round(bb * (1 - w) + nb * w)
  }
}

export type CompositePixelBuffer = {
  width: number
  height: number
  data: Uint8ClampedArray
}

export function compositeImageDataLayers(
  base: CompositePixelBuffer,
  masks: { primary: CompositePixelBuffer; secondary: CompositePixelBuffer; accent: CompositePixelBuffer | null },
  colors: CompositeColors,
  strength: CompositeStrength,
): CompositePixelBuffer {
  const out = new Uint8ClampedArray(base.data)
  tintImageDataWithMask(out, masks.primary.data, colors.primary, strength.primary)
  tintImageDataWithMask(out, masks.secondary.data, colors.secondary, strength.secondary)
  if (masks.accent) {
    tintImageDataWithMask(out, masks.accent.data, colors.accent, strength.accent)
  }
  return { width: base.width, height: base.height, data: out }
}

export function loadCompositeImage(url: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(url)
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Image load failed: ${url}`))
      img.src = url
    })
    imageCache.set(url, pending)
  }
  return pending
}

export function clearCompositeImageCache(): void {
  imageCache.clear()
}

function imageDataFromImage(img: HTMLImageElement, w: number, h: number): ImageData {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.drawImage(img, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h)
}

export type CompositeAssetUrls = {
  base: string
  maskPrimary: string
  maskSecondary: string
  maskAccent: string | null
}

export type CompositeImageFit = 'contain' | 'cover'

export async function renderApplyFieldCompositeToCanvas(
  displayCanvas: HTMLCanvasElement,
  urls: CompositeAssetUrls,
  colors: CompositeColors,
  strength: CompositeStrength,
  fit: CompositeImageFit = 'cover',
): Promise<void> {
  const [baseImg, maskP, maskS, maskA] = await Promise.all([
    loadCompositeImage(urls.base),
    loadCompositeImage(urls.maskPrimary),
    loadCompositeImage(urls.maskSecondary),
    urls.maskAccent ? loadCompositeImage(urls.maskAccent) : Promise.resolve(null),
  ])

  const iw = baseImg.naturalWidth
  const ih = baseImg.naturalHeight
  const off = document.createElement('canvas')
  off.width = iw
  off.height = ih
  const offCtx = off.getContext('2d')
  if (!offCtx) throw new Error('2d context unavailable')

  offCtx.drawImage(baseImg, 0, 0, iw, ih)
  const baseData = offCtx.getImageData(0, 0, iw, ih)
  const primaryData = imageDataFromImage(maskP, iw, ih)
  const secondaryData = imageDataFromImage(maskS, iw, ih)
  const accentData = maskA ? imageDataFromImage(maskA, iw, ih) : null

  const composited = compositeImageDataLayers(
    baseData,
    { primary: primaryData, secondary: secondaryData, accent: accentData },
    colors,
    strength,
  )
  offCtx.putImageData(new ImageData(composited.data, composited.width, composited.height), 0, 0)

  const destW = displayCanvas.width
  const destH = displayCanvas.height
  const dctx = displayCanvas.getContext('2d')
  if (!dctx) throw new Error('2d context unavailable')
  dctx.clearRect(0, 0, destW, destH)
  const scale =
    fit === 'cover' ? Math.max(destW / iw, destH / ih) : Math.min(destW / iw, destH / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (destW - dw) / 2
  const dy = (destH - dh) / 2
  dctx.drawImage(off, dx, dy, dw, dh)
}

export function defaultCompositeStrength(readable: boolean): CompositeStrength {
  return readable
    ? { primary: 0.55, secondary: 0.55, accent: 0.65 }
    : { primary: 0.72, secondary: 0.72, accent: 0.78 }
}
