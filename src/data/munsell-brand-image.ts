export type MunsellHue = {
  id: string
  name: string
  code: string
  hex: string
  group: 'chromatic' | 'achromatic'
}

export type KsBasicToneDef = {
  id: string
  abbrev: string
  english: string
  nameKo: string
}

export type MunsellTone = KsBasicToneDef & {
  hex: string
}

export const ACHROMATIC_TONE_ID = 'base'
/** 명도 단계로 고른 무채색 */
export const NEUTRAL_HUE_ID = 'N'

export type AchromaticAnchor = 'Wh' | 'Bk'

/** KS 기본 색조 12종 (UI·라벨 기준) */
export const KS_BASIC_TONE_DEFS: KsBasicToneDef[] = [
  { id: 'v', abbrev: 'v', english: 'Vivid', nameKo: '선명한' },
  { id: 's', abbrev: 's', english: 'Strong', nameKo: '강한' },
  { id: 'dp', abbrev: 'dp', english: 'Deep', nameKo: '진한' },
  { id: 'dk', abbrev: 'dk', english: 'Dark', nameKo: '어두운' },
  { id: 'p', abbrev: 'p', english: 'Pale', nameKo: '연한' },
  { id: 'lt', abbrev: 'lt', english: 'Light', nameKo: '밝은' },
  { id: 'w', abbrev: 'w', english: 'Whitish', nameKo: '흰' },
  { id: 'ltg', abbrev: 'ltg', english: 'Light grayish', nameKo: '밝은 회색빛의' },
  { id: 'g', abbrev: 'g', english: 'Grayish', nameKo: '회색빛의' },
  { id: 'dkg', abbrev: 'dkg', english: 'Dark grayish', nameKo: '어두운 회색빛의' },
  { id: 'sf', abbrev: 'sf', english: 'Soft', nameKo: '흐린' },
  { id: 'd', abbrev: 'd', english: 'Dull', nameKo: '탁한' },
]

export const MUNSELL_HUES: MunsellHue[] = [
  { id: 'R', name: '빨강', code: 'R', hex: '#cf0000', group: 'chromatic' },
  { id: 'YR', name: '주황', code: 'YR', hex: '#ff6a0d', group: 'chromatic' },
  { id: 'Y', name: '노랑', code: 'Y', hex: '#ffed4b', group: 'chromatic' },
  { id: 'GY', name: '연두', code: 'GY', hex: '#77d405', group: 'chromatic' },
  { id: 'G', name: '초록', code: 'G', hex: '#007f4c', group: 'chromatic' },
  { id: 'BG', name: '청록', code: 'BG', hex: '#00809a', group: 'chromatic' },
  { id: 'B', name: '파랑', code: 'B', hex: '#1142d4', group: 'chromatic' },
  { id: 'PB', name: '남색', code: 'PB', hex: '#00069d', group: 'chromatic' },
  { id: 'P', name: '보라', code: 'P', hex: '#7100ae', group: 'chromatic' },
  { id: 'PR', name: '자주', code: 'PR', hex: '#de016f', group: 'chromatic' },
  { id: 'Wh', name: '하양', code: 'Wh', hex: '#ffffff', group: 'achromatic' },
  { id: 'Gy', name: '회색', code: 'Gy', hex: '#8d8d8d', group: 'achromatic' },
  { id: 'Bk', name: '검정', code: 'Bk', hex: '#000000', group: 'achromatic' },
]

