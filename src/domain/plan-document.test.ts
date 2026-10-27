import { describe, expect, it } from 'vitest'
import { APP_COPYRIGHT } from '../constants/copyright'
import { createDefaultProject } from './default-project'
import {
  PLAN_BLANK,
  formatPlanMarkdown,
  mergePlanFromRaw,
  needsPlanFactReview,
  paletteFactSignature,
  planColorTags,
  planFieldValue,
  planView,
} from './plan-document'

describe('plan document', () => {
  it('marks empty brand facts as 작성 필요 and omits contrast practice', () => {
    const project = createDefaultProject()
    project.brand.name = ''
    project.brand.intro = ''
    const markdown = formatPlanMarkdown(project)
    expect(markdown).toContain(PLAN_BLANK)
    expect(markdown).toContain('브랜드 컬러 계획서')
    expect(markdown).toContain('색상 팔레트, HEX, 역할과 사용 비율')
    expect(markdown).not.toContain('대비 실습')
    expect(markdown).toContain(APP_COPYRIGHT)
    expect(planView(project).map((section) => section.id)).toEqual([
      'basics',
      'imageGoal',
      'colorTraits',
      'palette',
      'moodboard',
      'usage',
      'check',
    ])
  })

  it('keeps a hand-edited keyword reason when the brand name changes', () => {
    const project = createDefaultProject()
    project.brand.name = '처음 이름'
    project.plan.fieldEdits.keywordReason = '직접 고친 선택 이유'
    project.brand.name = '바뀐 이름'
    expect(planFieldValue(project, 'keywordReason', project.brand.keywordReason)).toBe('직접 고친 선택 이유')
    expect(formatPlanMarkdown(project)).toContain('직접 고친 선택 이유')
    expect(formatPlanMarkdown(project)).toContain('바뀐 이름')
  })

  it('asks to recheck edited reasons after ratios change', () => {
    const project = createDefaultProject()
    project.plan.fieldEdits['reason.0'] = '예전 선택 이유'
    project.plan.acknowledgedFactSignature = paletteFactSignature(project)
    expect(needsPlanFactReview(project)).toBe(false)
    project.palette.ratios = [70, 20, 10]
    expect(needsPlanFactReview(project)).toBe(true)
  })

  it('splits neutral color facts into separate tags', () => {
    const project = createDefaultProject()
    project.brand.imagePicks = [{ hueId: 'N', toneId: 'N9.5', hex: '#ffffff' }]
    const tags = planColorTags(project.brand, '#ffffff', '하양 · 10단계 · N9.5', '주조색', 65)
    expect(tags.map((tag) => `${tag.label}:${tag.value}`)).toEqual([
      '색명:하양',
      '단계:10단계',
      '기호:N9.5',
      'HEX:#ffffff',
      '역할:주조색',
      '비율:65%',
    ])
  })

  it('restores decision, memo, and field edits from JSON', () => {
    const base = createDefaultProject().plan
    const plan = mergePlanFromRaw(
      {
        text: 'old',
        edited: true,
        decision: 'keep',
        memo: '남길 말',
        fieldEdits: { intro: '소개만' },
        sectionEdits: { check: '점검 문장' },
        acknowledgedFactSignature: 'sig',
      },
      base,
    )
    expect(plan.decision).toBe('keep')
    expect(plan.memo).toBe('남길 말')
    expect(plan.fieldEdits.intro).toBe('소개만')
    expect(plan.sectionEdits.check).toBe('점검 문장')
    expect(plan.acknowledgedFactSignature).toBe('sig')
  })
})
