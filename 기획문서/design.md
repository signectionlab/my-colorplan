<design-context>

---
version: alpha
name: Stripi-Inspired-design-analysis
description: >
  Stripi의 디자인 언어에서 영감을 받아 재해석한 디자인 시스템이다.
  금융 인프라 브랜드의 특성을 짙은 네이비 잉크색, 선명한 인디고 주조색,
  거의 모든 마케팅 페이지 상단 3분의 1에 반복적으로 배치되는
  분위기 있는 메시 그라데이션으로 표현한다.
  전용 서체인 Sohne의 가는 굵기인 300과 좁은 자간을 조합해
  편집 디자인처럼 밀도 있는 대형 제목을 만들며,
  금액과 숫자가 중요한 본문에는 숫자 폭이 일정한 서체 기능을 사용한다.
  버튼은 작고 간결한 캡슐 형태이며, 카드는 흰색에 가까운 배경 위에 배치한다.
  대시보드 영역은 명암 구성을 반전시켜 익숙한 어두운 앱 화면으로 전환한다.

colors:
  primary: "#533afd"
  primary-deep: "#4434d4"
  primary-press: "#2e2b8c"
  primary-soft: "#665efd"
  primary-bg-subdued-hover: "#b9b9f9"
  brand-dark-900: "#1c1e54"
  ink: "#0d253d"
  ink-secondary: "#273951"
  ink-mute: "#64748d"
  ink-mute-2: "#61718a"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f6f9fc"
  canvas-cream: "#f5e9d4"
  hairline: "#e3e8ee"
  hairline-input: "#a8c3de"
  ruby: "#ea2261"
  magenta: "#f96bee"
  lemon: "#9b6829"
  shadow-blue: "#003770"

typography:
  display-xxl:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: -1.4px
    fontFeature: ss01
  display-xl:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: -0.96px
    fontFeature: ss01
  display-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.64px
    fontFeature: ss01
  display-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: -0.26px
    fontFeature: ss01
  heading-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 22px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: -0.22px
    fontFeature: ss01
  heading-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: -0.2px
    fontFeature: ss01
  heading-sm:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-lg:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  body-tabular:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: -0.42px
    fontFeature: tnum
  button-md:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss01
  button-sm:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss01
  caption:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.39px
    fontFeature: tnum
  micro:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: ss01
  micro-cap:
    fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: 0.1px
    fontFeature: ss01

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-primary-pill-pressed:
    backgroundColor: "{colors.primary-press}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-on-dark:
    backgroundColor: "{colors.brand-dark-900}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  card-feature-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-featured:
    backgroundColor: "{colors.brand-dark-900}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-cream-band:
    backgroundColor: "{colors.canvas-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-dashboard-mockup:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-tabular}"
    rounded: "{rounded.lg}"
    padding: 24px
  pill-tag-soft:
    backgroundColor: "{colors.primary-bg-subdued-hover}"
    textColor: "{colors.primary-deep}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 8px
  nav-bar-on-mesh:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-on-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  footer-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
---

## 개요

Stripi의 디자인 언어는 메시 그라데이션에서 시작한다.

파스텔 크림색, 셔벗 오렌지색, 라벤더색, 선명한 인디고색, 루비 핑크색으로 이루어진 넓은 가로 띠가 거의 모든 마케팅 페이지 상단 3분의 1을 차지한다. 이는 브랜드를 즉시 알아볼 수 있게 하는 분위기 있는 배경이다.

텍스트와 제품 UI 목업은 `{colors.canvas}`인 흰색 바탕 위에 떠 있는 듯 배치되며, 그라데이션은 장식과 시각적 중심의 역할을 동시에 한다.

페이지 아래쪽은 다시 흰색으로 돌아간다. 기능 설명은 차가운 색조가 아주 옅게 들어간 미색인 `{colors.canvas-soft}` 위에 배치하고, 대시보드 제품 목업은 짙은 네이비의 IDE 또는 콘솔을 모방한 패널 형태로 합성한다.

색상 체계에는 두 가지 주요 역할이 있다.

**인디고**인 `{colors.primary}` — `#533afd`는 브랜드를 대표하는 행동 유도 버튼인 CTA의 색이다. 사용을 절제하며, 각 가로 구역에는 색이 채워진 캡슐형 버튼을 하나씩 배치한다.

**짙은 네이비**인 `{colors.ink}` — `#0d253d`는 공통 본문 글자색이다. 대시보드 목업, 강조 요금제, 대시보드 계열의 어두운 앱 화면에도 사용한다.

루비색인 `{colors.ruby}`와 마젠타색인 `{colors.magenta}`는 메시 그라데이션과 제품 UI 목업의 강조 점에 사용하며, 버튼 색으로는 사용하지 않는다.

타이포그래피는 굵기 300의 **Sohne**와 좁은 자간을 중심으로 구성한다. 이는 편집 디자인처럼 밀도 있는 대형 제목을 만드는 브랜드의 특징이다.

