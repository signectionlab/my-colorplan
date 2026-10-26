import { tick } from 'svelte'
import type {
  ApplyFieldId,
  BrandImagePick,
  CompareSnapshot,
  LearnBrandPickRecord,
  PaletteSnapshot,
  Project,
  ScreenId,
  StepId,
} from '../types/project'
import { brandCompareSeedFromPicks, COMPARE_START_EXAMPLE } from '../domain/compare-ux'
import { normalizeLearnState } from '../domain/learn-normalize'
import { migrateApplyFieldFromLegacy, syncApplyFieldLegacy } from '../domain/apply-field'
import {
  BRAND_IMAGE_PICK_MAX,
  BRAND_IMAGE_PICK_MIN,
  brandColorPlanPickKeySet,
  brandColorPlanSlotFromRoleIndex,
  brandColorPlanSlotPickKey,
  brandImagePickKey,
  pickByPlanKey,
  canAddBrandImagePick,
  canAssignBrandPickToColorPlanSlot,
  accentPlanSlotCount,
  emptyAccentPlanPickKeys,
  normalizeAccentPlanPickKeys,
  normalizeBrandImageSlots,
  syncBrandKeywordsFromPicks,
} from '../domain/brand-image'
import { STEPS } from '../types/project'
import { createDefaultProject } from '../domain/default-project'
import { normalizeHex } from '../domain/color-validation'
import {
  BRAND_PLAN_RATIOS,
  DEFAULT_RATIOS,
  capMultiPickAccentSlot,
  normalizeRatiosTriple,
  setRatio,
} from '../domain/ratio-calculation'
import { imagePickLabel } from '../data/munsell-brand-image'
import {
  normalizeAccentPartSplit,
  setPaletteBarSegment,
  syncAccentPartsToAccentTotal,
} from '../domain/accent-part-ratios'
import { assignRoles, describeRoleChanges, roleForSlotRatio } from '../domain/role-assignment'
import { draftSignature } from '../domain/draft-template'
import { paletteFactSignature } from '../domain/plan-document'
import type { PlanSectionId } from '../types/project'
import { syncPaletteUsageFromReview } from '../domain/review-normalize'
import { loadStoredProject, saveStoredProject, clearStoredProject } from '../services/project-storage'
import { parseProjectFile } from '../services/project-import'
import type { ColorEntry } from '../types/content'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function bootstrapProject(): Project {
  const project = (loadStoredProject() ?? createDefaultProject()) as Project
  normalizeBrandImageSlots(project.brand)
  normalizeAccentPlanPickKeys(project.brand)
  migrateApplyFieldFromLegacy(project.brand)
  normalizeLearnState(project.learn, project.brand.imagePicks)
  return project
}

export const store = $state({
  project: bootstrapProject(),
  saveStatus: 'idle' as SaveStatus,
  saveError: '',
})

let timer: ReturnType<typeof setTimeout> | null = null

