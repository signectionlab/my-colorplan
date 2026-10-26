import type { ApplyFieldId } from '../types/project'

/** STEP 5 통합 목업 — 1단계 활용 분야와 무관하게 동일 SVG */
export const MOKUP_ALL_SVG_URL = '/images/mood-mokup/mokup-all.svg?v=6'

export function moodMokupSvgUrlForField(_applyFieldId: ApplyFieldId | null): string {
  return MOKUP_ALL_SVG_URL
}

const svgCache = new Map<string, Promise<string>>()

export function fetchMoodMokupSvg(url: string): Promise<string> {
  let pending = svgCache.get(url)
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`mokup fetch ${url}: ${res.status}`)
        return res.text()
      })
      .catch((err) => {
        svgCache.delete(url)
        throw err
      })
    svgCache.set(url, pending)
  }
  return pending
}

/** STEP 5 학습 점검 — `review.imageFit`에 저장 */
export const MOODBOARD_BRAND_IMAGE_FIT_OPTIONS = [
  '생각한 이미지와 비슷해요.',
  '일부 색의 사용 방법을 바꾸고 싶어요.',
  '색상이나 비율을 다시 조절하고 싶어요.',
] as const

export type MoodboardBrandImageFitOption = (typeof MOODBOARD_BRAND_IMAGE_FIT_OPTIONS)[number]

export const MOODBOARD_ADJUST_PALETTE_OPTION: MoodboardBrandImageFitOption =
  '색상이나 비율을 다시 조절하고 싶어요.'
