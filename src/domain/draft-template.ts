import type { Project } from '../types/project'
import { formatPlanMarkdown } from './plan-document'

export function buildDraft(project: Project): string {
  return formatPlanMarkdown(project)
}

export function draftSignature(project: Project): string {
  return JSON.stringify({
    brand: project.brand,
    learn: {
      focusPickKey: project.learn.focusPickKey,
      brandPickRecords: project.learn.brandPickRecords,
      interestIds: project.learn.interestIds,
      reasons: project.learn.reasons,
    },
    compare: {
      readabilityChoice: project.compare.readabilityChoice,
      surroundChoice: project.compare.surroundChoice,
      brandExperimentChoice: project.compare.brandExperimentChoice,
    },
    paletteCombo: {
      choice: project.palette.comboReasonChoice,
      reason: project.palette.comboReason,
    },
    palette: {
      colors: project.palette.colors,
      ratios: project.palette.ratios,
      roles: project.palette.roles,
      accentPartRatios: project.palette.accentPartRatios,
    },
    review: project.review,
    observation: project.compare.observation,
  })
}
