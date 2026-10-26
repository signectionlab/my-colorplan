import type { CompareSnapshot, PaletteColor, PaletteSnapshot, Project } from '../types/project'

export function captureCompareBaseline(compare: Project['compare']): CompareSnapshot {
  return {
    background: compare.background,
    text: compare.text,
    shape: compare.shape,
  }
}

export function capturePaletteBaseline(palette: Project['palette']): PaletteSnapshot {
  return {
    colors: [
      { id: palette.colors[0].id, name: palette.colors[0].name, hex: palette.colors[0].hex },
      { id: palette.colors[1].id, name: palette.colors[1].name, hex: palette.colors[1].hex },
      { id: palette.colors[2].id, name: palette.colors[2].name, hex: palette.colors[2].hex },
    ],
    ratios: [...palette.ratios],
    roles: [...palette.roles],
  }
}

export function applyPaletteBaseline(colors: [PaletteColor, PaletteColor, PaletteColor], baseline: PaletteSnapshot) {
  baseline.colors.forEach((color, index) => {
    colors[index].name = color.name
    colors[index].hex = color.hex
  })
}
