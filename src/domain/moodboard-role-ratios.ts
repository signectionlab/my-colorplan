import type { PaletteBarSegment } from './palette-preview-context'
import type { MoodboardRoleRatios } from './mood-mokup-color-map'

/** 4단계 막대 segment → 목업 칠하기용 주·보·강 % */
export function moodboardRoleRatiosFromBarSegments(segments: readonly PaletteBarSegment[]): MoodboardRoleRatios {
  let primaryPct = 0
  let secondaryPct = 0
  let accentPct = 0

  for (const seg of segments) {
    if (seg.roleLabel === '주조색') primaryPct += seg.widthPct
    else if (seg.roleLabel === '보조색') secondaryPct += seg.widthPct
    else if (seg.roleLabel === '강조색') accentPct += seg.widthPct
  }

  return { primaryPct, secondaryPct, accentPct }
}