function copyProject(source: Project) {
  const target = store.project
  target.screen = source.screen
  target.version = 2
  target.kind = 'my-brand-color-canvas'
  Object.assign(target.brand, source.brand)
  target.brand.keywords = [...(source.brand.keywords ?? [])]
  target.brand.imagePicks = (source.brand.imagePicks ?? []).map((pick) => ({ ...pick }))
  target.brand.imagePickSlotCount = source.brand.imagePickSlotCount ?? 1
  target.brand.imagePickAddingDone = source.brand.imagePickAddingDone ?? false
  normalizeBrandImageSlots(target.brand)
  const accentKeys = source.brand.accentPlanPickKeys ?? [null, null, null]
  target.brand.accentPlanPickKeys = [
    accentKeys[0] ?? null,
    accentKeys[1] ?? null,
    accentKeys[2] ?? null,
  ]
  normalizeAccentPlanPickKeys(target.brand)
  target.brand.applyFieldId = source.brand.applyFieldId ?? null
  target.brand.applyFieldCustom = source.brand.applyFieldCustom ?? ''
  migrateApplyFieldFromLegacy(target.brand)
  target.learn.interestIds = [...source.learn.interestIds]
  target.learn.reasons = { ...source.learn.reasons }
  target.learn.focusPickKey = source.learn.focusPickKey ?? null
  target.learn.brandPickRecords = Object.fromEntries(
    Object.entries(source.learn.brandPickRecords ?? {}).map(([key, record]) => [
      key,
      { ...record } satisfies LearnBrandPickRecord,
    ]),
  )
  normalizeLearnState(target.learn, target.brand.imagePicks)
  Object.assign(target.compare, source.compare)
  target.compare.baseline = source.compare.baseline ? { ...source.compare.baseline } : null
  source.palette.colors.forEach((color, index) => Object.assign(target.palette.colors[index], color))
  target.palette.ratios = [...source.palette.ratios]
  target.palette.roles = [...source.palette.roles]
  target.palette.roleNote = source.palette.roleNote
  target.palette.comboReasonChoice = source.palette.comboReasonChoice ?? null
  target.palette.comboReason = source.palette.comboReason ?? ''
  target.palette.baseline = source.palette.baseline
    ? {
        colors: source.palette.baseline.colors.map((color) => ({ ...color })) as PaletteSnapshot['colors'],
        ratios: [...source.palette.baseline.ratios],
        roles: [...source.palette.baseline.roles],
      }
    : null
  Object.assign(target.review, source.review)
  Object.assign(target.plan, source.plan)
}

function writeProjectToStorage() {
  saveStoredProject(store.project)
}

function persist() {
  store.saveStatus = 'saving'
  store.saveError = ''
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      writeProjectToStorage()
      store.saveStatus = 'saved'
    } catch {
      store.saveStatus = 'error'
      store.saveError = '브라우저에 저장하지 못했습니다. JSON 작업 파일로 보관해 주세요.'
    }
  }, 250)
}

/** 자동 저장 대기 없이 브라우저에 즉시 저장 */
export function saveProjectNow() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  store.saveStatus = 'saving'
  store.saveError = ''
  try {
    writeProjectToStorage()
    store.saveStatus = 'saved'
  } catch {
    store.saveStatus = 'error'
    store.saveError = '브라우저에 저장하지 못했습니다. JSON 작업 파일로 보관해 주세요.'
  }
}

export function goTo(screen: ScreenId) {
  store.project.screen = screen
  persist()
}

