import type { Project } from '../types/project'
import { roleLabel } from './role-assignment'

export function buildDraft(project: Project): string {
  const { brand, palette, review, compare } = project
  const lines: string[] = []
  lines.push(`# ${brand.name.trim() || '브랜드'} 브랜드 컬러 계획 초안`)
  lines.push('')
  lines.push('## 브랜드')
  lines.push(`- 이름: ${brand.name.trim() || '(미입력)'}`)
  const apply = brand.applyFieldId
    ? brand.applyFieldId === 'other' && !brand.applyFieldCustom.trim()
      ? '아직 정하지 않음'
      : brand.field.trim()
    : brand.field.trim()
  if (apply) lines.push(`- 색 활용 분야: ${apply}`)
  if (brand.intro.trim()) lines.push(`- 소개: ${brand.intro.trim()}`)
  if (brand.keywords.length) lines.push(`- 이미지 키워드: ${brand.keywords.join(', ')}`)
  if (brand.keywordReason.trim()) lines.push(`- 키워드 이유: ${brand.keywordReason.trim()}`)
  lines.push('')
  lines.push('## 팔레트 (3색 · 비율 · 역할)')
  palette.colors.forEach((color, i) => {
    const ratio = palette.ratios[i]
    const role = roleLabel(palette.roles[i], ratio)
    lines.push(
      `- ${color.name || '색'} (${color.hex}) — ${ratio}% · ${role}${color.reason.trim() ? ` · 이유: ${color.reason.trim()}` : ''}${color.usage.trim() ? ` · 활용: ${color.usage.trim()}` : ''}`,
    )
  })
  if (palette.roleNote.trim()) lines.push(`- 역할 메모: ${palette.roleNote.trim()}`)
  lines.push('')
  lines.push('## 대비 실습 메모')
  lines.push(`- 배경 ${compare.background} / 글자 ${compare.text} / 도형 ${compare.shape}`)
  if (compare.observation.trim()) lines.push(`- 관찰: ${compare.observation.trim()}`)
  lines.push('')
  lines.push('## 적용 점검')
  if (review.imageFit.trim()) lines.push(`- 이미지와 어울림: ${review.imageFit.trim()}`)
  if (review.contrastNote.trim()) lines.push(`- 대비/가독성: ${review.contrastNote.trim()}`)
  if (review.ratioNote.trim()) lines.push(`- 비율/역할: ${review.ratioNote.trim()}`)
  lines.push('')
  lines.push('---')
  lines.push('이 문서는 「마이 브랜드 컬러 캔버스」 실습 결과를 바탕으로 한 초안입니다.')
  return lines.join('\n')
}

export function draftSignature(project: Project): string {
  return JSON.stringify({
    brand: project.brand,
    palette: project.palette,
    review: project.review,
    compareObservation: project.compare.observation,
  })
}
