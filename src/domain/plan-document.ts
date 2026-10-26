import { REVIEW_BRAND_IMAGE_FEEL_LABEL, reviewPaletteRows, reviewUsageReasonLabel } from '../data/review-activities'
import { imagePickFacts } from '../data/munsell-brand-image'
import {
  LEARN_FIT_CHOICE_LABELS,
  PLAN_SECTION_IDS,
  STEPS,
  type PlanDecision,
  type PlanSectionId,
  type Project,
  type StepId,
} from '../types/project'
import { applyFieldDisplayText } from './apply-field'
import { brandImagePickKey } from './brand-image'
import { learnRecordForKey } from './learn-normalize'
import { roleLabel } from './role-assignment'

export const PLAN_BLANK = '작성 필요'

export const PLAN_VISIBLE_SECTION_IDS = [
  'basics',
  'imageGoal',
  'colorTraits',
  'palette',
  'moodboard',
  'usage',
  'check',
] as const

export type PlanVisibleSectionId = (typeof PLAN_VISIBLE_SECTION_IDS)[number]

const VISIBLE_TITLES: Record<PlanVisibleSectionId, string> = {
  basics: '브랜드 기본 정보 및 소개',
  imageGoal: '선택한 색 이미지의 목표',
  colorTraits: '선택한 색의 특성 및 선택 이유',
  palette: '색상 팔레트, HEX, 역할과 사용 비율',
  moodboard: '브랜드 무드보드',
  usage: '색상별 활용 위치와 이유',
  check: '최종 점검 결과와 메모',
}

export const PLAN_FACT_REVIEW_SECTIONS: readonly PlanSectionId[] = ['palette', 'roles', 'moodboard', 'usage']

export type PlanDecisionOption = {
  id: PlanDecision
  label: string
  /** 선택 시 이동할 단계 화면. 없으면 6단계 안에서만 이어집니다. */
  navigateTo?: StepId
}

export const PLAN_DECISION_OPTIONS: PlanDecisionOption[] = [
  { id: 'keep', label: '현재 색채계획을 그대로 사용하고 싶어요.' },
  { id: 'adjust_colors', label: '일부 색이나 비율을 다시 조정하고 싶어요.', navigateTo: 'palette' },
  { id: 'rethink_usage', label: '색은 유지하고 활용 위치를 다시 생각하고 싶어요.', navigateTo: 'review' },
]

export function planDecisionStepNumber(navigateTo: StepId): number {
  return STEPS.indexOf(navigateTo) + 1
}

const PLAN_DECISIONS = new Set<string>(PLAN_DECISION_OPTIONS.map((option) => option.id))

export type PlanFact = { label: string; value: string }
export type PlanTag = { label: string; value: string }
export type PlanEditable = {
  key: string
  label: string
  value: string
  storage: 'field' | 'memo'
}
export type PlanColorBlock = {
  id: string
  hex: string
  tags: PlanTag[]
  notes: PlanFact[]
  fields: PlanEditable[]
}
export type PlanViewSection = {
  id: PlanVisibleSectionId
  title: string
  facts: PlanFact[]
  colors: PlanColorBlock[]
  fields: PlanEditable[]
  showBar: boolean
  showMoodboard: boolean
}

export function paletteFactSignature(project: Project): string {
  const { palette } = project
  return JSON.stringify({
    colors: palette.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      reason: color.reason,
      usage: color.usage,
    })),
    ratios: palette.ratios,
    roles: palette.roles,
    accentPartRatios: palette.accentPartRatios ?? null,
  })
}

export function planDecisionLabel(decision: PlanDecision | null): string {
  if (!decision) return ''
  return PLAN_DECISION_OPTIONS.find((option) => option.id === decision)?.label ?? ''
}

export function planFieldValue(project: Project, key: string, source: string): string {
  const edited = project.plan.fieldEdits[key]
  return typeof edited === 'string' ? edited : source
}

/** 6단계 상세 편집 textarea placeholder */
export function planFieldPlaceholder(key: string): string {
  if (key === 'keywordReason') return '예: 매장 톤과 맞아서 골랐어요'
  if (key.startsWith('reason.')) return '예: 브랜드 분위기와 잘 맞아서'
  if (key.startsWith('usage.')) return '예: 벽·버튼 등 쓸 위치'
  if (key === 'usageReason') return '예: 넓은 면·강조 면 나눠 쓰기'
  if (key === 'memo') return '예: 나중에 참고할 한 줄'
  return '예: 한두 문장으로 적어 보세요'
}

export function isPlanFactField(key: string): boolean {
  return key.startsWith('reason.') || key.startsWith('usage.') || key === 'usageReason'
}

function pctLabel(widthPct: number): string {
  return widthPct % 1 === 0 ? `${widthPct}%` : `${widthPct.toFixed(1)}%`
}

