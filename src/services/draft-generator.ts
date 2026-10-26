import { buildDraft, draftSignature } from '../domain/draft-template'
import type { Project } from '../types/project'

export function generateDraft(project: Project): { text: string; signature: string } {
  return {
    text: buildDraft(project),
    signature: draftSignature(project),
  }
}
