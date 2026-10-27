# 컬러플랜 — 개발기획서 (기술 스택)

- Copyright: © SINGECTION LAB 2026
- 문서 버전: v0.5
- 수정일: 2026년 10월 27일
- 서비스명: **컬러플랜** (JSON `kind`: `color-plan`, 이전 `my-brand-color-canvas` 불러오기 호환)
- 변경 사항: 프런트엔드 프레임워크를 Svelte로 확정
- 삭제 사항: 기존 문서의 ‘스텔스 개발’ 용어와 정의
- 유지 사항: 초기 DB·회원가입·로그인·결제 제외, 핵심 학습 기능 우선 구현

---

## 1. 개발 방향

Svelte를 사용해 **컬러플랜** 컬러 교육 웹앱을 개발한다.

초기에는 별도의 서비스 DB와 애플리케이션 서버 없이 브라우저에서 핵심 기능이 동작하도록 구성한다.

학습자는 회원가입 없이 색을 배우고, 팔레트와 비율을 조절하며, 컬러디자인 계획 초안을 작성하고 보관할 수 있어야 한다.

향후 DB, 로그인, 결제, AI 기능을 연결할 수 있도록 화면, 계산, 저장, 기획서 생성 기능의 책임을 분리한다.

---

## 2. 기술 스택

| 영역 | 기술 및 방식 | 상태 |
|---|---|---|
| 프런트엔드 | Svelte | 확정 |
| 개발·빌드 도구 | Vite | 구현 제안 |
| 개발 언어 | TypeScript | 구현 제안 |
| 스타일 | CSS 및 Svelte 컴포넌트 스타일 | 구현 제안 |
| 공통 상태 | Svelte의 반응형 상태 관리 기능 | 구현 제안 |
| 교육 콘텐츠 | 정적 JSON 또는 TypeScript 데이터 파일 | 구현 제안 |
| 임시 저장 | localStorage | 구현 제안 |
| 작업 백업 | JSON 내보내기·불러오기 | 구현 제안 |
| 기획서 출력 | 텍스트 복사·Markdown 다운로드 | 구현 제안 |
| 배포 | 정적 호스팅 | 방식 제안, 서비스 미정 |
| 서비스 DB | 초기 미사용 | 확정 |
| 회원가입·로그인 | 초기 미구현 | 확정 |
| 결제 | 공모전 이후 검토 | 확정 |
| 생성형 AI API | 고급·유료 버전에서 검토 | 확정 |

구체적인 패키지 버전은 개발 착수 시 호환성을 확인하고 고정한다.

---

## 3. Svelte 구현 원칙

### 3.1 컴포넌트 기반 화면

화면과 반복되는 UI를 Svelte 컴포넌트로 구성한다.

주요 컴포넌트:

- 색 선택 도구
- 비율 조절 게이지
- 색별 역할 표시
- 팔레트 컬러 바
- 브랜드 적용 미리보기
- 학습 점검 질문
- 저장 상태 표시
- 기획서 편집 영역

### 3.2 공통 상태

브랜드 정보, 팔레트, 학습 기록, 계획 초안을 하나의 작업 상태(`Project`, `kind: 'color-plan'`, version 2)로 관리한다. 예전 JSON·localStorage(`my-brand-color-canvas`)는 불러온 뒤 `color-plan`으로 정규화한다.

2단계 `learn` (요약):

- `focusPickKey` — 활동 1에서 본 브랜드 색 (`hueId:toneId`)
- `brandPickRecords` (pick 키별) — `imageCompareSide`, `compareToneId`; 레거시 `fitChoice`, `fitReason`
- `interestIds` / `reasons` — 「비교해 보고 싶은 색」(LearnScreen UI 없음, JSON·4단계 호환)

활동 2 UI 포커스 `act2PickKey`는 Project에 저장하지 않는 LearnScreen 로컬 상태.

도메인: `learn-brand-pick.ts` (톤 비교·`compareChoiceGaugeForPick` 등), `learn-normalize.ts`. 화면: `LearnScreen.svelte`. 상세는 plan.md §5.3.