function pickForHex(brand: Project['brand'], hex: string) {
  const norm = hex.trim().toLowerCase()
  return brand.imagePicks.find((pick) => pick.hex.trim().toLowerCase() === norm)
}

export function planColorTags(
  brand: Project['brand'],
  hex: string,
  fallbackName: string,
  role: string,
  widthPct: number | null,
): PlanTag[] {
  const pick = pickForHex(brand, hex)
  const facts = pick ? imagePickFacts(pick.hueId, pick.toneId) : null
  const tags: PlanTag[] = [{ label: '색명', value: facts?.colorName || fallbackName }]
  if (facts?.step) tags.push({ label: '단계', value: facts.step })
  if (facts?.code) tags.push({ label: '기호', value: facts.code })
  if (hex.trim()) tags.push({ label: 'HEX', value: hex })
  if (role.trim()) tags.push({ label: '역할', value: role })
  if (widthPct !== null) tags.push({ label: '비율', value: pctLabel(widthPct) })
  return tags.filter((tag) => tag.value.trim())
}

function learnNotes(project: Project, hex: string): PlanFact[] {
  const pick = pickForHex(project.brand, hex)
  if (!pick) return []
  const record = learnRecordForKey(project.learn, brandImagePickKey(pick))
  const notes: PlanFact[] = []
  if (record.fitChoice) notes.push({ label: '2단계 어울림', value: LEARN_FIT_CHOICE_LABELS[record.fitChoice] })
  if (record.fitReason.trim()) notes.push({ label: '2단계 기록', value: record.fitReason.trim() })
  if (record.imageCompareSide === 'mine') notes.push({ label: '톤 비교', value: '내가 고른 색 쪽에 가깝다고 느낌' })
  if (record.imageCompareSide === 'other') notes.push({ label: '톤 비교', value: '비교할 색 쪽에 가깝다고 느낌' })
  if (record.imageCompareSide === 'unsure') notes.push({ label: '톤 비교', value: '아직 잘 모르겠다고 느낌' })
  return notes
}

function usageSource(project: Project, rowId: string): string {
  const selected = (project.review.usageSelections[rowId] ?? []).filter(Boolean).join(', ')
  if (selected) return selected
  if (rowId.startsWith('palette-')) {
    const index = Number(rowId.split('-')[1])
    return project.palette.colors[index]?.usage.trim() ?? ''
  }
  return ''
}

function slotColors(project: Project): PlanColorBlock[] {
  return project.palette.colors.map((color, index) => ({
    id: `slot-${index}`,
    hex: color.hex,
    tags: planColorTags(
      project.brand,
      color.hex,
      color.name,
      roleLabel(project.palette.roles[index], project.palette.ratios[index]),
      project.palette.ratios[index],
    ),
    notes: learnNotes(project, color.hex),
    fields: [
      {
        key: `reason.${index}`,
        label: '선택 이유',
        value: planFieldValue(project, `reason.${index}`, color.reason),
        storage: 'field',
      },
    ],
  }))
}

function barColors(project: Project, withUsage: boolean): PlanColorBlock[] {
  return reviewPaletteRows(project.brand, project.palette).map((row) => ({
    id: row.id,
    hex: row.hex,
    tags: planColorTags(project.brand, row.hex, row.name, row.roleLabel, row.widthPct),
    notes: [],
    fields: withUsage
      ? [
          {
            key: `usage.${row.id}`,
            label: '활용 위치',
            value: planFieldValue(project, `usage.${row.id}`, usageSource(project, row.id)),
            storage: 'field' as const,
          },
        ]
      : [],
  }))
}

export function planView(project: Project): PlanViewSection[] {
  const { brand, review } = project
  const feel = review.brandImageFeel ? REVIEW_BRAND_IMAGE_FEEL_LABEL[review.brandImageFeel] : review.imageFit
  const usageReason = reviewUsageReasonLabel(review.usageReasonChoice, review.usageReasonCustom)

  const sections: PlanViewSection[] = [
    {
      id: 'basics',
      title: '',
      facts: [
        { label: '브랜드명', value: brand.name.trim() },
        { label: '색 활용 분야', value: applyFieldDisplayText(brand) },
      ],
      colors: [],
      fields: [],
      showBar: false,
      showMoodboard: false,
    },
    {
      id: 'imageGoal',
      title: '',
      facts: [
        ...(brand.imagePicks.length ? [] : [{ label: '이미지 키워드', value: '' }]),
        { label: '브랜드 이미지', value: feel },
      ],
      colors: brand.imagePicks.map((pick) => ({
        id: `${pick.hueId}:${pick.toneId}`,
        hex: pick.hex,
        tags: planColorTags(brand, pick.hex, '', '', null),
        notes: [],
        fields: [],
      })),
      fields: [
        {
          key: 'keywordReason',
          label: '색상을 고른 이유',
          value: planFieldValue(project, 'keywordReason', brand.keywordReason),
          storage: 'field',
        },
      ],
      showBar: false,
      showMoodboard: false,
    },
    {
      id: 'colorTraits',
      title: '',
      facts: [],
      colors: slotColors(project),
      fields: [],
      showBar: false,
      showMoodboard: false,
    },
    {
      id: 'palette',
      title: '',
      facts: [],
      colors: barColors(project, false),
      fields: [],
      showBar: true,
      showMoodboard: false,
    },
    {
      id: 'moodboard',
      title: '',
      facts: [{ label: '색 활용 분야', value: applyFieldDisplayText(brand) }],
      colors: [],
      fields: [],
      showBar: false,
      showMoodboard: true,
    },
    {
      id: 'usage',
      title: '',
      facts: [],
      colors: barColors(project, true),
      fields: [
        {
          key: 'usageReason',
          label: '활용 이유',
          value: planFieldValue(project, 'usageReason', usageReason),
          storage: 'field',
        },
      ],
      showBar: false,
      showMoodboard: false,
    },
    {
      id: 'check',
      title: '',
      facts: [{ label: '최종 점검', value: planDecisionLabel(project.plan.decision) }],
      colors: [],
      fields: [
        {
          key: 'memo',
          label: '계획서 메모',
          value: project.plan.memo,
          storage: 'memo',
        },
      ],
      showBar: false,
      showMoodboard: false,
    },
  ]

  return sections.map((section, index) => ({
    ...section,
    title: `${index + 1}. ${VISIBLE_TITLES[section.id]}`,
  }))
}

