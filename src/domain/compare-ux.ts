import type { BrandImagePick, CompareSnapshot } from '../types/project'
import { contrastRatio } from './contrast'

/** 첫 진입·「예시로 초기화」용 (교육용 시작 조합, 브랜드 팔레트와 별도) */
export const COMPARE_START_EXAMPLE: CompareSnapshot = {
  background: '#f6f9fc',
  text: '#0d253d',
  shape: '#533afd',
}

export const COMPARE_PRESETS: { label: string; snapshot: CompareSnapshot }[] = [
  { label: '밝은 바탕', snapshot: { background: '#f6f9fc', text: '#0d253d', shape: '#533afd' } },
  { label: '어두운 바탕', snapshot: { background: '#0d253d', text: '#ffffff', shape: '#f4781f' } },
  { label: '크림 바탕', snapshot: { background: '#fff8e7', text: '#5d4037', shape: '#689f38' } },
]

export const COMPARE_SURROUND_BG_DEFAULT = {
  a: '#f6f9fc',
  b: '#0d253d',
} as const

/** STEP 3 가독성 실습 — 웹 본문에 흔한 기본 글자색(브랜드색 대신 선택용) */
export const COMPARE_DEFAULT_WEB_TEXT = '#333333'

export const COMPARE_DEFAULT_WEB_TEXT_OPTIONS = [
  { hex: '#333333' as const, label: '기본' },
  { hex: '#ffffff' as const, label: '기본' },
]

export type ContrastHint = {
  ratioText: string
  summary: string
  detail: string
}

/** WCAG 2.x 대비 비율 — 참고 설명 (본문 크기·AA/AAA 전체를 대표하지 않음) */
export function contrastHint(text: string, background: string): ContrastHint {
  const ratio = contrastRatio(text, background)
  if (ratio === null) {
    return {
      ratioText: '—',
      summary: '색 코드를 확인해 주세요.',
      detail: '배경과 글자색이 모두 올바른 HEX일 때 대비 비율을 계산합니다.',
    }
  }
  const r = ratio.toFixed(2)
  let summary: string
  if (ratio >= 7) summary = '글자와 배경이 꽤 또렷하게 구분되는 편이에요.'
  else if (ratio >= 4.5) summary = '일반 본문 크기 기준으로 읽기에 무리 없을 수 있는 수준이에요. (WCAG AA 참고)'
  else if (ratio >= 3) summary = '큰 글자에서는 괜찮을 수 있지만, 작은 본문은 더 어려울 수 있어요.'
  else summary = '글자가 배경과 잘 구분되지 않을 수 있어요. 색을 바꿔 보며 확인해 보세요.'

  return {
    ratioText: r,
    summary,
    detail:
      '대비 비율은 글자색과 배경색만으로 계산한 참고값입니다. 브랜드에 맞는지·전체 접근성을 보장하지 않으며, 수치가 높다고 더 좋은 디자인이라는 뜻은 아닙니다.',
  }
}

export function effectiveCompareBaseline(saved: CompareSnapshot | null): CompareSnapshot {
  return saved ?? COMPARE_START_EXAMPLE
}

/** 활동 1 나란히 비교 — 오른쪽 칸 제목 (JSON `baseline` 유무) */
export function baselineLabel(saved: CompareSnapshot | null): string {
  return saved ? '비교 기준' : '시작 제안'
}

/** 활동 1 — 미리보기 vs 비교 기준 안내 (버튼 역할 설명) */
export function compareAct1BaselineHelp(hasSavedBaseline: boolean): string {
  if (hasSavedBaseline) {
    return '칩으로 바꾸는 지금 미리보기와, 비교 기준으로 남기기로 고정한 비교 기준을 나란히 봅니다. «비교 기준 → 미리보기에 적용»은 위 큰 미리보기·칩만 바꿉니다.'
  }
  return '칩으로 바꾸는 지금 미리보기와 시작 제안(1단계에서 고른 색의 첫 조합, pick 없으면 데모)을 나란히 봅니다. 마음에 드는 조합은 비교 기준으로 남기기로 오른쪽 기준을 바꿀 수 있어요.'
}

/** 배경 위에서 대비가 더 나은 검정·흰 글자색 */
export function readableTextOnBackground(background: string): '#000000' | '#ffffff' {
  const onBlack = contrastRatio('#000000', background)
  const onWhite = contrastRatio('#ffffff', background)
  if (onBlack === null || onWhite === null) return '#000000'
  return onWhite >= onBlack ? '#ffffff' : '#000000'
}

export function compareMatchesStartExample(snapshot: CompareSnapshot): boolean {
  const norm = (h: string) => h.trim().toLowerCase()
  return (
    norm(snapshot.background) === norm(COMPARE_START_EXAMPLE.background) &&
    norm(snapshot.text) === norm(COMPARE_START_EXAMPLE.text) &&
    norm(snapshot.shape) === norm(COMPARE_START_EXAMPLE.shape)
  )
}

/** STEP 1 pick 기준 활동 1·2 초기 조합(저장 스키마는 기존 compare 필드) */
export function brandCompareSeedFromPicks(picks: BrandImagePick[]): {
  background: string
  text: string
  shape: string
  surroundShape: string
  surroundBgA: string
  surroundBgB: string
} | null {
  if (!picks.length) return null
  const background = picks[0].hex
  const text = COMPARE_DEFAULT_WEB_TEXT
  const shape = picks[1]?.hex ?? picks[0].hex
  const surroundShape = picks[0].hex
  const surroundBgA = COMPARE_SURROUND_BG_DEFAULT.a
  const surroundBgB = picks[1]?.hex ?? COMPARE_SURROUND_BG_DEFAULT.b
  return { background, text, shape, surroundShape, surroundBgA, surroundBgB }
}
