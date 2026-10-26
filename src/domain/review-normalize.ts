import {
  parseUsagePlaces,
  REVIEW_BRAND_IMAGE_FEEL_LABEL,
  reviewPaletteRows,
} from '../data/review-activities'
import type { Project, ReviewBrandImageFeel } from '../types/project'

function parseFeel(raw: unknown, imageFit: string): ReviewBrandImageFeel | null {
  if (raw === 'well' || raw === 'partial' || raw === 'different') return raw
  if (imageFit.includes('비율') || imageFit.includes('다른')) return 'different'
  if (imageFit.includes('일부')) return 'partial'
  if (imageFit.includes('비슷') || imageFit.includes('잘 느껴')) return 'well'
  return null
}

export function mergeReviewFromRaw(
  raw: Record<string, unknown> | undefined,
  base: Project['review'],
  brand: Project['brand'],
  palette: Project['palette'],
): Project['review'] {
  const imageFit = typeof raw?.imageFit === 'string' ? raw.imageFit : base.imageFit
  const brandImageFeel = parseFeel(raw?.brandImageFeel, imageFit)

  let usageSelections: Record<string, string[]> =
    raw?.usageSelections && typeof raw.usageSelections === 'object' && !Array.isArray(raw.usageSelections)
      ? { ...(raw.usageSelections as Record<string, string[]>) }
      : { ...base.usageSelections }

  if (Object.keys(usageSelections).length === 0) {
    for (const row of reviewPaletteRows(brand, palette)) {
      const idx = row.id.startsWith('palette-') ? Number(row.id.split('-')[1]) : 2
      const fromPalette = palette.colors[idx]?.usage ?? ''
      usageSelections[row.id] = parseUsagePlaces(fromPalette)
    }
  }

  const primaryRoleQuiz =
    raw?.primaryRoleQuiz === 'background_mood' ||
    raw?.primaryRoleQuiz === 'accent_point' ||
    raw?.primaryRoleQuiz === 'structure'
      ? raw.primaryRoleQuiz
      : base.primaryRoleQuiz

  const keyColorRowId = typeof raw?.keyColorRowId === 'string' ? raw.keyColorRowId : base.keyColorRowId

  const usageReasonChoice =
    raw?.usageReasonChoice === 'brand_image' ||
    raw?.usageReasonChoice === 'readability' ||
    raw?.usageReasonChoice === 'balance' ||
    raw?.usageReasonChoice === 'stand_out' ||
    raw?.usageReasonChoice === 'custom'
      ? raw.usageReasonChoice
      : base.usageReasonChoice

  return {
    imageFit: brandImageFeel ? REVIEW_BRAND_IMAGE_FEEL_LABEL[brandImageFeel] : imageFit,
    brandImageFeel: brandImageFeel ?? base.brandImageFeel,
    keyColorRowId,
    primaryRoleQuiz,
    usageSelections,
    usageReasonChoice,
    usageReasonCustom: typeof raw?.usageReasonCustom === 'string' ? raw.usageReasonCustom : base.usageReasonCustom,
    contrastNote: typeof raw?.contrastNote === 'string' ? raw.contrastNote : base.contrastNote,
    ratioNote: typeof raw?.ratioNote === 'string' ? raw.ratioNote : base.ratioNote,
    changeNote: typeof raw?.changeNote === 'string' ? raw.changeNote : base.changeNote,
  }
}

export function buildMissingUsageSelections(
  brand: Project['brand'],
  palette: Project['palette'],
  current: Record<string, string[]>,
): Record<string, string[]> | null {
  const rows = reviewPaletteRows(brand, palette)
  const next = { ...current }
  let changed = false
  for (const row of rows) {
    if (next[row.id] !== undefined) continue
    const idx = row.id.startsWith('palette-') ? Number(row.id.split('-')[1]) : 2
    const fromPalette = palette.colors[idx]?.usage ?? ''
    next[row.id] = parseUsagePlaces(fromPalette)
    changed = true
  }
  return changed ? next : null
}

export function syncPaletteUsageFromReview(project: Project): void {
  const rows = reviewPaletteRows(project.brand, project.palette)
  const sel = project.review.usageSelections
  const accentParts: string[] = []

  for (const row of rows) {
    const places = sel[row.id] ?? []
    const text = places.join(', ')
    if (row.id.startsWith('palette-')) {
      const idx = Number(row.id.split('-')[1])
      if (project.palette.colors[idx]) {
        project.palette.colors[idx].usage = text
      }
    } else {
      const label = row.name || `강조 ${row.id.split('-')[1]}`
      accentParts.push(text ? `${label}: ${text}` : '')
    }
  }

  const accentUsage = accentParts.filter(Boolean).join(' · ')
  if (accentUsage || rows.some((r) => r.id.startsWith('accent-'))) {
    project.palette.colors[2].usage = accentUsage
  }
}
