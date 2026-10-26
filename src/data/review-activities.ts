import type {
  Project,
  ReviewBrandImageFeel,
  ReviewPrimaryRoleQuiz,
  ReviewUsageReasonChoice,
} from '../types/project'
import { paletteBarSegmentsForDisplay } from '../domain/palette-preview-context'

export type { ReviewBrandImageFeel, ReviewPrimaryRoleQuiz, ReviewUsageReasonChoice }

export const REVIEW_BRAND_IMAGE_FEEL_OPTIONS: { id: ReviewBrandImageFeel; label: string }[] = [
  { id: 'well', label: '잘 느껴져요' },
  { id: 'partial', label: '일부만 느껴져요' },
  { id: 'different', label: '다른 느낌이에요' },
]

export const REVIEW_BRAND_IMAGE_FEEL_LABEL: Record<ReviewBrandImageFeel, string> = {
  well: '잘 느껴져요',
  partial: '일부만 느껴져요',
  different: '다른 느낌이에요',
}

export const REVIEW_PRIMARY_ROLE_QUIZ_OPTIONS: { id: ReviewPrimaryRoleQuiz; label: string }[] = [
  { id: 'background_mood', label: '넓은 면적·배경으로 전체 분위기를 잡는다' },
  { id: 'accent_point', label: '작은 포인트·버튼처럼 시선을 끈다' },
  { id: 'structure', label: '글자·정보를 구분하는 선·테두리 역할을 한다' },
]

export const REVIEW_USAGE_REASON_OPTIONS: { id: ReviewUsageReasonChoice; label: string }[] = [
  { id: 'brand_image', label: '처음 생각한 브랜드 이미지와 맞아서' },
  { id: 'readability', label: '정보가 잘 보이게 하려고' },
  { id: 'balance', label: '색 비율·균형을 지키려고' },
  { id: 'stand_out', label: '중요한 부분을 돋보이게 하려고' },
  { id: 'custom', label: '직접 입력' },
]

export const REVIEW_USAGE_PLACE_OPTIONS = [
  '매장 배경',
  '상품 포장',
  '메뉴판',
  '로고',
  '버튼',
  '중요 정보',
  '간판·사인',
  '웹 배경',
  'SNS 콘텐츠',
] as const

export type ReviewPaletteRow = {
  id: string
  name: string
  hex: string
  roleLabel: string
  widthPct: number
}

export function reviewPaletteRows(brand: Project['brand'], palette: Project['palette']): ReviewPaletteRow[] {
  return paletteBarSegmentsForDisplay(brand, palette).map((seg, i) => ({
    id: i < 2 ? `palette-${i}` : `accent-${i - 2}`,
    name: seg.name,
    hex: seg.hex,
    roleLabel: seg.roleLabel,
    widthPct: seg.widthPct,
  }))
}

export function formatUsagePlaces(places: readonly string[]): string {
  return places.filter(Boolean).join(', ')
}

export function parseUsagePlaces(usage: string): string[] {
  if (!usage.trim()) return []
  return usage
    .split(/[,、·/]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function primaryRoleQuizFeedback(
  choice: ReviewPrimaryRoleQuiz,
  primaryName: string,
  primaryHex: string,
  primaryPct: number,
  roleLabelText: string,
): string {
  const head = `주조색 ${primaryName}(${primaryHex})은 비율 ${primaryPct}%로 ${roleLabelText} 역할입니다.`
  if (choice === 'background_mood') {
    return `${head} 넓은 면·배경에 쓰일 때 브랜드의 첫인상과 분위기를 만드는 경우가 많아요.`
  }
  if (choice === 'accent_point') {
    return `${head} 포인트·버튼처럼 작은 영역에 쓰는 색은 보통 강조색에 가깝습니다. 지금 비율과 역할을 한 번 더 확인해 보세요.`
  }
  return `${head} 선·테두리·구분선 역할은 보조색이나 강조색에 맞는 경우도 있어요. 4단계에서 역할과 비율을 조정할 수 있습니다.`
}

export function reviewUsageReasonLabel(
  choice: ReviewUsageReasonChoice | null,
  custom: string,
): string {
  if (!choice) return ''
  if (choice === 'custom') return custom.trim()
  return REVIEW_USAGE_REASON_OPTIONS.find((o) => o.id === choice)?.label ?? ''
}
