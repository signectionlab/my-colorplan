# 활용 분야 참고 PNG (`apply-{id}.png`)

- Copyright: © SINGECTION LAB 2026

**2단계** `LearnScreen` 맥락 카드에서만 사용 (`/images/apply-fields/apply-{id}.png`).

- **1단계** 분야 선택 UI: 아이콘 카드만(참고图 없음).
- **5·6단계** 적용 장면: **본 PNG가 아닌** 통합 SVG `mokup-all.svg` 1장(분야별로 파일을 바꾸지 않음) — [`mood-mokup-assets.md`](./mood-mokup-assets.md).

코드: [`apply-field-reference-image.ts`](../src/data/apply-field-reference-image.ts), [`ApplyFieldReferenceImage.svelte`](../src/components/ApplyFieldReferenceImage.svelte).

## 파일

| id | public 베이스 | 2단계 미리보기 |
|----|---------------|----------------|
| space | `apply-space.png` | 있음 |
| product | `apply-product.png` | placeholder 가능 |
| online | `apply-online.png` | placeholder 가능 |
| print | `apply-print.png` | placeholder 가능 |
| service | `apply-service.png` | placeholder 가능 |
| other | — | 없음 |

## 스펙 (베이스)

- 비율 **16:10**, 권장 **1200×750** ~ **1600×1000**
- alt: `applyFieldReferenceImageAlt`

## (참고) Canvas 마스크 · Tier 2

아래는 **PNG 기반 hero 합성**(`ApplyFieldRecolorHero` 등)용 자산 정의이다. STEP 5 목업과는 별 트랙이며, **6단계 계획서**에서 활용 분야 칸의 참고 그림으로 쓸 수 있다(`hasApplyFieldRecolor`이면 hero, 아니면 참고 PNG).

| id | 주조 마스크 | 보조 마스크 | 강조 마스크 | 비고 |
|----|-------------|-------------|-------------|------|
| space | `apply-space-mask-primary.png` | `apply-space-mask-secondary.png` | `apply-space-mask-accent.png` | `APPLY_FIELD_RECOLOR_READY` |
| product / online / print / service | (후속) | (후속) | (후속) | Tier 1 wash fallback |

- 마스크: 베이스와 동일 크기, 흰=칠함·검=유지.
- 강조 2색 중 **첫 강조**만 accent 마스크; 둘째는 UI·칩.