async function scrollStepViewToTop() {
  await tick()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export function goNext() {
  if (store.project.screen === 'start') {
    goTo('brand')
    void scrollStepViewToTop()
    return
  }
  const index = STEPS.indexOf(store.project.screen as StepId)
  if (index >= 0 && index < STEPS.length - 1) {
    goTo(STEPS[index + 1])
    void scrollStepViewToTop()
  }
}

export function goPrev() {
  if (store.project.screen === 'brand') return goTo('start')
  const index = STEPS.indexOf(store.project.screen as StepId)
  if (index > 0) goTo(STEPS[index - 1])
}

export function startFresh() {
  copyProject(createDefaultProject())
  clearStoredProject()
  store.project.screen = 'brand'
  store.saveStatus = 'idle'
  persist()
}

export function continueWork() {
  const stored = loadStoredProject()
  if (stored) copyProject(stored)
  if (store.project.screen === 'start') store.project.screen = 'brand'
  persist()
}

export function patchBrand(patch: Partial<Project['brand']>) {
  Object.assign(store.project.brand, patch)
  if (patch.keywords) store.project.brand.keywords = [...patch.keywords]
  syncApplyFieldLegacy(store.project.brand)
  persist()
}

export function setApplyField(id: ApplyFieldId | null, custom?: string) {
  const brand = store.project.brand
  brand.applyFieldId = id
  if (custom !== undefined) brand.applyFieldCustom = custom
  syncApplyFieldLegacy(brand)
  persist()
}

const BRAND_PLAN_ROLES: Project['palette']['roles'] = ['주조색', '보조색', '강조색']

export function ensureBrandColorPlanRatios() {
  store.project.palette.ratios = [...BRAND_PLAN_RATIOS]
  store.project.palette.roles = [...BRAND_PLAN_ROLES]
  persist()
}

/** 4단계 진입 시 1단계 색채계획 배정을 palette.colors에 반영(비율은 건드리지 않음) */
export function refreshPaletteColorsFromBrandColorPlan() {
  const { brand, palette } = store.project
  if (brand.imagePicks.length < BRAND_IMAGE_PICK_MIN) return
  normalizeAccentPlanPickKeys(brand)

  let touched = false
  const writePick = (roleIndex: 0 | 1 | 2, pick: BrandImagePick) => {
    const color = palette.colors[roleIndex]
    const key = brandImagePickKey(pick)
    const name = imagePickLabel(pick.hueId, pick.toneId, pick.hex)
    if (color.id === key && color.hex === pick.hex && color.name === name) return
    color.id = key
    color.hex = pick.hex
    color.name = name
    touched = true
  }

  for (let i = 0; i < 2; i += 1) {
    const idx = i as 0 | 1
    const key = brandColorPlanSlotPickKey(brand, palette, { kind: 'role', index: idx })
    const pick = pickByPlanKey(brand, key)
    if (pick) writePick(idx, pick)
  }
  const accentKey = brandColorPlanSlotPickKey(brand, palette, { kind: 'accent', index: 0 })
  const accentPick = pickByPlanKey(brand, accentKey)
  if (accentPick) writePick(2, accentPick)

  const ratios = [...palette.ratios] as [number, number, number]
  const roles = assignRoles(ratios, palette.roles)
  const rolesChanged = roles.some((r, i) => r !== palette.roles[i])
  palette.roles = roles
  if (touched || rolesChanged) persist()
}

export type AssignBrandPlanPickResult = { ok: true } | { ok: false; reason: 'duplicate' | 'invalid' }

export function assignBrandPickToRole(roleIndex: 0 | 1 | 2, pick: BrandImagePick): AssignBrandPlanPickResult {
  const slot = brandColorPlanSlotFromRoleIndex(roleIndex)
  const { brand } = store.project
  const { palette } = store.project
  if (!canAssignBrandPickToColorPlanSlot(brand, palette, slot, pick)) {
    return { ok: false, reason: 'duplicate' }
  }
  const key = brandImagePickKey(pick)
  const color = store.project.palette.colors[roleIndex]
  color.id = key
  color.hex = pick.hex
  color.name = imagePickLabel(pick.hueId, pick.toneId, pick.hex)
  store.project.palette.ratios = [...BRAND_PLAN_RATIOS]
  store.project.palette.roles = [...BRAND_PLAN_ROLES]
  if (roleIndex === 2) {
    const prev = store.project.brand.accentPlanPickKeys ?? [null, null, null]
    store.project.brand.accentPlanPickKeys = [key, prev[1] ?? null, prev[2] ?? null]
    normalizeAccentPlanPickKeys(store.project.brand)
  }
  persist()
  return { ok: true }
}

export function assignBrandPickToAccentSlot(
  accentIndex: 0 | 1 | 2,
  pick: BrandImagePick,
): AssignBrandPlanPickResult {
  const brand = store.project.brand
  const { palette } = store.project
  normalizeAccentPlanPickKeys(brand)
  if (accentIndex >= accentPlanSlotCount(brand)) return { ok: false, reason: 'invalid' }
  const slot: { kind: 'accent'; index: 0 | 1 | 2 } = { kind: 'accent', index: accentIndex }
  if (!canAssignBrandPickToColorPlanSlot(brand, palette, slot, pick)) {
    return { ok: false, reason: 'duplicate' }
  }
  const key = brandImagePickKey(pick)
  if (accentIndex === 0) {
    return assignBrandPickToRole(2, pick)
  }
  const keys = [...brand.accentPlanPickKeys] as [string | null, string | null, string | null]
  keys[accentIndex] = key
  brand.accentPlanPickKeys = keys
  normalizeAccentPlanPickKeys(brand)
  ensureBrandColorPlanRatios()
  persist()
  return { ok: true }
}

/** STEP 2 게이지·강조 칸에 지정한 브랜드 색 배정을 모두 해제 */
export function resetBrandColorPlanSelections() {
  const { brand, palette } = store.project
  const pickKeys = brandColorPlanPickKeySet(brand)
  const defaults = createDefaultProject().palette.colors
  for (let i = 0; i < 3; i += 1) {
    const color = palette.colors[i]
    if (pickKeys.has(color.id)) {
      color.id = defaults[i].id
      color.hex = defaults[i].hex
      color.name = defaults[i].name
    }
  }
  brand.accentPlanPickKeys = emptyAccentPlanPickKeys()
  normalizeAccentPlanPickKeys(brand)
  ensureBrandColorPlanRatios()
  persist()
}

export type AddBrandImagePickResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'max' | 'slot' | 'closed' }

