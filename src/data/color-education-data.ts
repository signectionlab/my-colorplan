/**
 * 색채교육 정적 콘텐츠 — `기획문서/color-data.md` v0.2 §3
 * MUNSELL_HUES / KS_BASIC_TONE_DEFS 는 중복 정의하지 않는다.
 */

import { NEUTRAL_HUE_ID, neutralValueLevel } from './munsell-brand-image'

export const IMAGE_ADJECTIVE_UI_NOTE =
  '이 색에서 떠올릴 수 있는 느낌이에요. 사람마다 다르게 느낄 수 있어요.'

/** UI에 노출하는 보조 이미지 형용사 상한 */
export const IMAGE_ADJECTIVE_SECONDARY_DISPLAY_MAX = 10

export const EDUCATION_TONE_COLOR_NAME_NOTE =
  '아래는 톤과 기본색명을 이어 붙인 교육용 예시입니다. KS A 0011 공식 계통색명으로 검증된 표현이 아닙니다.'

/** 앱 hueId 키 (자주 = PR, 문서 RP와 별개) */
export const CHROMATIC_IMAGE_ADJECTIVES: Record<
  string,
  { primary: string; secondary: readonly [string, string, string, string] }
> = {
  R: { primary: '열정적인', secondary: ['강렬한', '역동적인', '대담한', '따뜻한'] },
  YR: { primary: '활기찬', secondary: ['친근한', '명랑한', '따뜻한', '생동감 있는'] },
  Y: { primary: '경쾌한', secondary: ['밝은', '즐거운', '희망적인', '명랑한'] },
  GY: { primary: '싱그러운', secondary: ['산뜻한', '풋풋한', '가벼운', '생기 있는'] },
  G: { primary: '자연스러운', secondary: ['편안한', '안정적인', '차분한', '건강한'] },
  BG: { primary: '청량한', secondary: ['맑은', '시원한', '신선한', '세련된'] },
  B: { primary: '시원한', secondary: ['차분한', '신뢰감 있는', '청명한', '이성적인'] },
  PB: { primary: '진중한', secondary: ['깊이 있는', '차분한', '지적인', '격식 있는'] },
  P: { primary: '신비로운', secondary: ['우아한', '독창적인', '감각적인', '환상적인'] },
  PR: { primary: '화려한', secondary: ['개성 있는', '성숙한', '우아한', '감성적인'] },
}

const ACHROMATIC_IMAGE_ADJECTIVES = {
  Wh: { primary: '깨끗한', secondary: ['순수한', '단정한', '가벼운', '간결한'] as const },
  Gy: { primary: '차분한', secondary: ['중립적인', '절제된', '도시적인', '안정적인'] as const },
  Bk: { primary: '강렬한', secondary: ['고급스러운', '묵직한', '단정한', '엄숙한'] as const },
} as const

export type ImageAdjectiveSet = {
  primary: string
  secondary: readonly string[]
}

function achromaticBucket(hueId: string, toneId: string): keyof typeof ACHROMATIC_IMAGE_ADJECTIVES | null {
  if (hueId === 'Wh' || hueId === 'Gy' || hueId === 'Bk') return hueId
  if (hueId !== NEUTRAL_HUE_ID) return null
  const level = neutralValueLevel(toneId)
  if (level === undefined) return 'Gy'
  if (level >= 9) return 'Wh'
  if (level <= 2) return 'Bk'
  return 'Gy'
}

/** STEP 2 활동 1 — 이미지 형용사 (연상 예시, educational-proposal) */
function withSecondaryDisplayCap(set: ImageAdjectiveSet): ImageAdjectiveSet {
  return {
    primary: set.primary,
    secondary: set.secondary.slice(0, IMAGE_ADJECTIVE_SECONDARY_DISPLAY_MAX),
  }
}

export function imageAdjectivesForPick(hueId: string, toneId: string): ImageAdjectiveSet | null {
  const ach = achromaticBucket(hueId, toneId)
  if (ach) return withSecondaryDisplayCap(ACHROMATIC_IMAGE_ADJECTIVES[ach])
  const row = CHROMATIC_IMAGE_ADJECTIVES[hueId]
  if (!row) return null
  return withSecondaryDisplayCap({ primary: row.primary, secondary: row.secondary })
}