function mixWithWhite(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(c + (255 - c) * ratio)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function mixWithBlack(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(c * (1 - ratio))
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function desaturate(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  const gray = 0.299 * r + 0.587 * g + 0.114 * b
  r = Math.round(r + (gray - r) * amount)
  g = Math.round(g + (gray - g) * amount)
  b = Math.round(b + (gray - b) * amount)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function saturate(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  const gray = 0.299 * r + 0.587 * g + 0.114 * b
  const push = (c: number) => Math.min(255, Math.max(0, Math.round(c + (c - gray) * amount)))
  return `#${[push(r), push(g), push(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** 기준색 + KS 색조 → UI용 근사 HEX (정식 측색·KS 인증값 아님) */
function approximateToneHex(base: string, toneId: string): string {
  switch (toneId) {
    case 'v':
      return saturate(base, 0.18).toLowerCase()
    case 's':
      return mixWithBlack(saturate(base, 0.1), 0.14)
    case 'dp':
      return mixWithBlack(saturate(base, 0.04), 0.36)
    case 'dk':
      return mixWithBlack(desaturate(base, 0.28), 0.54)
    case 'p':
      return mixWithWhite(desaturate(base, 0.28), 0.38)
    case 'lt':
      return mixWithWhite(base, 0.34)
    case 'w':
      return mixWithWhite(desaturate(base, 0.18), 0.58)
    case 'ltg':
      return mixWithWhite(desaturate(base, 0.48), 0.3)
    case 'g':
      return desaturate(base, 0.44)
    case 'dkg':
      return mixWithBlack(desaturate(base, 0.48), 0.26)
    case 'sf':
      return mixWithWhite(desaturate(base, 0.36), 0.2)
    case 'd':
      return mixWithBlack(desaturate(base, 0.5), 0.16)
    default:
      return base.toLowerCase()
  }
}

/** UI 예시용 12색조 (정식 먼셀·KS 인증 측색값 아님) */
export function tonesForHue(hue: MunsellHue): MunsellTone[] {
  if (hue.group === 'achromatic') return []
  const base = hue.hex
  return KS_BASIC_TONE_DEFS.map((def) => ({
    ...def,
    hex: approximateToneHex(base, def.id),
  }))
}

export function toneDefById(toneId: string): KsBasicToneDef | undefined {
  return KS_BASIC_TONE_DEFS.find((tone) => tone.id === toneId)
}

export type ImagePickFacts = {
  colorName: string
  step: string
  code: string
}

/** 한 줄로 잇지 않고 색명·단계·기호를 나눠 돌려준다 */
export function imagePickFacts(hueId: string, toneId: string): ImagePickFacts {
  if (hueId === NEUTRAL_HUE_ID) {
    const level = neutralValueLevel(toneId)
    return {
      colorName: neutralPickColorName(toneId),
      step: level !== undefined ? `${level}단계` : '',
      code: toneId,
    }
  }
  const hue = MUNSELL_HUES.find((item) => item.id === hueId)
  if (!hue) return { colorName: '', step: '', code: '' }
  if (hue.group === 'achromatic' || toneId === ACHROMATIC_TONE_ID) {
    return { colorName: hue.name, step: '', code: hue.code }
  }
  const tone = toneDefById(toneId)
  return {
    colorName: hue.name,
    step: tone?.nameKo ?? '',
    code: tone ? `${hue.code} ${tone.abbrev}` : hue.code,
  }
}

export function imagePickLabel(hueId: string, toneId: string, hex: string): string {
  if (hueId === NEUTRAL_HUE_ID) {
    const name = neutralPickColorName(toneId)
    const level = neutralValueLevel(toneId)
    const detail = [level !== undefined ? `${level}단계` : null, toneId]
      .filter(Boolean)
      .join(' · ')
    return detail ? `${name} · ${detail}` : name
  }
  const hue = MUNSELL_HUES.find((item) => item.id === hueId)
  if (!hue) return hex
  if (hue.group === 'achromatic' || toneId === ACHROMATIC_TONE_ID) {
    return `${hue.name}(${hue.code})`
  }
  const tone = toneDefById(toneId)
  if (!tone) return `${hue.name}(${hue.code})`
  return `${hue.name}(${hue.code}) · ${tone.english} (${tone.nameKo})`
}

export function hueById(id: string): MunsellHue | undefined {
  return MUNSELL_HUES.find((hue) => hue.id === id)
}

export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

export function isLightChip(hex: string): boolean {
  return relativeLuminance(hex) > 0.72
}

export type NeutralValueStep = {
  label: string
  hex: string
  grayName?: string
  /** 1 = N1.5(검정) … 10 = N9.5(하양) */
  level: number
}

/** KS 명도 단계별 회색 명칭 (UI 표기용) */
export function neutralGrayName(label: string): string | undefined {
  const value = Number.parseFloat(label.replace(/^N/, ''))
  if (Number.isNaN(value)) return undefined
  if (value === 8.5) return '옅은 회'
  if (value >= 7.0 && value <= 7.5) return '밝은 회'
  if (value >= 4.0 && value <= 6.0) return '중간 회'
  if (value === 3.5) return '짙은 회'
  if (value === 2.5) return '어두운 회'
  return undefined
}

/** 무채색 명도 10단계 (왼쪽 밝음 N9.5 → 오른쪽 어두움 N1.5, UI 참고용) */
export const NEUTRAL_VALUE_STEPS: NeutralValueStep[] = Array.from({ length: 10 }, (_, i) => {
  const value = 9.5 - (i * 8) / 9
  const snapped = Math.round(value * 2) / 2
  const label = `N${snapped.toFixed(1)}`
  const gray = Math.round(255 * ((value - 1.5) / 8))
  const hex = `#${[gray, gray, gray].map((c) => c.toString(16).padStart(2, '0')).join('')}`
  const level = 10 - i
  return { label, hex, grayName: neutralGrayName(label), level }
})

/** 무채색 명도 단계: 1 = N1.5(검정), 10 = N9.5(하양) */
export function neutralValueLevel(label: string): number | undefined {
  return NEUTRAL_VALUE_STEPS.find((step) => step.label === label)?.level
}

/** 무채색 선택 결과·라벨용 색상명 (명도 단계 회색 명칭) */
export function neutralPickColorName(toneId: string): string {
  const named = neutralGrayName(toneId)
  if (named) return named
  const level = neutralValueLevel(toneId)
  if (level === 10) return '하양'
  if (level === 1) return '검정'
  return '회'
}

/** Wh: 하양→검정(N9.5→N1.5), Bk: 검정→하양(N1.5→N9.5) */
export function neutralStepsForAnchor(anchor: AchromaticAnchor): NeutralValueStep[] {
  if (anchor === 'Bk') return [...NEUTRAL_VALUE_STEPS].reverse()
  return NEUTRAL_VALUE_STEPS
}
