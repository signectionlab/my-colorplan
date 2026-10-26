export const STEPS = ['brand', 'learn', 'compare', 'palette', 'review', 'plan'] as const

export type StepId = (typeof STEPS)[number]
export type ScreenId = 'start' | StepId
export type RoleName = '주조색' | '보조색' | '강조색'

export type ReviewBrandImageFeel = 'well' | 'partial' | 'different'
export type ReviewPrimaryRoleQuiz = 'background_mood' | 'accent_point' | 'structure'
export type ReviewUsageReasonChoice =
  | 'brand_image'
  | 'readability'
  | 'balance'
  | 'stand_out'
  | 'custom'

export type BrandImagePick = {
  hueId: string
  toneId: string
  hex: string
}

/** 브랜드 색 활용 분야 (업종 분류·색 추천용 아님) */
export type ApplyFieldId = 'space' | 'product' | 'online' | 'print' | 'service' | 'other'

/** STEP 5 분야별 무드보드·미리보기 (other·공통 탭 제외) */
export type ApplyFieldPreviewId = Exclude<ApplyFieldId, 'other'>

export type PaletteColor = {
  id: string
  name: string
  hex: string
  reason: string
  usage: string
}

export type CompareSnapshot = {
  background: string
  text: string
  shape: string
}

export type CompareReadabilityChoice = 'current' | 'saved_baseline' | 'mood_diff' | 'unsure'
export type CompareSurroundChoice = 'more_different' | 'similar' | 'unsure'
export type CompareBrandExperimentChoice = 'light_bg' | 'dark_bg' | 'unsure'

export type PaletteComboReasonChoice =
  | 'brand_image'
  | 'balance'
  | 'clarity'
  | 'ratio_compare'
  | 'custom'

export type PaletteSnapshot = {
  colors: [{ id: string; name: string; hex: string }, { id: string; name: string; hex: string }, { id: string; name: string; hex: string }]
  ratios: [number, number, number]
  roles: [RoleName, RoleName, RoleName]
}

export type LearnBrandFitChoice = 'fit' | 'unsure' | 'explore'

export type LearnBrandCompareSide = 'mine' | 'other' | 'unsure'

export type LearnBrandPickRecord = {
  /** 활동 2: 내 색 vs 비교 톤 중 더 가깝다고 느낀 쪽 */
  imageCompareSide: LearnBrandCompareSide | null
  /** 활동 2: 비교에 사용한 상대 톤(무채색은 명도 라벨 N*) */
  compareToneId: string | null
  /** 활동 3: 브랜드와의 어울림 자기 평가 */
  fitChoice: LearnBrandFitChoice | null
  fitReason: string
}

export type Project = {
  kind: 'my-brand-color-canvas'
  version: 2
  screen: ScreenId
  brand: {
    name: string
    /** JSON·계획서 호환용 요약 (applyFieldId/custom과 동기화) */
    field: string
    applyFieldId: ApplyFieldId | null
    applyFieldCustom: string
    intro: string
    keywords: string[]
    imagePicks: BrandImagePick[]
    /** 보이는 슬롯 수 (1~5). 색 추가로만 늘림 */
    imagePickSlotCount: number
    /** 「더 이상 추가 안함」 선택 시 true */
    imagePickAddingDone: boolean
    /** 강조색 계획 pick key (최대 3·4색=2칸, 5색=3칸) */
    accentPlanPickKeys: [string | null, string | null, string | null]
    keywordReason: string
  }
  learn: {
    /** 비교해 보고 싶은 일반색·형용색 등 (1단계 선택과 별도) */
    interestIds: string[]
    reasons: Record<string, string>
    /** 활동 1~2에서 자세히 볼 브랜드 색 (hueId:toneId) */
    focusPickKey: string | null
    brandPickRecords: Record<string, LearnBrandPickRecord>
  }
  compare: {
    background: string
    text: string
    shape: string
    observation: string
    baseline: CompareSnapshot | null
    readabilityChoice: CompareReadabilityChoice | null
    surroundChoice: CompareSurroundChoice | null
    brandExperimentChoice: CompareBrandExperimentChoice | null
    observationDetail: string
    surroundBgA: string
    surroundBgB: string
    /** 활동 2 주변색 관찰용 도형색(활동 1 도형 dot `shape`와 분리) */
    surroundShape: string
  }
  palette: {
    colors: [PaletteColor, PaletteColor, PaletteColor]
    ratios: [number, number, number]
    roles: [RoleName, RoleName, RoleName]
    /** pick 4~5: 강조색별 막대 전체 % (합 = ratios[2]) */
    accentPartRatios?: [number, number, number]
    roleNote: string
    baseline: PaletteSnapshot | null
    comboReasonChoice: PaletteComboReasonChoice | null
    comboReason: string
  }
  review: {
    /** 6단계·내보내기 호환 문장 */
    imageFit: string
    brandImageFeel: ReviewBrandImageFeel | null
    /** 활동 1 — 이미지를 만드는 데 가장 큰 역할을 한 색 (행 id) */
    keyColorRowId: string | null
    primaryRoleQuiz: ReviewPrimaryRoleQuiz | null
    usageSelections: Record<string, string[]>
    usageReasonChoice: ReviewUsageReasonChoice | null
    usageReasonCustom: string
    contrastNote: string
    ratioNote: string
    changeNote: string
  }
  plan: {
    text: string
    edited: boolean
    sourceSignature: string
    /** 6단계 최종 점검 선택 */
    decision: PlanDecision | null
    /** 계획서에 남기는 메모 */
    memo: string
    /** 항목별 직접 수정 문장. 없는 키는 초안을 그대로 보여 준다 */
    sectionEdits: Partial<Record<PlanSectionId, string>>
    /** 문장 하나당 키 하나. 없으면 1~5단계 원문을 보여 준다 */
    fieldEdits: Record<string, string>
    /** 항목 문장을 확인할 때의 팔레트 사실 서명. 색·비율이 바뀌면 재검토 안내에 쓴다 */
    acknowledgedFactSignature: string
  }
}