3단계 `compare` (요약):

- `background`, `text`, `shape`, `baseline`, `surroundBgA`, `surroundBgB`, `surroundShape`
- `readabilityChoice`, `surroundChoice`, `brandExperimentChoice`, `observationDetail`, `observation` — 화면 없음, JSON 호환
- 도메인: `compare-ux.ts`, `compare-normalize.ts`. 화면: `CompareScreen.svelte`. 상세는 plan.md §5.4.

4단계 `palette` (추가 필드):

- `comboReasonChoice`, `comboReason` — 조합 선택 이유. **4단계 UI는 보류**, 필드만 유지
- 표시: `palette-display.ts` (`pickShortLabel`, `paletteCardTitle`)
- 화면: `PaletteScreen.svelte`, 미리보기 `PaletteHeroPreview.svelte` + `preview-ink.ts`. 역할 구간은 `role-assignment.ts`의 `roleForSlotRatio`. 상세는 plan.md §5.5·§6.2.

5단계 `review` (요약):

- `brandImageFeel`, `keyColorRowId`, `usageSelections`, `usageReasonChoice`, `usageReasonCustom`
- `primaryRoleQuiz` — 화면 없음, JSON 호환
- 목업: 분야와 무관한 `mokup-all.svg`, 칠하기 `mood-mokup-all-recolor.ts`
- 화면: `ReviewScreen.svelte`. 상세는 plan.md §5.6.

6단계 `plan` (요약):

- `fieldEdits`, `sectionEdits`, `decision`, `memo`, `acknowledgedFactSignature`
- 화면 편집은 슬롯 선택 이유. Markdown은 `plan-document.ts`의 `planView`
- PDF는 브라우저 인쇄. 화면: `PlanScreen.svelte`. 상세는 plan.md §5.7.

색과 비율을 변경하면 관련 화면이 동일한 상태를 기준으로 갱신되어야 한다.

화면마다 별도의 팔레트를 만들어 값이 서로 달라지지 않도록 한다.

대비 실습용 `compare` 색은 브랜드 `palette`와 분리한다. JSON v2 import 시 `mergeCompareFromRaw`, `mergePaletteMetaFromRaw`로 구 필드 호환.

### 3.3 계산 로직 분리

다음 기능은 Svelte 화면 코드에서 분리해 TypeScript 함수로 작성한다.

- HEX 색 코드 검증
- 비율 합계 계산
- 나머지 색의 비율 재배분
- 주조색·보조색·강조색 역할 계산
- 대비 계산
- 작업 파일 검증
- 템플릿 기획서 생성

비율 규칙이 변경되어도 여러 화면을 각각 수정하지 않도록 한다.

### 3.4 저장 로직 분리

Svelte 컴포넌트에서 localStorage를 직접 호출하지 않는다.

별도의 저장 모듈을 통해 작업을 읽고 저장한다.

향후 서버 DB를 도입하면 저장 모듈을 확장하고, 화면은 기존 호출 구조를 최대한 유지한다.

---

## 4. 초기 실행 구조

1. 정적 호스팅에서 웹앱을 불러온다.
2. 브라우저에 저장된 작업이 있는지 확인한다.
3. 작업을 새로 시작하거나 이어서 진행한다.
4. 입력과 조작 결과를 Svelte 상태에 반영한다.
5. 변경 내용을 브라우저 저장소에 보관한다.
6. 템플릿으로 컬러디자인 계획 초안을 작성한다.
7. 사용자가 결과를 복사하거나 파일로 내려받는다.

초기 버전에서는 학습자의 브랜드 정보와 작업 내용을 서버 DB에 전송하지 않는다.

외부 AI 호출도 수행하지 않는다.

---

## 5. SvelteKit 도입 여부

Svelte와 SvelteKit은 구분한다.

초기 MVP는 Svelte + Vite 기반의 단일 페이지 웹앱으로 구현하는 방식을 제안한다.