32–56px의 대형 제목에는 -1.4px에서 -0.64px 범위의 자간을 적용하며, 본문에는 자간 0을 적용한다. 금액과 숫자가 중요한 캡션 크기의 텍스트에는 OpenType의 `tnum` 기능과 -0.36px에서 -0.42px 범위의 좁은 자간을 적용한다.

모든 텍스트 역할에 `ss01` 스타일 세트를 활성화한다.

**주요 특징:**

- 모든 마케팅 히어로 영역에 메시 그라데이션 배경을 사용한다. 크림색·오렌지색·라벤더색·인디고색·루비색이 페이지 상단 3분의 1을 가로질러 부드럽게 번진다.
- 하나의 인디고색을 중심으로 CTA의 위계를 구성한다. 마케팅 화면에서 색이 채워진 버튼은 `{colors.primary}` 캡슐형 버튼으로 통일한다.
- Sohne의 가는 굵기 300을 대형 제목에 사용하고, 크기에 따라 -1.4px에서 -0.2px까지 좁은 자간을 적용한다.
- 금액이나 숫자가 들어가는 셀에는 숫자 폭을 일정하게 하는 `tnum`을 사용한다. 금융 데이터 브랜드의 성격을 은은하게 드러내는 요소다.
- 대시보드 영역에는 어두운 앱 스타일을 적용한다. 짙은 네이비의 제품 UI 목업을 흰색 배경 위에 합성하고, 그 안에는 코드나 대시보드 표를 자주 배치한다.
- 버튼은 `{rounded.pill}`인 9999px의 캡슐 형태이며, `8px 16px`의 간결한 안쪽 여백을 사용한다. 짧고 명확하며 업무 실행에 적합한 인상을 만든다.
- `{colors.canvas-cream}`을 사용하는 크림색 기능 카드는 파란색과 흰색 구역 사이에 따뜻한 변화를 주면서 브랜드의 색상 체계를 유지한다.

## 색상

> **참고 페이지:** 홈(`/`), `/payments`, `/pricing`, `dashboard.stripe.com/register/payments`.

### 브랜드 색상과 강조색

- **인디고** (`{colors.primary}` — `#533afd`): 브랜드를 대표하는 CTA 색상. 색이 채워진 캡슐형 버튼, 링크 강조, 그라데이션의 중심색에 사용한다.
- **딥 인디고** (`{colors.primary-deep}` — `#4434d4`): 더 짙은 인디고. 그라데이션의 중간 색상 지점과 눌림 상태의 조금 더 따뜻한 대체색으로 사용한다.
- **눌림 상태 인디고** (`{colors.primary-press}` — `#2e2b8c`): 기본 인디고의 눌림 상태를 강조하는 색상.
- **소프트 인디고** (`{colors.primary-soft}` — `#665efd`): 더 밝은 인디고. 제품 UI의 강조 요소와 차트 하이라이트에 사용한다.
- **옅은 인디고** (`{colors.primary-bg-subdued-hover}` — `#b9b9f9`): 부드러운 태그 배경에 사용하는 옅은 인디고.
- **브랜드 다크 900** (`{colors.brand-dark-900}` — `#1c1e54`): 강조 요금제와 대시보드의 프레임·주변 UI에 사용하는 짙은 네이비.
- **루비** (`{colors.ruby}` — `#ea2261`): 그라데이션과 차트 강조에 사용한다. 버튼에는 사용하지 않는다.
- **마젠타** (`{colors.magenta}` — `#f96bee`): 메시 그라데이션의 밝은 핑크색 지점에 사용한다.
- **레몬** (`{colors.lemon}` — `#9b6829`): 그라데이션 배경에서 따뜻한 셔벗 계열의 색상 지점으로 사용한다.

### 배경과 표면

- **캔버스** (`{colors.canvas}` — `#ffffff`): 기본 페이지 배경.
- **소프트 캔버스** (`{colors.canvas-soft}` — `#f6f9fc`): 차가운 색조의 미색. 그라데이션 히어로 아래의 기능 소개 구역에 사용한다.
- **크림 캔버스** (`{colors.canvas-cream}` — `#f5e9d4`): 기능 소개 구역을 채우는 따뜻한 크림색. 브랜드 화면에 색상의 변화를 준다.
- **가는 테두리** (`{colors.hairline}` — `#e3e8ee`): 카드와 표의 1px 테두리.
- **입력창 테두리** (`{colors.hairline-input}` — `#a8c3de`): 입력 필드에 사용하는 조금 더 차가운 색조의 가는 테두리.

### 컬러 칩 hairline (공통)

색 **면**을 보여 주는 UI(칩·스와치·적용 버튼·게이지 막대 등)는 배경이 흰 캔버스·카드와 구분되도록 **밝은 무채**일 때 항상 hairline을 둔다.