export const PLAN_SECTION_IDS = [
  'basics',
  'imageGoal',
  'colorTraits',
  'palette',
  'roles',
  'moodboard',
  'usage',
  'contrast',
  'check',
] as const

export type PlanSectionId = (typeof PLAN_SECTION_IDS)[number]

export type PlanDecision = 'keep' | 'adjust_colors' | 'rethink_usage'

export const REASON_HINTS = [
  '따뜻한 느낌이 들어서',
  '글자가 잘 보여서',
  '상품이나 재료와 어울려서',
  '다른 색을 돋보이게 해서',
] as const

/** STEP 2 활동 3 — 브랜드 색 선택 이유 도움말 */
export const LEARN_FIT_CHOICE_LABELS: Record<LearnBrandFitChoice, string> = {
  fit: '잘 어울린다고 생각함',
  unsure: '아직 잘 모르겠음',
  explore: '다른 색도 비교해 보고 싶음',
}

export const COMPARE_READABILITY_OPTIONS: { id: CompareReadabilityChoice; label: string }[] = [
  { id: 'current', label: '지금 미리보기가 더 잘 보여요' },
  { id: 'saved_baseline', label: '비교 기준이 더 잘 보여요' },
  { id: 'mood_diff', label: '읽기 쉬움보다 분위기의 차이가 커요' },
  { id: 'unsure', label: '아직 잘 모르겠어요' },
]

export const COMPARE_SURROUND_OPTIONS: { id: CompareSurroundChoice; label: string }[] = [
  { id: 'more_different', label: '배경에 따라 꽤 다르게 느껴져요' },
  { id: 'similar', label: '비슷하게 느껴져요' },
  { id: 'unsure', label: '아직 잘 모르겠어요' },
]

export const COMPARE_BRAND_EXP_OPTIONS: { id: CompareBrandExperimentChoice; label: string }[] = [
  { id: 'light_bg', label: '밝은 배경과 함께일 때 더 잘 보이는 것 같아요' },
  { id: 'dark_bg', label: '어두운 배경과 함께일 때 더 잘 보이는 것 같아요' },
  { id: 'unsure', label: '아직 잘 모르겠어요' },
]

export const PALETTE_COMBO_REASON_OPTIONS: { id: Exclude<PaletteComboReasonChoice, null>; label: string }[] = [
  { id: 'brand_image', label: '처음 생각한 브랜드 이미지와 어울려서' },
  { id: 'balance', label: '주조색과 강조색의 균형이 좋아서' },
  { id: 'clarity', label: '중요한 정보가 잘 구분되어서' },
  { id: 'ratio_compare', label: '다른 비율과 비교했을 때 더 마음에 들어서' },
  { id: 'custom', label: '직접 입력' },
]

export const LEARN_FIT_REASON_HINTS = [
  '원하는 분위기가 느껴져서',
  '색이 밝고 눈에 잘 띄어서',
  '부드럽고 편안하게 느껴져서',
  '상품이나 서비스와 어울릴 것 같아서',
] as const

export const STEP_META: { id: StepId; title: string; lede: string; nextLabel: string }[] = [
  {
    id: 'brand',
    title: '내 브랜드',
    lede: '이름과 원하는 이미지만 정해도 색 실습을 시작할 수 있어요. 색과 톤을 고른 이유는 나중에 적어도 됩니다.',
    nextLabel: '내 색 이해하기',
  },
  {
    id: 'learn',
    title: '내 색 이해하기',
    lede: '1단계에서 선택한 색을 살펴보고, 브랜드에 어울리는 이유를 찾아보세요. 이 단계에서 색을 최종 확정하지 않아도 됩니다.',
    nextLabel: '색 비교하기',
  },
  {
    id: 'compare',
    title: '색 비교하기',
    lede: '1단계에서 고른 색으로 글자·배경과 주변색 효과를 살펴봅니다. 실습 색은 4단계 팔레트와 따로 둡니다.',
    nextLabel: '내 팔레트 만들기',
  },
  {
    id: 'palette',
    title: '내 브랜드 팔레트 만들기',
    lede: '세 가지 색의 역할과 사용 비율을 바꿔 보며, 우리 브랜드에 어울리는 조합을 만들어 보세요.',
    nextLabel: '적용 결과 확인하기',
  },
  {
    id: 'review',
    title: '적용과 점검',
    lede: '무드보드로 색을 적용해 보고, 짧은 질문으로 브랜드 이미지·역할·활용 계획을 점검해 보세요.',
    nextLabel: '계획서 확인하기',
  },
  {
    id: 'plan',
    title: '계획서 완성',
    lede: '1~5단계 기록을 모아 브랜드 컬러 계획서를 검토하고 완성합니다. 없는 항목은 비워 두고, 문장은 계획서에서만 고칩니다.',
    nextLabel: '',
  },
]
