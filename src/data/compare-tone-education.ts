/**
 * STEP 2 활동 2 — 비교 톤 교육용 참고 표현 (color-data.md §3·§4 톤 분류 참고, educational-proposal)
 */

/** 톤별 1~2개 짧은 이미지 참고 표현 (심리 효과 단정 아님) */
export const COMPARE_TONE_IMAGE_HINTS: Record<string, readonly [string, string]> = {
  v: ['또렷한', '강렬한'],
  s: ['또렷한', '강렬한'],
  p: ['부드러운', '가벼운'],
  lt: ['경쾌한', '산뜻한'],
  w: ['부드러운', '가벼운'],
  ltg: ['산뜻한', '가벼운'],
  dp: ['깊이 있는', '무게감 있는'],
  dk: ['깊이 있는', '무게감 있는'],
  dkg: ['깊이 있는', '무게감 있는'],
  d: ['차분한', '절제된'],
  sf: ['차분한', '절제된'],
  g: ['차분한', '절제된'],
}

export const NEUTRAL_COMPARE_STEP_HINTS = {
  bright: ['밝은', '가벼운'] as const,
  mid: ['차분한', '중립적인'] as const,
  dark: ['묵직한', '깊은'] as const,
}
