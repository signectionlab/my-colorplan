# STEP 5 무드보드 목업 SVG (`public/images/mood-mokup/`)

**2단계** 참고 PNG(`apply-field-assets.md`)와 **별도** 에셋이다. 5단계는 1단계에서 선택한 **활용 분야 1개**에 대응하는 **합성 SVG 1장**만 표시한다(5탭·4장면 범례 없음).

- 사용자 이미지 업로드 없음.
- 4단계 팔레트 hex·강조 1~3 슬롯을 런타임에 SVG 마크업 치환(`personalizeMoodMokupSvg`).
- 코드: [`brand-moodboard.ts`](../src/data/brand-moodboard.ts), [`BrandMoodboardPanel.svelte`](../src/components/BrandMoodboardPanel.svelte), [`mood-mokup-palette.ts`](../src/domain/mood-mokup-palette.ts).

## 분야 → SVG

| 1단계 `applyFieldId` | 파일 | 팔레트 키 |
|----------------------|------|-----------|
| `space` | `mokup-space.svg` | `space` |
| `product` | `mokup-product.svg` | `product` |
| `online` | `mokup-online.svg` | `online` |
| `print` | `mokup-print.svg` | `print` |
| `service` | `mokup-service.svg` | `service` |
| `other` · null | `mokup-product.svg`(fallback) | `product` |

## 색 입히기 방식

| 분야 | 방식 | 구현 |
|------|------|------|
| **매장·공간** | 샘플 SVG **고정 HEX → 역할** 매핑표 | [`mood-mokup-space-recolor.ts`](../src/domain/mood-mokup-space-recolor.ts) |
| product / online / print / service | 템플릿 색 **면적 추정** + 4단계 막대 % 누적 → 주·보·강 | [`mood-mokup-color-map.ts`](../src/domain/mood-mokup-color-map.ts) |

목업 픽셀 면적 % = 4단계 막대 %와 1:1이 아님(분위기·역할 확인용).

## 매장·공간(`mokup-space.svg`) 치환표

| 사용자 역할 | 샘플 HEX (치환 대상) | 비고 |
|-------------|----------------------|------|
| 주조색 | `#FFFFFF`, `#fff` | |
| 보조색 | `#C9B185`, `#F2F2F2` | |
| 강조색1 | `#606060`, `#DDDACA` | 강조 1개만이면 1·2·3 슬롯 모두 1번 hex |
| 강조색2 | `#FFD985` | 미사용 슬롯 → 강조색1과 동일 |
| 강조색3 | `#27194F` | |
| **유지** | `#2D2D2B` 및 표에 없는 색 | SVG 형태·레이아웃 변경 없음 |

강조 슬롯 hex: [`paletteAccentSlotHexes`](../src/domain/palette-preview-context.ts) → STEP 5 패널 → `accentTertiaryHex`.

## UI

- 무드보드 스테이지: 패널 가로 **70%**, 중앙 정렬([`brand-moodboard-panel.css`](../src/components/brand-moodboard-panel.css)).
- 하단 **4장면 이름 리스트(구 합성 목업 범례)는 사용하지 않음**.

## (레거시) Canvas PNG 합성

`ApplyFieldMoodboard` · `apply-field-composite` · Tier 2 마스크는 **2단계 참고 PNG** 및 과거 5단계 실험용으로 코드베이스에 남을 수 있으나, **현재 STEP 5 메인 UI는 위 SVG 경로**이다. PNG hero 합성 스펙은 `apply-field-assets.md` 참고.
