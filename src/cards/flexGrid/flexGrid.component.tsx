import React from "react"
import { Card, PiCardProps, PiCardRef } from "@pihanga2/core"
import { FlexGridProps } from "./flexGrid.types"
import clsx from "clsx"

export const FlexGridComponent = (
  props: PiCardProps<FlexGridProps>,
): React.ReactNode => {
  const {
    cardName,
    cards = {},
    template,
    height = "auto", //'100vh',
    margin = 0,
    overflow = "hidden", // 'scroll',
    style,
    className,
    _cls,
  } = props

  // console.log("AREA", area)
  const _style = {
    display: "grid",
    gridGap: template.gap || "10px",
    height,
    margin,
    width: "100%",
    ...style?.root,
  }

  if (template.area) {
    const areaRows = template.area.map((rn) => `"${rn.join(" ")}"`)
    _style.gridTemplateAreas = areaRows.join(" ")
  }
  if (template.rows) {
    _style.gridTemplateRows = template.rows.join(" ")
  }
  if (template.columns) {
    _style.gridTemplateColumns = template.columns.join(" ")
  }

  function renderGridCard(v: [string, PiCardRef]): JSX.Element {
    const [name, gridCard] = v
    const _style = {
      overflow,
      ...style?.item,
    }
    if (template.area) {
      _style.gridArea = name
    }
    return (
      <div style={_style} data-pihanga-grid={name} key={name}>
        <Card cardName={gridCard} parentCard={cardName} />
      </div>
    )
  }

  return (
    <div
      style={_style}
      className={clsx(_cls("root"), className)}
      data-pihanga={cardName}
    >
      {Object.entries(cards).map(renderGridCard)}
    </div>
  )
}
