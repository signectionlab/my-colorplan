import type { Project } from '../types/project'
import { buildDraft } from '../domain/draft-template'

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadProjectJson(project: Project) {
  download(JSON.stringify(project, null, 2), 'color-plan.json', 'application/json')
}

export function downloadPlanMarkdown(project: Project) {
  download(buildDraft(project), 'brand-color-plan.md', 'text/markdown;charset=utf-8')
}

export async function copyPlan(project: Project): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildDraft(project))
    return true
  } catch {
    return false
  }
}
