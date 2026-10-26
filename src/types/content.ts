export type ColorTab = 'general' | 'adjective' | 'emotion' | 'keyword'

export type ColorEntry = {
  id: string
  name: string
  hex: string
  tab: ColorTab
  blurb: string
  provisional: true
}
