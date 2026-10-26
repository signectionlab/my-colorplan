import type { Project } from '../types/project'
import { validateProjectFile } from '../domain/project-validation'

const KEY = 'my-brand-color-canvas:v2'

export function loadStoredProject(): Project | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const result = validateProjectFile(JSON.parse(raw))
    return result.ok ? result.project : null
  } catch {
    return null
  }
}

export function hasStoredProject(): boolean {
  return localStorage.getItem(KEY) !== null
}

export function saveStoredProject(project: Project): void {
  localStorage.setItem(KEY, JSON.stringify(project))
}

export function clearStoredProject(): void {
  localStorage.removeItem(KEY)
}