export function addBrandImagePick(pick: BrandImagePick): AddBrandImagePickResult {
  const brand = store.project.brand
  normalizeBrandImageSlots(brand)
  const list = brand.imagePicks
  const key = brandImagePickKey(pick)
  if (list.some((item) => brandImagePickKey(item) === key)) return { ok: false, reason: 'duplicate' }
  if (brand.imagePickAddingDone) return { ok: false, reason: 'closed' }
  if (list.length >= BRAND_IMAGE_PICK_MAX) return { ok: false, reason: 'max' }
  if (list.length >= brand.imagePickSlotCount) return { ok: false, reason: 'slot' }
  list.push({ ...pick })
  syncBrandKeywordsFromPicks(brand)
  normalizeLearnState(store.project.learn, brand.imagePicks)
  persist()
  return { ok: true }
}

export function expandBrandImagePickSlot(): boolean {
  const brand = store.project.brand
  normalizeBrandImageSlots(brand)
  if (brand.imagePickSlotCount >= BRAND_IMAGE_PICK_MAX) return false
  if (brand.imagePicks.length < 1) return false
  if (brand.imagePicks.length !== brand.imagePickSlotCount) return false
  brand.imagePickSlotCount += 1
  brand.imagePickAddingDone = false
  persist()
  return true
}

export function finishBrandImageAdding(): boolean {
  const brand = store.project.brand
  normalizeBrandImageSlots(brand)
  if (brand.imagePicks.length < BRAND_IMAGE_PICK_MIN) return false
  brand.imagePickAddingDone = true
  persist()
  return true
}

export function removeBrandImagePick(index: number) {
  const brand = store.project.brand
  if (index < 0 || index >= brand.imagePicks.length) return
  brand.imagePicks.splice(index, 1)
  normalizeBrandImageSlots(brand)
  if (brand.imagePicks.length === 0) {
    brand.imagePickSlotCount = BRAND_IMAGE_PICK_MIN
    brand.imagePickAddingDone = false
  } else if (brand.imagePicks.length < BRAND_IMAGE_PICK_MIN) {
    brand.imagePickAddingDone = false
  }
  syncBrandKeywordsFromPicks(brand)
  normalizeAccentPlanPickKeys(brand)
  normalizeLearnState(store.project.learn, brand.imagePicks)
  persist()
}

export function setLearnFocusPickKey(key: string | null) {
  store.project.learn.focusPickKey = key
  persist()
}