function line(label: string, value: string): string {
  return `- ${label}: ${value.trim() || PLAN_BLANK}`
}

function colorMarkdown(color: PlanColorBlock): string {
  const tags = color.tags.map((tag) => line(tag.label, tag.value)).join('\n')
  const notes = color.notes.map((note) => line(note.label, note.value)).join('\n')
  const fields = color.fields.map((field) => line(field.label, field.value)).join('\n')
  return [tags, notes, fields].filter(Boolean).join('\n')
}

export function formatPlanMarkdown(project: Project): string {
  const title = project.brand.name.trim() || '브랜드'
  const parts = [`# ${title} 브랜드 컬러 계획서`, '']
  for (const section of planView(project)) {
    parts.push(`## ${section.title}`, '')
    for (const fact of section.facts) parts.push(line(fact.label, fact.value))
    for (const color of section.colors) {
      if (parts[parts.length - 1] !== '') parts.push('')
      parts.push(colorMarkdown(color), '')
    }
    for (const field of section.fields) parts.push(line(field.label, field.value))
    if (parts[parts.length - 1] !== '') parts.push('')
  }
  parts.push('적지 않은 항목은 추측하지 않고 ‘작성 필요’로 표시합니다. 직접 고친 문장은 색이 바뀌어도 자동으로 덮어쓰지 않습니다.')
  return parts.join('\n')
}

export function needsPlanFactReview(project: Project): boolean {
  const hasField = Object.keys(project.plan.fieldEdits).some(isPlanFactField)
  const hasLegacy = PLAN_FACT_REVIEW_SECTIONS.some((id) => typeof project.plan.sectionEdits[id] === 'string')
  if (!hasField && !hasLegacy) return false
  return project.plan.acknowledgedFactSignature !== paletteFactSignature(project)
}

export function mergePlanFromRaw(raw: unknown, base: Project['plan']): Project['plan'] {
  const plan = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const text = typeof plan.text === 'string' ? plan.text : base.text
  const sectionEdits: Project['plan']['sectionEdits'] = {}
  const rawEdits =
    typeof plan.sectionEdits === 'object' && plan.sectionEdits !== null && !Array.isArray(plan.sectionEdits)
      ? (plan.sectionEdits as Record<string, unknown>)
      : null
  if (rawEdits) {
    for (const id of PLAN_SECTION_IDS) {
      if (typeof rawEdits[id] === 'string') sectionEdits[id] = rawEdits[id]
    }
  }
  const fieldEdits: Record<string, string> = {}
  const rawFields =
    typeof plan.fieldEdits === 'object' && plan.fieldEdits !== null && !Array.isArray(plan.fieldEdits)
      ? (plan.fieldEdits as Record<string, unknown>)
      : null
  if (rawFields) {
    for (const [key, value] of Object.entries(rawFields)) {
      if (typeof value === 'string') fieldEdits[key] = value
    }
  }
  const decision = typeof plan.decision === 'string' && PLAN_DECISIONS.has(plan.decision) ? (plan.decision as PlanDecision) : null
  return {
    text,
    edited: Boolean(plan.edited),
    sourceSignature: typeof plan.sourceSignature === 'string' ? plan.sourceSignature : base.sourceSignature,
    decision,
    memo: typeof plan.memo === 'string' ? plan.memo : '',
    sectionEdits,
    fieldEdits,
    acknowledgedFactSignature:
      typeof plan.acknowledgedFactSignature === 'string' ? plan.acknowledgedFactSignature : '',
  }
}
