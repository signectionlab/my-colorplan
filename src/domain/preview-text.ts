import { contrastRatio } from './contrast'

export type PreviewInk = {
  hex: string
  adjusted: boolean
  message: string
}

export function previewInk(
  background: string,
  palette: readonly { name: string; hex: string }[],
  readable: boolean,
): PreviewInk {
  const options = palette.filter((item) => item.hex)
  const ranked = options
    .map((item) => ({ item, score: contrastRatio(item.hex, background) ?? 0 }))
    .sort((left, right) => right.score - left.score)
  const chosen = ranked[0]
  const chosenHex = chosen?.item.hex ?? '#0d253d'
  const chosenName = chosen?.item.name?.trim() || '팔레트 색'
  const chosenScore = chosen?.score ?? 0

  if (!readable || chosenScore >= 4.5) {
    return {
      hex: chosenHex,
      adjusted: false,
      message: readable
        ? `글자는 팔레트의 ${chosenName}을 그대로 사용해요. 대비가 충분해 보정하지 않았어요.`
        : `글자는 팔레트의 ${chosenName}이에요. 보정하지 않았어요.`,
    }
  }

  const light = contrastRatio('#ffffff', background) ?? 0
  const dark = contrastRatio('#0d253d', background) ?? 0
  const hex = light >= dark ? '#ffffff' : '#0d253d'
  return {
    hex,
    adjusted: true,
    message: `읽기 쉽도록 글자를 ${hex}으로 바꿨어요. 이 색은 팔레트에 넣지 않았고, 고른 색도 바꾸지 않았어요.`,
  }
}