export function patchLearnBrandPickRecord(key: string, patch: Partial<LearnBrandPickRecord>) {
  const prev = store.project.learn.brandPickRecords[key] ?? {
    imageCompareSide: null,
    compareToneId: null,
    fitChoice: null,
    fitReason: '',
  }
  store.project.learn.brandPickRecords = {
    ...store.project.learn.brandPickRecords,
    [key]: { ...prev, ...patch },
  }
  persist()
}

export function toggleInterest(entry: ColorEntry) {
  const ids = new Set(store.project.learn.interestIds)
  if (ids.has(entry.id)) ids.delete(entry.id)
  else ids.add(entry.id)
  store.project.learn.interestIds = [...ids]
  persist()
}

export function setInterestReason(id: string, reason: string) {
  store.project.learn.reasons = { ...store.project.learn.reasons, [id]: reason }
  persist()
}

export function sendReasonsToEmptyPaletteSlots() {
  let changed = false
  for (const id of store.project.learn.interestIds) {
    const reason = store.project.learn.reasons[id]?.trim()
    if (!reason) continue
    const slot = store.project.palette.colors.find((color) => !color.reason.trim())
    if (!slot) break
    slot.reason = reason
    changed = true
  }
  if (changed) persist()
}

export function applyInterestToSlot(slot: number, entry: ColorEntry) {
  const color = store.project.palette.colors[slot]
  color.name = entry.name
  color.hex = entry.hex
  if (!color.reason.trim()) color.reason = store.project.learn.reasons[entry.id] ?? ''
  persist()
}

export function setCompareColor(field: keyof CompareSnapshot, value: string) {
  const next = normalizeHex(value)
  if (!next) return
  store.project.compare[field] = next
  persist()
}

export function setObservation(value: string) {
  store.project.compare.observation = value
  persist()
}

export function patchCompareFields(fields: Partial<Project['compare']>) {
  Object.assign(store.project.compare, fields)
  persist()
}

export function setCompareSurroundBg(field: 'surroundBgA' | 'surroundBgB', value: string) {
  const next = normalizeHex(value)
  if (!next) return
  const other =
    field === 'surroundBgA' ? store.project.compare.surroundBgB : store.project.compare.surroundBgA
  if (next.toLowerCase() === other.trim().toLowerCase()) return
  store.project.compare[field] = next
  persist()
}

export function setCompareSurroundShape(value: string) {
  const next = normalizeHex(value)
  if (!next) return
  store.project.compare.surroundShape = next
  persist()
}

export function resetCompareToStartExample() {
  const seed = brandCompareSeedFromPicks(store.project.brand.imagePicks)
  if (seed) {
    store.project.compare.background = seed.background
    store.project.compare.text = seed.text
    store.project.compare.shape = seed.shape
    store.project.compare.surroundShape = seed.surroundShape
    store.project.compare.surroundBgA = seed.surroundBgA
    store.project.compare.surroundBgB = seed.surroundBgB
  } else {
    const start = COMPARE_START_EXAMPLE
    store.project.compare.background = start.background
    store.project.compare.text = start.text
    store.project.compare.shape = start.shape
    store.project.compare.surroundShape = start.shape
  }
  persist()
}

export function applyComparePreset(snapshot: CompareSnapshot) {
  store.project.compare.background = snapshot.background
  store.project.compare.text = snapshot.text
  store.project.compare.shape = snapshot.shape
  persist()
}

export function setPaletteComboReason(choice: Project['palette']['comboReasonChoice'], reason: string) {
  store.project.palette.comboReasonChoice = choice
  store.project.palette.comboReason = reason
  persist()
}

export function saveCompareBaseline() {
  const { background, text, shape } = store.project.compare
  store.project.compare.baseline = { background, text, shape }
  persist()
}

export function restoreCompareBaseline() {
  const baseline = store.project.compare.baseline
  if (!baseline) return
  store.project.compare.background = baseline.background
  store.project.compare.text = baseline.text
  store.project.compare.shape = baseline.shape
  persist()
}