| 항목 | 규칙 |
| --- | --- |
| **판정** | `needsPickSwatchHairline(hex)` (`src/domain/color-chip.ts`) — 상대 휘도(luma) ≥ 225, RGB spread ≤ 28. **흰·거의 무채 밝은색**만 해당. 노랑 등 **유채 밝은색은 제외**. |
| **마크업** | `class="color-chip"` + `class:light={needsPickSwatchHairline(hex)}` |
| **스타일** | `src/styles/global.css` — `.color-chip.light`: inset 1px `{colors.hairline}`. 원형·작은 스와치 등 **외곽 1px**이 필요하면 `color-chip--hairline-border` 추가( inset 대신 `border: 1px`). |
| **선택 상태** | `.color-chip.light.current` — inset hairline 유지 + 바깥 primary 링(비교·적용 칩). |
| **적용 화면** | 1단계 `BrandImagePicker`, 2단계 `LearnScreen`, 3단계 `CompareScreen`, 4단계 `PaletteScreen`, `BrandColorPlan`, `BrandPickColorStrip`, 6단계 `PlanScreen` 등 **모든 컬러 칩**. |
| **글자 대비** | 1단계 hue·톤 칩 위 **약자·라벨** 가독성은 `isLightChip`(상대 휘도) + `light-ink` 등 **별도** — hairline 판정과 분리. |

### 텍스트

- **잉크** (`{colors.ink}` — `#0d253d`): 브랜드 전반의 기본 본문 글자색. 순수한 검정 대신 짙은 네이비를 사용한다.
- **보조 잉크** (`{colors.ink-secondary}` — `#273951`): 흰색 위에 표시하는 보조 텍스트.
- **옅은 잉크** (`{colors.ink-mute}` — `#64748d`): 도움말, 캡션, 표의 레이블.
- **옅은 잉크 2** (`{colors.ink-mute-2}` — `#61718a`): `ink-mute`와 거의 유사한 색으로 내비게이션에 사용한다.
- **주조색 위 텍스트** (`{colors.on-primary}` — `#ffffff`): 인디고 또는 짙은 네이비 배경 위에 사용하는 글자색.

### 상태 의미 색상

마케팅 시스템에서는 오류·성공 등의 상태를 위한 별도 색상 팔레트를 사용하지 않는다. 이러한 상태 표시는 대시보드 제품 UI에서 별도로 다룬다.

## 타이포그래피

### 글꼴

대형 제목과 UI에는 **Sohne**를 사용한다. Klim Type Foundry에서 라이선스를 제공하는 전용 서체이며, 굵기는 300과 400을 사용한다.

가변 글꼴인 `sohne-var`를 불러오고, 전역에서 `font-feature-settings: "ss01"`을 활성화한다. 이 스타일 세트는 영문 소문자 `a`를 단층 형태로 바꾸는 등 브랜드 타이포그래피의 특징을 만드는 대체 글자 형태를 적용한다.

Sohne를 사용할 수 없으면 가는 굵기의 **SF Pro Display**, 그다음 `system-ui` 순서로 대체한다.

브랜드 느낌을 최대한 가깝게 구현하려면 오픈소스 서체인 **Inter**에 굵기 300과 `font-feature-settings: "ss01"`을 적용하고, 대형 제목에는 `letter-spacing: -1.4px`를 사용한다.

### 크기와 위계

| 토큰 | 크기 | 굵기 | 줄 높이 | 자간 | 용도 |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 56px | 300 | 1.03 | -1.4px | 히어로 영역의 대표 제목 |
| `{typography.display-xl}` | 48px | 300 | 1.15 | -0.96px | 섹션 시작 제목 |
| `{typography.display-lg}` | 32px | 300 | 1.1 | -0.64px | 카드 제목·하위 섹션 |
| `{typography.display-md}` | 26px | 300 | 1.12 | -0.26px | 작은 카드 제목 |
| `{typography.heading-lg}` | 22px | 300 | 1.1 | -0.22px | 요금제 이름 |
| `{typography.heading-md}` | 20px | 300 | 1.4 | -0.2px | 섹션 소제목 |
| `{typography.heading-sm}` | 18px | 300 | 1.4 | 0 | 작은 섹션의 레이블 |
| `{typography.body-lg}` | 16px | 300 | 1.4 | 0 | 마케팅 본문의 도입 문장 |
| `{typography.body-md}` | 15px | 300 | 1.4 | 0 | 기본 UI 본문 |
| `{typography.body-tabular}` | 14px | 300 | 1.4 | -0.42px | 금액·숫자 표, `tnum` 사용 |
| `{typography.button-md}` | 16px | 400 | 1.0 | 0 | 캡슐형 버튼의 텍스트 |
| `{typography.button-sm}` | 14px | 400 | 1.0 | 0 | 작은 캡슐형 버튼의 텍스트 |
| `{typography.caption}` | 13px | 400 | 1.4 | -0.39px | 도움말·표 레이블 |
| `{typography.micro}` | 11px | 300 | 1.4 | 0 | 작은 안내 문구 |
| `{typography.micro-cap}` | 10px | 400 | 1.15 | 0.1px | 제목 위에 놓는 영문 대문자 소형 레이블 |

