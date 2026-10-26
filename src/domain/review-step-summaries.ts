import { COMPARE_READABILITY_OPTIONS, LEARN_FIT_CHOICE_LABELS, type Project } from '../types/project'
import { brandImagePickKey } from './brand-image'
import { planAccentPreviewItems } from './palette-preview-context'
import { roleForSlotRatio } from './role-assignment'

export function reviewImageFitHint(project: Project): string {
  const records = project.learn.brandPickRecords
  const picks = project.brand.imagePicks
  const lines: string[] = []
  if (project.brand.keywords.length) {
    lines.push(`1단계 이미지: ${project.brand.keywords.slice(0, 4).join(' · ')}`)
  }
  for (const pick of picks.slice(0, 2)) {
    const key = brandImagePickKey(pick)
    const rec = records[key]
    if (rec?.fitChoice) {
      lines.push(`${LEARN_FIT_CHOICE_LABELS[rec.fitChoice]}`)
      break
    }
  }
  return lines.join(' · ') || '1~2단계에서 고른 색·이미지 키워드를 참고해 보세요.'
}

export function reviewContrastHint(project: Project): string {
  const parts: string[] = []
  const choice = project.compare.readabilityChoice
  if (choice) {
    parts.push(COMPARE_READABILITY_OPTIONS.find((o) => o.id === choice)?.label ?? choice)
  }
  if (project.compare.observation.trim()) {
    const t = project.compare.observation.trim()
    parts.push(t.length > 48 ? `${t.slice(0, 48)}…` : t)
  }
  return parts.join(' · ') || '3단계 색 비교에서 관찰한 내용을 떠올려 보세요.'
}

export function reviewRatioHint(project: Project): string {
  const { palette, brand } = project
  const parts = palette.ratios.map((r, i) => `${palette.colors[i].name} ${r}%(${roleForSlotRatio(r)})`)
  const accents = planAccentPreviewItems(brand, palette)
  if (accents.length) {
    accents.forEach((a) => parts.push(`${a.label} ${a.barPct}%(${roleForSlotRatio(a.barPct)})`))
  }
  if (palette.roleNote.trim()) {
    return `${parts.join(' · ')} — ${palette.roleNote.trim()}`
  }
  return parts.join(' · ')
}

export function reviewChangeHint(project: Project): string {
  if (project.palette.baseline) {
    return '4단계에서 저장한 기준안과 아래 현재 막대를 비교해 보세요.'
  }
  const obs = project.compare.observationDetail.trim() || project.compare.observation.trim()
  if (obs) return obs.length > 56 ? `${obs.slice(0, 56)}…` : obs
  return '4단계에서 「이 조합을 기준안으로 저장」하면 여기서 전후 비교할 수 있어요.'
}