export function patchPaletteColor(index: number, patch: Partial<Project['palette']['colors'][number]>) {
  const color = store.project.palette.colors[index]
  if (patch.hex) {
    const next = normalizeHex(patch.hex)
    if (!next) return
    color.hex = next
  }
  if (patch.name !== undefined) color.name = patch.name
  if (patch.reason !== undefined) color.reason = patch.reason
  if (patch.usage !== undefined) color.usage = patch.usage
  persist()
}

function syncStoredAccentParts(normalized: [number, number, number]) {
  const accentSlots = accentPlanSlotCount(store.project.brand)
  if (accentSlots <= 1) {
    delete store.project.palette.accentPartRatios
    return
  }
  store.project.palette.accentPartRatios = syncAccentPartsToAccentTotal(
    accentSlots,
    normalized[2],
    store.project.palette.accentPartRatios,
  )
}

function commitPaletteRatios(
  beforeRatios: [number, number, number],
  ratios: [number, number, number],
  beforeRoles: Project['palette']['roles'],
  options?: { skipAccentCap?: boolean },
) {
  const brand = store.project.brand
  const accentSlots = accentPlanSlotCount(brand)
  let normalized = normalizeRatiosTriple(ratios)
  const enforceAccentTen = brand.imagePicks.length >= 3
  if (enforceAccentTen && accentSlots <= 1 && !options?.skipAccentCap) {
    normalized = capMultiPickAccentSlot(normalized, true)
  }
  const names = store.project.palette.colors.map((color) => color.name)
  const roles = assignRoles(normalized, beforeRoles)
  store.project.palette.roleNote = describeRoleChanges({
    names,
    ratiosBefore: beforeRatios,
    ratiosAfter: normalized,
    rolesBefore: beforeRoles,
    rolesAfter: roles,
  })
  store.project.palette.ratios = normalized
  store.project.palette.roles = roles
  syncStoredAccentParts(normalized)
  persist()
}

/** pick 4~5: 막대 세gment index (0 주·1 보·2+ 강조색) 비율 변경 */
export function updatePaletteBarSegment(segmentIndex: number, value: number) {
  const brand = store.project.brand
  const accentSlots = accentPlanSlotCount(brand)
  if (accentSlots <= 1 && segmentIndex > 2) return
  const beforeRatios = [...store.project.palette.ratios] as [number, number, number]
  const beforeRoles = [...store.project.palette.roles] as Project['palette']['roles']
  const parts =
    store.project.palette.accentPartRatios ??
    normalizeAccentPartSplit(accentSlots, beforeRatios[2], null)
  const next = setPaletteBarSegment(beforeRatios, accentSlots, parts, segmentIndex, value)
  store.project.palette.accentPartRatios = next.parts
  const accentSlotsNow = accentPlanSlotCount(brand)
  commitPaletteRatios(beforeRatios, next.ratios, beforeRoles, { skipAccentCap: accentSlotsNow > 1 })
  if (accentSlotsNow > 1 && segmentIndex >= 2) {
    const share = next.parts[segmentIndex - 2] ?? value
    const label = roleForSlotRatio(share)
    store.project.palette.roleNote = `강조 ${segmentIndex - 1}번 색 ${share}% · ${label} 구간`
    persist()
  }
}

export function updateRatio(index: number, value: number) {
  const beforeRatios = [...store.project.palette.ratios] as [number, number, number]
  const beforeRoles = [...store.project.palette.roles] as Project['palette']['roles']
  const ratios = setRatio(beforeRatios, index, value)
  commitPaletteRatios(beforeRatios, ratios, beforeRoles)
}

/** 스택 막대 경계 드래그 등 — 세 슬롯 비율을 한 번에 반영 */
export function setPaletteRatios(raw: [number, number, number]) {
  const beforeRatios = [...store.project.palette.ratios] as [number, number, number]
  const beforeRoles = [...store.project.palette.roles] as Project['palette']['roles']
  const ratios = normalizeRatiosTriple(raw)
  commitPaletteRatios(beforeRatios, ratios, beforeRoles)
}