학습 단계 이동은 앱 내부 상태로 관리하고, 초기에는 별도의 라우팅 라이브러리를 필수로 도입하지 않는다.

SvelteKit은 초기 필수 구성에 포함하지 않는다.

향후 서버 기능이나 URL별 화면 관리가 필요해지면 다음 두 방식을 비교한다.

- 기존 Svelte 앱에 별도 서버 API 연결
- SvelteKit으로 앱 구조 확장

SvelteKit 도입 자체가 DB·로그인·결제 기능의 완성을 의미하지 않는다. 해당 기능은 별도 설계와 구현이 필요하다.

---

## 6. 폴더 구조 제안

src/
  App.svelte
  main.ts

  screens/
    StartScreen.svelte
    BrandScreen.svelte
    LearnScreen.svelte
    CompareScreen.svelte
    PaletteScreen.svelte
    ReviewScreen.svelte
    PlanScreen.svelte

  components/
    BrandMoodboardPanel.svelte
    ReviewPaletteColorRow.svelte
    PaletteBarSegments.svelte
    ApplyFieldReferenceImage.svelte
    ColorPicker.svelte
    PaletteBar.svelte
    BrandPreview.svelte
    PaletteHeroPreview.svelte
    SaveStatus.svelte

  state/
    project-state.svelte.ts

  types/
    project.ts
    content.ts

  domain/
    color-validation.ts
    contrast.ts
    ratio-calculation.ts
    role-assignment.ts
    compare-ux.ts
    compare-normalize.ts
    palette-display.ts
    preview-ink.ts
    learn-brand-pick.ts
    learn-normalize.ts
    project-validation.ts
    project-file.ts
    draft-template.ts
    plan-document.ts
    palette-preview-context.ts
    accent-part-ratios.ts
    mood-mokup-all-recolor.ts
    mood-mokup-color-map.ts
    brand-moodboard-svg.ts
    review-normalize.ts

  data/
    review-activities.ts
    brand-moodboard.ts
    color-terms.json
    color-images.json
    learning-examples.json
    sources.json

  services/
    project-storage.ts
    project-export.ts
    project-import.ts
    draft-generator.ts

  styles/
    tokens.css
    global.css

Svelte 상태 관리 방식에 따라 상태 모듈의 확장자와 세부 구성은 조정할 수 있다.

---

## 7. 향후 확장을 위한 경계

| 기능 | 초기 구현 | 후속 확장 |
|---|---|---|
| 작업 저장 | localStorage | 서버 API와 DB |
| 사용자 구분 | 현재 브라우저의 작업 | 로그인 계정별 작업 |
| 계획 생성 | 템플릿 | 서버에서 AI API 호출 |
| 결과 보관 | 사용자 파일 다운로드 | 계정별 결과물 보관 |
| 고급 기능 권한 | 초기 미구현 | 서버에서 이용 권한 검증 |
| 결제 | 초기 미구현 | 결제 서비스 및 권한 연결 |

핵심 색 계산과 학습 UI는 저장 방식이나 계정 기능과 독립적으로 유지한다.

후속 DB·계정·결제 도입 시 필요한 서버, 권한, 데이터 이전 작업은 별도로 수행한다.

---

## 8. 기존 개발기획서에 적용할 변경

- ‘스텔스 개발’ 관련 설명을 삭제한다.
- ‘프레임워크 미정’을 ‘Svelte 확정’으로 변경한다.
- Vite와 TypeScript를 초기 구현 제안에 추가한다.
- 화면과 UI는 .svelte 컴포넌트로 구성한다.
- 계산·검증·저장·기획서 생성은 별도 모듈로 유지한다.
- 기술 스택 결정 항목에서 프런트엔드 프레임워크 선택을 제외한다.
- 패키지 버전과 배포 서비스는 개발 착수 시 결정한다.
- 기존 학습 흐름, 기능 범위, 배색 규칙의 미정 사항은 유지한다.