### 적용 원칙

- **가는 굵기가 브랜드의 특징이다.** 대형 제목은 항상 굵기 300으로 표시한다. 400 이상으로 높이면 브랜드 특유의 편집 디자인 같은 분위기가 약해진다.
- **대형 제목에는 좁은 자간을 사용한다.** 56px에서는 -1.4px, 20px에서는 -0.2px까지 크기에 맞춰 조정한다. 좁은 자간은 브랜드 타이포그래피의 핵심 특징이다.
- **금액에는 숫자 폭을 일정하게 적용한다.** 통화, 거래 금액, 수량이 표시되는 셀에는 `font-feature-settings: "tnum"`과 좁은 자간을 적용한다. 이 작은 디테일로 금융 브랜드의 성격을 드러낸다.
- **`ss01`을 전역으로 적용한다.** `body` 요소에 `font-feature-settings: "ss01"`을 설정해 모든 텍스트에 대체 글자 스타일을 활성화한다.

### 대체 글꼴 안내

Sohne는 전용 라이선스 서체다.

대형 제목의 대체 글꼴로는 Google Fonts에서 제공하는 오픈소스 **Inter**를 사용한다. 굵기 300, `letter-spacing: -1.4px`, `font-feature-settings: "ss01"`을 적용한다. 원문에서는 Inter를 가장 가까운 오픈소스 대체 서체로 제시한다.

본문에는 굵기 300의 Inter를 사용하고, 필요한 경우 `font-feature-settings: "tnum"`을 적용한다.

Helvetica나 기본 `system-ui` 설정은 피한다. 브랜드가 의도하는 것보다 무거운 인상을 줄 수 있다.

## 레이아웃

### 간격 체계

