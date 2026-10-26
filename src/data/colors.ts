import type { ColorEntry } from '../types/content'

export const COLOR_ENTRIES: ColorEntry[] = [
  { id: 'g-red', name: '빨강', hex: '#e53935', tab: 'general', blurb: '주목과 에너지가 느껴지는 일반색명입니다.', provisional: true },
  { id: 'g-orange', name: '주황', hex: '#f4781f', tab: 'general', blurb: '따뜻하고 친근하게 느껴질 수 있는 일반색명입니다.', provisional: true },
  { id: 'g-yellow', name: '노랑', hex: '#fdd835', tab: 'general', blurb: '밝고 경쾌한 인상의 일반색명입니다.', provisional: true },
  { id: 'g-green', name: '초록', hex: '#43a047', tab: 'general', blurb: '자연과 안정이 떠오를 수 있는 일반색명입니다.', provisional: true },
  { id: 'g-blue', name: '파랑', hex: '#1e88e5', tab: 'general', blurb: '시원하고 신뢰가 떠오를 수 있는 일반색명입니다.', provisional: true },
  { id: 'g-navy', name: '남색', hex: '#1b3a6b', tab: 'general', blurb: '차분하고 무게가 있는 일반색명입니다.', provisional: true },
  { id: 'g-purple', name: '보라', hex: '#8e24aa', tab: 'general', blurb: '개성이 느껴질 수 있는 일반색명입니다.', provisional: true },
  { id: 'g-pink', name: '분홍', hex: '#ec407a', tab: 'general', blurb: '부드럽고 다정하게 느껴질 수 있습니다.', provisional: true },
  { id: 'g-pink-light', name: '연분홍', hex: '#f8bbd0', tab: 'general', blurb: '같은 분홍이라도 더 가볍고 여린 느낌입니다.', provisional: true },
  { id: 'g-brown', name: '갈색', hex: '#795548', tab: 'general', blurb: '따뜻하고 편안한 흙빛입니다.', provisional: true },
  { id: 'g-gray', name: '회색', hex: '#9e9e9e', tab: 'general', blurb: '중립적이고 정돈된 느낌입니다.', provisional: true },
  { id: 'g-white', name: '하양', hex: '#f4f4f2', tab: 'general', blurb: '여백과 깨끗한 바탕에 자주 쓰입니다.', provisional: true },
  { id: 'g-black', name: '검정', hex: '#212121', tab: 'general', blurb: '대비와 무게를 만드는 어두운 색입니다.', provisional: true },
  { id: 'g-cream', name: '크림', hex: '#fff8e7', tab: 'general', blurb: '부드러운 밝은 바탕색입니다.', provisional: true },
  { id: 'g-teal', name: '청록', hex: '#00897b', tab: 'general', blurb: '차분하면서도 또렷한 포인트가 될 수 있습니다.', provisional: true },
  { id: 'a-coral', name: '코랄', hex: '#ff7043', tab: 'adjective', blurb: '따뜻하고 생기 있는 형용색명 예시입니다.', provisional: true },
  { id: 'a-mint', name: '민트', hex: '#80cbc4', tab: 'adjective', blurb: '가볍고 상쾌한 형용색명 예시입니다.', provisional: true },
  { id: 'a-ivory', name: '아이보리', hex: '#fffff0', tab: 'adjective', blurb: '부드러운 밝은 형용색명 예시입니다.', provisional: true },
  { id: 'a-charcoal', name: '차콜', hex: '#37474f', tab: 'adjective', blurb: '검정보다 부드러운 어두운 형용색명 예시입니다.', provisional: true },
  { id: 'e-calm', name: '차분함', hex: '#5c6bc0', tab: 'emotion', blurb: '안정과 집중을 떠올릴 수 있는 감성 형용사입니다.', provisional: true },
  { id: 'e-joy', name: '즐거움', hex: '#ffb300', tab: 'emotion', blurb: '밝고 활기찬 감성 형용사입니다.', provisional: true },
  { id: 'e-trust', name: '신뢰', hex: '#1565c0', tab: 'emotion', blurb: '믿음과 전문성이 떠오를 수 있습니다.', provisional: true },
  { id: 'e-warm', name: '따뜻함', hex: '#d84315', tab: 'emotion', blurb: '정겹고 포근한 감성 형용사입니다.', provisional: true },
  { id: 'k-handmade', name: '수제', hex: '#a1887f', tab: 'keyword', blurb: '손맛과 정성을 떠올리는 브랜드 키워드 예시입니다.', provisional: true },
  { id: 'k-modern', name: '모던', hex: '#455a64', tab: 'keyword', blurb: '단정하고 현대적인 브랜드 키워드 예시입니다.', provisional: true },
  { id: 'k-natural', name: '자연', hex: '#689f38', tab: 'keyword', blurb: '자연과 건강을 떠올리는 브랜드 키워드 예시입니다.', provisional: true },
  { id: 'k-luxury', name: '고급', hex: '#4a148c', tab: 'keyword', blurb: '무게감 있는 브랜드 키워드 예시입니다.', provisional: true },
]

export const COLOR_TABS = [
  { id: 'general', label: '일반색명' },
  { id: 'adjective', label: '형용색명' },
  { id: 'emotion', label: '감성 형용사' },
  { id: 'keyword', label: '브랜드 키워드' },
] as const

export function colorsForTab(tab: ColorEntry['tab']): ColorEntry[] {
  return COLOR_ENTRIES.filter((entry) => entry.tab === tab)
}

export function colorById(id: string): ColorEntry | undefined {
  return COLOR_ENTRIES.find((entry) => entry.id === id)
}

export const START_EXAMPLE = {
  name: '온기 베이커리',
  keywords: ['따뜻함', '수제'],
  colors: [
    { name: '크림', hex: '#fff8e7' },
    { name: '초코', hex: '#5d4037' },
    { name: '살구', hex: '#ffab91' },
  ],
  ratios: [60, 30, 10] as [number, number, number],
}
