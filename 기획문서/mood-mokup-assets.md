# STEP 5·6 적용 목업 SVG (`public/images/mood-mokup/mokup-all.svg`)

- Copyright: © SINGECTION LAB 2026

**2단계** 참고 PNG(`apply-field-assets.md`)와 **별도** 에셋이다. 5단계와 6단계 계획서 미리보기는 **같은 SVG 1장**만 쓴다. 1단계 활용 분야는 제목 줄의 글자로만 보이고, SVG 파일을 바꾸지 않는다.

- 사용자 이미지 업로드 없음.
- 4단계 팔레트 hex·강조 1~3 슬롯을 런타임에 SVG에 칠한다(`applyMokupAllPalette`).
- 코드: [`brand-moodboard.ts`](../src/data/brand-moodboard.ts) (`MOKUP_ALL_SVG_URL`, `moodMokupSvgUrlForField`), [`BrandMoodboardPanel.svelte`](../src/components/BrandMoodboardPanel.svelte), [`mood-mokup-all-recolor.ts`](../src/domain/mood-mokup-all-recolor.ts).
- HEX 치환 엔진은 [`mood-mokup-color-map.ts`](../src/domain/mood-mokup-color-map.ts)의 `applyTemplateColorMap`. 면적 %로 역할을 나누지는 않는다.

## 파일

| 용도 | 파일 |
|------|------|
| **현재 5·6단계** | `mokup-all.svg` (`?v=6`) |
| 디스크에만 남은 분야별 SVG | `mokup-space.svg`, `mokup-product.svg`, `mokup-online.svg`, `mokup-print.svg`, `mokup-service.svg` — **패널이 읽지 않음** |

`moodMokupSvgUrlForField`는 `applyFieldId`가 `space`이든 `null`이든 `mokup-all.svg`만 반환한다.

## 색 입히기 (`mokup-all.svg`)

샘플 색과 Illustrator class를 사용자 역할 hex로 바꾼다. 둘 다 적용한다.

| 사용자 역할 | 샘플 HEX | class |
|-------------|---------|-------|
| 주조색 | `#99A7C1`, `#343845` | `cls-4`, `cls-6` |
| 보조색 | `#B7A265` | `cls-5` |
| 강조색1 | `#FFFFFF`, `#FFF`, `#fff` | `cls-3` |
| 강조색2 | `#FF57FF` | `cls-2` |
| 강조색3 | `#00CBE7` | `cls-1` |

- `<image>` 래스터와 XML 선언은 화면 삽입 전에 제거한다.
- 강조 슬롯 hex는 [`paletteAccentSlotHexes`](../src/domain/palette-preview-context.ts). 비어 있는 강조 2·3은 호출 측에서 강조색1과 같은 hex를 넘긴다.
- 목업 픽셀 면적 % = 4단계 막대 %와 1:1이 아님(분위기·역할 확인용).

## UI

- 5단계 카드 제목: **내 브랜드 컬러 적용 결과**. 배지 `STEP 5 · 적용과 점검`.
- 무드보드 스테이지: 패널 가로 **70%**, 중앙 정렬([`brand-moodboard-panel.css`](../src/components/brand-moodboard-panel.css)).
- 하단 **4장면 이름 리스트(구 합성 목업 범례)는 사용하지 않음**.
- 6단계 계획서의 「브랜드 적용 미리보기」도 같은 패널이다.

## 쓰지 않는 이전 경로

- 분야별 SVG, 매장 전용 고정표(`mood-mokup-space-recolor.ts`), `personalizeMoodMokupSvg` / `mood-mokup-palette.ts`는 **현재 코드에 없다**.
- `ApplyFieldMoodboard` · `apply-field-composite` · Tier 2 마스크는 2단계 참고 PNG·과거 실험용으로 남을 수 있다. PNG hero 합성 스펙은 `apply-field-assets.md`.