- **기본 단위:** 8px. 세밀한 조정을 위해 2px·4px·12px 보조 토큰을 사용한다.
- **토큰:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.huge}` 64px.
- **섹션 안쪽 여백:** 마케팅 화면은 64–96px, 대시보드·제품 화면은 32–48px.
- **카드 안쪽 여백:** 기능 카드는 32px, 대시보드 목업은 24px.

### 그리드와 컨테이너

- 마케팅 페이지는 약 1200px 너비의 컨테이너를 중앙에 배치하고, 상단 메시 그라데이션은 화면 양 끝까지 확장한다.
- 요금제는 1024px·768px 분기점을 기준으로 4열 → 2열 → 1열로 전환한다.
- 대시보드 제품 목업에는 자체 내부 그리드를 사용한다. 예를 들어 12열 표와 3열 카드 그리드를 정적인 합성 화면으로 표현한다.

### 여백 사용 원칙

메시 그라데이션은 페이지 상단 3분의 1을 차지하고, 그 아래 흰색 영역에는 넉넉한 여백을 둔다.

섹션 사이 간격은 대체로 96px로 구성한다. 사용자가 비교하고 행동하는 대시보드·요금제 페이지에서는 콘텐츠 간격을 32px 수준으로 줄인다.

## 입체감과 깊이

| 단계 | 표현 방식 | 용도 |
|---|---|---|
| 0 | 평면 | 기본 표면 |
| 1 | `box-shadow: rgba(0,55,112,0.08) 0 1px 3px` | 흰색 배경 위 카드의 가벼운 입체감 |
| 2 | `box-shadow: rgba(0,55,112,0.08) 0 8px 24px, rgba(0,55,112,0.04) 0 2px 6px` | 떠 있는 패널과 대시보드 목업 프레임 |
| 3 | 메시 그라데이션 배경 | 실제 그림자 대신 분위기 있는 색으로 만드는 브랜드의 주요 깊이 표현 |

### 장식적 깊이

메시 그라데이션 자체가 깊이를 만드는 핵심 체계다.

CSS 그라데이션 대신 레이어를 겹친 SVG나 큰 배경 이미지로 구현한다. 원문에서는 실제 메시의 유기적인 덩어리 형태를 CSS로 표현할 수 없다고 설명한다.

메시는 브랜드 특유의 떠 있는 듯한 인상을 만든다. 실제 그림자는 제품 UI 목업에 한정해 은은하게 사용한다.

## 형태

### 모서리 둥글기

| 토큰 | 값 | 용도 |
|---|---|---|
| `{rounded.xs}` | 4px | 가는 테두리의 태그, 표의 프레임 |
| `{rounded.sm}` | 6px | 입력 필드 |
| `{rounded.md}` | 8px | 작은 카드, 알림 |
| `{rounded.lg}` | 12px | 요금제 카드, 기능 카드 |
| `{rounded.xl}` | 16px | 대시보드 제품 목업의 프레임 |
| `{rounded.pill}` | 9999px | 모든 버튼과 캡슐형 태그 |

### 이미지의 형태

브랜드는 사진보다 **제품 UI 목업**을 더 많이 사용한다.

대시보드 합성 이미지는 IDE·터미널·대시보드의 프레임을 모방한다. `{rounded.lg}`인 12px 컨테이너 안에 넣고 은은한 `box-shadow`를 적용한다.

실제 사진은 고객 로고가 나열된 영역이나 드물게 등장하는 사례 소개 카드에 사용한다. 내부에 여백을 둔 4:3 비율로 배치하고 그림자는 적용하지 않는다.

## 컴포넌트

### 버튼

**`button-primary-pill`** — 시스템 전반의 주요 CTA.

- 배경: `{colors.primary}`
- 글자색: `{colors.on-primary}`
- 타이포그래피: `{typography.button-md}`
- 안쪽 여백: `{spacing.sm} {spacing.lg}`, 즉 8px 16px
- 모서리 둥글기: `{rounded.pill}`, 즉 9999px
- 눌림 상태인 `button-primary-pill-pressed`에서는 배경을 `{colors.primary-press}`로 변경한다.

**`button-secondary`** — 외곽선형 보조 버튼.

- 배경: `{colors.canvas}`
- 글자색: `{colors.primary}`
- 테두리: 1px solid `{colors.primary}`
- 기본 버튼과 동일한 캡슐 형태를 사용한다.

**`button-on-dark`** — 대시보드 또는 어두운 배경에 사용하는 버튼.

- 배경: `{colors.brand-dark-900}`
- 글자색: `{colors.on-primary}`
- 동일한 캡슐 형태를 사용한다.

### 카드와 컨테이너

**`card-feature-light`** — 흰색 배경의 기능 설명 카드.

- 배경: `{colors.canvas}`
- 안쪽 여백: `{spacing.xxl}`
- 모서리 둥글기: `{rounded.lg}`, 즉 12px
- 테두리: 1px `{colors.hairline}`
- 필요에 따라 1단계 그림자를 적용한다.

**`card-pricing`** — 일반 요금제 카드.

- 배경: `{colors.canvas}`
- 안쪽 여백: `{spacing.xxl}`
- 모서리 둥글기: `{rounded.lg}`
- 테두리: 1px `{colors.hairline}`
- 제목: `{typography.heading-lg}`
- 가격: `{typography.display-md}`
- 본문: `{typography.body-md}`
- CTA는 `button-primary-pill`을 사용해 카드 하단에 고정한다.

**`card-pricing-featured`** — 명암을 반전시킨 어두운 강조 요금제 카드.

- 배경: `{colors.brand-dark-900}`
- 글자색: `{colors.on-primary}`
- 나머지 구조는 `card-pricing`과 동일하다.
- 짙은 네이비 배경은 강조 요금제를 구분하는 브랜드의 특징이다.

**`card-cream-band`** — 따뜻한 변화를 주는 카드.

- 배경: `{colors.canvas-cream}`
- 글자색: `{colors.ink}`
- 안쪽 여백: `{spacing.xxl}`
- 모서리 둥글기: `{rounded.lg}`
- 인디고와 흰색이 반복되는 흐름 사이에 따뜻한 변화를 주는 용도로 사용한다.

**`card-dashboard-mockup`** — 대시보드·제품 UI 화면을 합성한 카드.

- 배경: `{colors.canvas}`
- 타이포그래피: `{typography.body-tabular}`, `tnum` 적용
- 안쪽 여백: `{spacing.xl}`, 즉 24px
- 모서리 둥글기: `{rounded.lg}`, 즉 12px
- 2단계 그림자 적용
- 코드 미리보기, 대시보드 표, 차트 카드 등 작은 목업을 내부에 중첩하는 경우가 많다.

### 입력창과 양식

**`text-input`** — 기본 입력 필드.

- 배경: `{colors.canvas}`
- 글자색: `{colors.ink}`
- 타이포그래피: `{typography.body-md}`
- 안쪽 여백: `{spacing.sm} {spacing.md}`, 즉 8px 12px
- 모서리 둥글기: `{rounded.sm}`, 즉 6px
- 테두리: 1px `{colors.hairline-input}`
- 포커스 상태인 `text-input-focused`에서는 테두리 색을 `{colors.primary}`로 변경한다.

### 내비게이션

**`nav-bar-on-mesh`** — 그라데이션 히어로 위에 떠 있는 상단 내비게이션.

- 배경: `{colors.canvas}`. 스크롤 상태에 따라 투명 배경을 사용할 수 있다.
- 글자색: `{colors.ink}`
- 안쪽 여백: `{spacing.lg} {spacing.xl}`
- 왼쪽에 워드마크 로고, 중앙에 주요 메뉴, 오른쪽에 로그인과 색이 채워진 `button-primary-pill`을 배치한다.

### 캡슐형 요소와 태그 및 칩

**`pill-tag-soft`** — 옅은 인디고 태그.

- 배경: `{colors.primary-bg-subdued-hover}`
- 글자색: `{colors.primary-deep}`
- 타이포그래피: `{typography.micro-cap}`
- 안쪽 여백: `4px 8px`
- 모서리 둥글기: `{rounded.pill}`

### 브랜드를 대표하는 컴포넌트

**메시 그라데이션 배경**

파스텔 크림색 → 셔벗 오렌지색 → 라벤더색 → 인디고색 → 루비 핑크색을 페이지 상단 3분의 1에 가로로 부드럽게 번지도록 배치한다.

단순한 CSS 그라데이션 대신 SVG 또는 큰 배경 이미지로 구현한다. 실제 메시에는 유기적인 덩어리 형태가 포함된다.

**합성 대시보드 목업**

여러 레이어로 구성한 가상의 제품 UI 이미지다.

왼쪽에는 IDE 패널, 중앙에는 대시보드 표, 오른쪽에는 차트 카드를 배치한다. 각 요소는 작은 크기로 표현하고, `{rounded.lg}` 컨테이너와 은은한 2단계 그림자를 사용한다.

이 합성 화면은 브랜드에서 이미지로 가장 자주 보여주는 특징적인 요소다.

**금액용 고정 폭 숫자 타이포그래피**

금액, 수량, 거래 값을 나타내는 모든 숫자에 `font-feature-settings: "tnum"`을 적용한다.

금융 인프라 플랫폼이라는 성격을 은은하게 드러내는 요소다.

**`link-on-light`** — 밝은 배경의 본문 링크.

- 글자색: `{colors.primary}`
- 타이포그래피: `{typography.body-md}`
- 기본 상태에서는 밑줄을 사용하지 않는다.

**`footer-light`** — 사이트 공통 푸터.

- 배경: `{colors.canvas}`
- 글자색: `{colors.ink-mute}`
- 타이포그래피: `{typography.caption}`
- 안쪽 여백: `{spacing.huge} {spacing.xl}`, 즉 64px 24px
- 4–6열의 링크 그룹, 소셜 아이콘, 작은 법적 고지 영역을 포함한다.

## 권장 사항과 금지 사항

### 권장 사항

- `{colors.primary}`는 색이 채워진 CTA와 본문 링크 강조에 사용한다. 각 가로 구역에 채움 버튼 하나를 배치하는 수준으로 절제한다.
- 모든 마케팅 히어로에 메시 그라데이션을 적용한다. 장식 없는 단색 배경의 히어로는 브랜드와 어울리지 않는다.
- 대형 제목은 굵기 300과 좁은 자간으로 표시한다. 가는 글자와 좁은 자간은 타이포그래피의 핵심 특징이다.
- 모든 금액·숫자 셀에 `font-feature-settings: "tnum"`을 사용한다.
- `body` 요소에 `font-feature-settings: "ss01"`을 전역으로 적용한다.
- 모든 기능 설명에는 합성 제품 UI 목업을 함께 배치한다. 브랜드는 “실제 제품을 보라”는 방식으로 설득한다.

### 금지 사항

- 대형 제목의 굵기를 300보다 높이지 않는다. 굵기 400에서는 브랜드 특유의 편집 디자인 같은 분위기가 사라진다.
- 문서에 정리된 그라데이션 색상인 크림색·오렌지색·라벤더색·인디고색·루비색·마젠타색 외에 새로운 강조색을 추가하지 않는다.
- 인디고인 `{colors.primary}`를 본문 글자색으로 사용하지 않는다. 본문 크기의 일반 텍스트가 아니라 CTA와 링크에 사용하는 색이다.
- 버튼의 안쪽 여백을 `8px 16px`보다 줄이지 않는다. 간결한 캡슐형 버튼은 브랜드의 업무 실행 중심 인상을 만드는 요소다.
- 금액 셀에서 `tnum`을 생략하지 않는다. 금융 데이터 브랜드의 특징이 약해진다.
- 버튼의 캡슐 형태를 일반적인 둥근 사각형으로 바꾸지 않는다.

## 반응형 동작

### 분기점

| 이름 | 너비 | 주요 변화 |
|---|---|---|
| 와이드 | ≥ 1440px | 메시 그라데이션을 화면 양 끝까지 확장하고 대시보드 합성 이미지를 전체 크기로 표시 |
| 데스크톱 | 1024–1440px | 기본 콘텐츠 최대 너비 적용, 요금제 4열 |
| 태블릿 | 768–1023px | 요금제 2열, 대시보드 합성 이미지를 2개 패널로 단순화 |
| 모바일 | < 768px | 요금제 1열, 햄버거 메뉴, 대형 제목을 56px에서 36px로 축소 |

### 터치 영역

- 모바일에서 캡슐형 버튼은 안쪽 여백을 조정해 최소 40×40px의 터치 영역을 확보한다. 더 작은 화면에서는 버튼을 44×44px로 확대해 WCAG AAA를 유지한다.
- 입력 필드는 최소 높이 40px를 유지한다.

### 축소 방식

- 대형 제목 크기는 분기점에 따라 56 → 48 → 32 → 26 → 22px로 단계적으로 조정한다.
- 모바일에서는 메시 그라데이션을 다시 배치해 색이 번지는 효과가 사라지지 않도록 한다.
- 모바일에서는 대시보드 합성 이미지를 단일 패널 목업으로 단순화한다. 여러 레이어가 겹친 구성은 데스크톱 이상에서만 표시한다.
- 요금제는 4열 → 2열 → 1열로 전환한다.

### 이미지 처리

제품 UI 합성 이미지에는 `srcset`을 사용하고, 주요 분기점에 따라 구도가 달라지는 크롭 이미지를 제공한다.

모바일에서는 사용자의 행동과 가장 관련 있는 내부 패널에 초점을 맞추고, 데스크톱에서는 여러 레이어로 구성된 전체 이미지를 보여준다.

## 반복 수정 가이드

1. 한 번에 하나의 컴포넌트에 집중한다.
2. 컴포넌트 이름과 토큰을 직접 참조한다. 예: `{colors.primary}`, `{button-primary-pill}-pressed`, `{rounded.pill}`.
3. 수정 후 `npx @google/design.md lint DESIGN.md`를 실행한다.
4. 새로운 변형은 별도 항목으로 추가한다.
5. 기본 본문에는 `{typography.body-md}`인 15px를 사용한다. 금액·숫자 셀에는 `{typography.body-tabular}`를 사용한다.
6. `body`에는 `ss01`을 전역 적용하고, 숫자 콘텐츠에는 요소별로 `tnum`을 적용한다.
7. 마케팅 히어로의 메시 그라데이션은 필수다. 장식 없는 단색 배경의 히어로는 브랜드의 일관성을 해친다.

## 마이 브랜드 컬러 캔버스 — 실습 화면 UI

교육 웹앱 실습 구간은 마케팅용 메시 그라데이션을 쓰지 않는다. `{colors.canvas}` / `{colors.canvas-soft}` / `{colors.stage}`(앱 토큰 `--stage`) 위에서 **학습자가 고른 색**이 가장 강한 시각 정보가 되도록 한다.

### 공통 실습 레이아웃

- 단계 헤더: `WorkStepHeader` — STEP n/6, 단계 제목, `{typography.body-lg}` lede.
- 주 행동: `{button-primary-pill}` 「다음단계」, 보조 `{button-secondary}` / `{button-ghost}`.
- 카드: `{colors.canvas}` 배경, `{colors.hairline}` 테두리, `{rounded.lg}`(12px) — 활동 단위 구분.
- 숫자·HEX: `{typography.body-tabular}` / `.tabular`, 대비 `{colors.ink-mute}`.

### 2단계 · 내 색 이해하기 (`LearnScreen`)

**위계 (위 → 아래)**

1. Lede — 핵심 질문(`screen-lede`).
2. 브랜드 맥락 카드 — 브랜드명, 활용 분야(참고 이미지), **전달하고 싶은 방향**(`keywordReason`). 2단계에 `keywords` 목록 줄 없음.
3. **pick-row** — 「1단계에서 고른 색」; 활동 1용 `focusPickKey` 선택.
4. **활동 1** 카드 — `focusPick` 있을 때만. `.step-badge` + hero-card(형용사), 색 이름 표, 밝기/비슷한 톤 탭(`.learn-tools`).
5. **활동 2** 카드 — 항상 표시. `.act2-color-nav`(이중 게이지 + 범례) → (가능 시) 톤 칩 → `compare-grid` 2열 → 인지 안내 → `act2-choice` 라디오 2개.

**활동 2 · 이중 게이지 (`act2-dual-gauge-layout`)**

- 왼쪽 행 라벨: 「1단계에서 고른 색」 / 「비교 후 선택」.
- 열 버튼(`.act2-nav-seg-btn`): `.act2-gauge-pair` — `.act2-gauge-fixed` + `.act2-gauge-choice`. 막대 `.act2-nav-seg-wrap`는 **테두리 없음**; `.act2-nav-seg-fill.color-chip.light` — 공통 hairline 규칙.
- **선택완료** 열: 아랫줄에 `.act2-nav-check`(✓). **비교 중** 열: 버튼 `.current` primary 테두리(게이지 막대 자체는 무테두리).
- 미선택 아랫줄: `.act2-nav-seg-placeholder`(—).

**선택 상태 (색만으로 표시하지 않음)**

- pick-row: `.pick-card.selected` — primary 2px + `aria-pressed`.
- 톤 비교: `.compare-card.chosen` + `.pick-badge` 「✓ 선택」; `act2-choice` 라디오 **내가 고른 색 / 비교할 색**만.

**스와치**

- 컬러 칩 hairline: **§ 컬러 칩 hairline (공통)** — `color-chip` + `needsPickSwatchHairline`.
- hero-card: 활동 1 full-width, 대비에 따라 `.hero-meta` ink/shadow.

**배경·장식**

- `.act2-color-nav`: `{colors.canvas-soft}` + hairline border.
- 활동 카드: `.step-badge`(global), `.card` / `.activity-act1` 구분.

**반응형**

- `< 640px`: pick-card 넓게; `compare-grid` 1열; `act2-nav-bar` grid 열 수 = pick 개수(가로 스크롤 없이 wrap/grid).
- 터치: compare-card padding ≥ 14px; 게이지 열 버튼 focus-visible outline.

### 3단계 · 색 비교하기 (`CompareScreen`)

**위계**

1. Lede + `compare` / `palette` 분리 `caption`.
2. **활동 1** — pick 칩·**지금 미리보기**·나란히 비교·비교 기준 버튼 2개. 「브랜드 색 확정」 카피 금지.
3. **활동 2** — 도형·배경 A/B 칩·양쪽 패널(배경 A/B **동일 색 불가**).

**스와치**

- compare 패널 배경은 `{colors.stage}`; 학습자가 고른 compare 색이 주 정보.
- 컬러 칩: **§ 컬러 칩 hairline (공통)** (`apply-chip`, `surround-shape` 포함).

**반응형**

- `< 640px`: compare-grid 1열; preset·btn-row wrap.

### 4~6단계 · 활동 카드 (2~3단계와 동일)

- `section.activity.card`, `p.step-badge`(STEP N · 활동/참고/내보내기), `h2.activity-title`, `p.activity-lede` — `global.css`.
- 4단계 `PaletteScreen`, 5단계 `ReviewScreen`, 6단계 `PlanScreen`.

### 4단계 · 내 팔레트 (`PaletteScreen`)

**위계**

1. **활동 1** — 1단계 pick + 색의 역할(`BrandColorPlan` / `role-tiles`).
2. **활동 2** — `PaletteRatioStackEditor`(경계 드래그) · 강조 분할(`accentPartRatios`) · `PaletteHeroPreview` · **기준안 저장** CTA.
3. **미구현(MVP)** — 「더 조정하기」 — `plan.md` §5.5.

**미리보기**

- `PaletteHeroPreview` + `palette-preview-context`(4·5단계 공통 accent derived).
- 강조 2색 pick 시 Hero CTA·막대 segment에 각각 반영.

**레이아웃**

- `@media (min-width: 960px)`: `grid` 1fr + 380px aside; 활동 3 패널 `sticky`.
- `< 960px`: 단일 열 — 활동 1 → 2 → 4 → 3(미리보기).

### 5단계 · 적용과 점검 (`ReviewScreen`)

**위계 (카드 4블록 + 푸터 네비)**

1. **무드보드 카드** — `activity-title` 「브랜드 무드보드」, `PaletteBarSegments`(범례 **컬러칩** `legend-swatch`), `BrandMoodboardPanel`(`moodboard-panel` 70% · `moodboard-stage` · SVG host).
2. **활동 1 카드** — `step-badge` 「STEP 5 · 활동 1」, 1단계 색 strip, `choice-fieldset` / `choice-option`(4단계와 동일 라디오 카드 스타일), follow-up `color-pick-grid`.
3. **활동 2 카드** — `palette-summary` 리스트, `primary-quiz-head`(주조 칩 + 질문), `learn-note`(칩 + 설명).
4. **활동 3 카드** — `usage-row`, `place-chip`(pill 토글), 활용 이유 라디오, optional `custom-reason` textarea.

**공통 색 행**

- `ReviewPaletteColorRow.svelte`: `.review-swatch`(2.25rem) + `.color-chip.color-chip--hairline-border` + `needsPickSwatchHairline` · 이름 · HEX · 역할·%.

**미리보기 구분**

- 막대 = 4단계 **비율·역할** 요약.
- 무드보드 = 분야별 **SVG** 목업(공간=고정 HEX 매핑, 기타=면적·% 매핑). 2단계 `apply-*.png`와 별도.

**1단계** — 분야 피커 아이콘만. **2단계** — 참고 PNG. **5단계** — `mokup-*.svg` only.

### design.md와 plan.md

화면 역할·저장 필드는 `기획문서/plan.md` §5.3~§5.5를 따른다. 토큰·컴포넌트 이름은 본 문서의 `{colors.*}`, `{rounded.*}`, 버튼 변형을 우선한다.

</design-context>

생성하는 모든 UI에 위 디자인 시스템을 사용한다.