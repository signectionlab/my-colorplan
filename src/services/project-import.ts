import { validateProjectFile } from '../domain/project-validation'
import type { Project } from '../types/project'

export function parseProjectFile(text: string): { project: Project } | { error: string } {
  try {
    const result = validateProjectFile(JSON.parse(text))
    return result.ok ? { project: result.project } : { error: result.error }
  } catch {
    return { error: 'JSON을 읽을 수 없습니다. 현재 작업은 그대로 두었습니다.' }
  }
}
