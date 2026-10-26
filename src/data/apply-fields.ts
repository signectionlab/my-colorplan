import type { ApplyFieldId, ApplyFieldPreviewId } from '../types/project'

export type ApplyFieldOption = {
  id: ApplyFieldId
  title: string
  examples: string
  description?: string
}

export const APPLY_FIELD_OPTIONS: ApplyFieldOption[] = [
  {
    id: 'space',
    title: '매장·공간',
    examples: '가게, 카페, 교실, 전시 공간',
  },
  {
    id: 'product',
    title: '상품·포장',
    examples: '제품, 상자, 라벨, 쇼핑백',
  },
  {
    id: 'online',
    title: '온라인·콘텐츠',
    examples: '웹사이트, SNS, 온라인 쇼핑몰',
  },
  {
    id: 'print',
    title: '홍보·인쇄물',
    examples: '명함, 메뉴판, 포스터, 전단',
  },
  {
    id: 'service',
    title: '서비스·교육',
    examples: '수업 자료, 프로그램 안내, 서비스 소개',
  },
  {
    id: 'other',
    title: '직접 입력·아직 미정',
    examples: '원하는 분야가 없거나 아직 정하지 못했어요.',
    description: '원하는 분야가 없거나 아직 정하지 못했어요.',
  },
]

export const APPLY_FIELD_BY_ID: Record<ApplyFieldId, ApplyFieldOption> = Object.fromEntries(
  APPLY_FIELD_OPTIONS.map((opt) => [opt.id, opt]),
) as Record<ApplyFieldId, ApplyFieldOption>

/** STEP 5 무드보드 탭 (참고 PNG 있는 5분야) */
export const APPLY_PREVIEW_TABS: { id: ApplyFieldPreviewId; label: string }[] = [
  { id: 'space', label: '매장·공간' },
  { id: 'product', label: '상품·포장' },
  { id: 'online', label: '온라인' },
  { id: 'print', label: '홍보·인쇄' },
  { id: 'service', label: '서비스·교육' },
]

export const APPLY_FIELD_PREVIEW_FALLBACK: ApplyFieldPreviewId = 'space'

export const MOODBOARD_FIELD_LEDE: Record<ApplyFieldPreviewId, string> = {
  space: '공간의 벽·바닥·포인트에 색이 어떻게 느껴질지 상상해 보세요.',
  product: '상품과 포장에서 주조·강조가 어디에 쓰일지 보세요.',
  online: '온라인에서 배경·강조 띠·버튼색 인상을 확인하세요.',
  print: '인쇄물에서 글자·강조 가격/제목색을 확인하세요.',
  service: '교육·서비스 안내에서 제목·본문·포인트 역할을 보세요.',
}

export function defaultPreviewForApplyField(applyFieldId: ApplyFieldId | null): ApplyFieldPreviewId {
  if (!applyFieldId || applyFieldId === 'other') return APPLY_FIELD_PREVIEW_FALLBACK
  return applyFieldId
}

const SVG = 'stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"'

export function applyFieldIconMarkup(id: ApplyFieldId): string {
  switch (id) {
    case 'space':
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path ${SVG} d="M4 12 14 5l10 7v11H4V12Z"/><path ${SVG} d="M11 23v-6h6v6"/></svg>`
    case 'product':
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path ${SVG} d="M6 9 14 5l8 4v10l-8 4-8-4V9Z"/><path ${SVG} d="M14 13v10M6 9l8 4 8-4"/></svg>`
    case 'online':
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect ${SVG} x="3" y="6" width="22" height="16" rx="2"/><path ${SVG} d="M3 10h22"/></svg>`
    case 'print':
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect ${SVG} x="6" y="4" width="16" height="20" rx="1"/><path ${SVG} d="M9 9h10M9 13h7"/></svg>`
    case 'service':
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path ${SVG} d="M6 6h16v16H6z"/><path ${SVG} d="M9 10h10M9 14h8M9 18h6"/></svg>`
    default:
      return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle ${SVG} cx="14" cy="14" r="9"/><path ${SVG} d="M14 10v4M14 18h.01"/></svg>`
  }
}
