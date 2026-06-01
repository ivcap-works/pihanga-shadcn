import { createCardDeclaration, PiCardRef } from "@pihanga2/core"

export const FLEX_GRID_CARD = "flex_grid"
export const FlexGrid = createCardDeclaration<FlexGridProps>(FLEX_GRID_CARD)

export type FlexGridProps = {
  cards: { [name: string]: PiCardRef }
  template: TemplateT
  height?: string
  margin?: string
  overflow?: string

  style?: {
    root?: React.CSSProperties
    item?: React.CSSProperties
  }
  className?: string
}

// body {
//   display: grid;
//   grid-template-areas:
//     "header header header"
//     "nav article ads"
//     "footer footer footer";
//   grid-template-rows: 60px 1fr 60px;
//   grid-template-columns: 20% 1fr 15%;
//   grid-gap: 10px;
//   height: 100vh;
//   margin: 0;
//   }

// https://css-tricks.com/snippets/css/complete-guide-grid/
export type TemplateT = {
  area?: string[][] // name of card dict
  rows?: string[] // grid-template-rows (e.g ["min-content", "1fr",  "min-content"])
  columns?: string[] // grid-template-cols (e.g. ["1fr", "50px", "1fr", "1fr"])
  gap?: string
}
