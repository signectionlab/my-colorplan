import type { Project } from '../types/project'
import { PROJECT_KIND } from '../types/project'
import { validateProjectFile } from '../domain/project-validation'

const KEY = `${PROJECT_KIND}:v2`
const LEGACY_KEY = 'my-brand-color-canvas:v2'

function readStoredRaw(): string | null {
  return localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
}

export function loadStoredProject(): Project | null {
  try {
    const raw = readStoredRaw()
    if (!raw) return null
    const result = validateProjectFile(JSON.parse(raw))
    if (!result.ok) return null
    if (!localStorage.getItem(KEY) && localStorage.getItem(LEGACY_KEY)) {
      saveStoredProject(result.project)
      localStorage.removeItem(LEGACY_KEY)
    }
    return result.project
  } catch {
    return null
  }
}

export function hasStoredProject(): boolean {
  return readStoredRaw() !== null
}

export function saveStoredProject(project: Project): void {
  localStorage.setItem(KEY, JSON.stringify(project))
  localStorage.removeItem(LEGACY_KEY)
}

export function clearStoredProject(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem(LEGACY_KEY)
}