export type PaletteRatioPreset = '60-30-10' | '70-20-10'

export function applyPaletteRatioPreset(preset: PaletteRatioPreset) {
  const ratios =
    preset === '70-20-10' ? ([...BRAND_PLAN_RATIOS] as [number, number, number]) : ([...DEFAULT_RATIOS] as [number, number, number])
  setPaletteRatios(ratios)
  store.project.palette.roleNote =
    preset === '70-20-10'
      ? '1단계 색채계획 비율 70:20:10을 적용했어요.'
      : '학습 예시 비율 60:30:10을 적용했어요.'
}

export function resetRatios() {
  const roles = assignRoles(DEFAULT_RATIOS, store.project.palette.roles)
  store.project.palette.ratios = [...DEFAULT_RATIOS]
  store.project.palette.roles = roles
  store.project.palette.roleNote = '기본 비율 60:30:10으로 되돌렸어요. 역할은 지금 면적 순서로 다시 표시합니다.'
  persist()
}

export function savePaletteBaseline() {
  store.project.palette.baseline = {
    colors: store.project.palette.colors.map((color) => ({ id: color.id, name: color.name, hex: color.hex })) as PaletteSnapshot['colors'],
    ratios: [...store.project.palette.ratios],
    roles: [...store.project.palette.roles],
  }
  store.project.palette.roleNote = '지금 조합을 기준안으로 저장했어요. 5단계에서 비교할 수 있습니다.'
  persist()
}

export function restorePaletteBaseline() {
  const baseline = store.project.palette.baseline
  if (!baseline) return
  baseline.colors.forEach((color, index) => {
    store.project.palette.colors[index].name = color.name
    store.project.palette.colors[index].hex = color.hex
  })
  store.project.palette.ratios = [...baseline.ratios]
  store.project.palette.roles = [...baseline.roles]
  store.project.palette.roleNote = ''
  persist()
}

export function patchReview(patch: Partial<Project['review']>) {
  Object.assign(store.project.review, patch)
  if (patch.usageSelections !== undefined) {
    syncPaletteUsageFromReview(store.project)
  }
  persist()
}

export function patchReviewUsagePlace(rowId: string, place: string, checked: boolean) {
  const current = store.project.review.usageSelections[rowId] ?? []
  const next = checked ? [...new Set([...current, place])] : current.filter((p) => p !== place)
  patchReview({ usageSelections: { ...store.project.review.usageSelections, [rowId]: next } })
}

export function replaceEditedPlan(text: string) {
  store.project.plan.text = text
  store.project.plan.edited = false
  store.project.plan.sourceSignature = draftSignature(store.project)
  persist()
}

export function patchPlan(patch: Partial<Project['plan']>) {
  Object.assign(store.project.plan, patch)
  persist()
}

export function setPlanSectionEdit(id: PlanSectionId, text: string) {
  store.project.plan.sectionEdits = { ...store.project.plan.sectionEdits, [id]: text }
  store.project.plan.edited = true
  if (!store.project.plan.acknowledgedFactSignature) {
    store.project.plan.acknowledgedFactSignature = paletteFactSignature(store.project)
  }
  persist()
}

export function setPlanFieldEdit(key: string, text: string) {
  store.project.plan.fieldEdits = { ...store.project.plan.fieldEdits, [key]: text }
  store.project.plan.edited = true
  if (!store.project.plan.acknowledgedFactSignature) {
    store.project.plan.acknowledgedFactSignature = paletteFactSignature(store.project)
  }
  persist()
}

export function acknowledgePlanFacts() {
  store.project.plan.acknowledgedFactSignature = paletteFactSignature(store.project)
  persist()
}

export function importText(text: string): string | null {
  const result = parseProjectFile(text)
  if ('error' in result) return result.error
  copyProject(result.project)
  persist()
  return null
}
