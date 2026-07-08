/**
 * LegendOverlay
 *
 * An absolutely-positioned legend panel rendered over the Graphin canvas.
 * Placed as a sibling of <Graphin> (not inside its tree) so it never
 * interferes with G6's event handling.
 *
 * Two content modes:
 *  - `cardName` — renders any registered Pihanga card as the legend body.
 *  - `items`    — renders a built-in list of SVG swatch + label rows.
 */
import React from "react";
import {Card} from "@pihanga2/core";
import type {GraphinLegend, GraphinLegendItem} from "./graphin.types";
import clsx from "clsx";

// ---------------------------------------------------------------------------
// Position helpers
// ---------------------------------------------------------------------------

const POSITION_STYLES: Record<
  NonNullable<GraphinLegend["position"]>,
  React.CSSProperties
> = {
  "top-left": {top: 12, left: 12},
  "top-right": {top: 12, right: 12},
  "bottom-left": {bottom: 12, left: 12},
  "bottom-right": {bottom: 12, right: 12},
};

// ---------------------------------------------------------------------------
// SVG shape swatch
// ---------------------------------------------------------------------------

const SWATCH = 14; // swatch size in px

function ShapeSwatch({
  shape = "circle",
  fill = "#4793AF",
  stroke = "transparent",
}: Pick<GraphinLegendItem, "shape" | "fill" | "stroke">): React.ReactNode {
  const h = SWATCH / 2;
  const r = h - 1;

  switch (shape) {
    case "line":
      return (
        <svg width={SWATCH * 1.5} height={SWATCH} style={{flexShrink: 0}}>
          <line
            x1={0}
            y1={h}
            x2={SWATCH * 1.5}
            y2={h}
            stroke={fill}
            strokeWidth={2}
          />
        </svg>
      );

    case "rect":
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <rect
            x={1}
            y={1}
            width={SWATCH - 2}
            height={SWATCH - 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
            rx={1}
          />
        </svg>
      );

    case "diamond": {
      const pts = `${h},1 ${SWATCH - 1},${h} ${h},${SWATCH - 1} 1,${h}`;
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1} />
        </svg>
      );
    }

    case "star": {
      const ir = r * 0.4;
      const pts = Array.from({length: 10}, (_, i) => {
        const angle = (Math.PI * i) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : ir;
        return `${h + rad * Math.cos(angle)},${h + rad * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1} />
        </svg>
      );
    }

    case "triangle": {
      const pts = `${h},1 ${SWATCH - 1},${SWATCH - 1} 1,${SWATCH - 1}`;
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1} />
        </svg>
      );
    }

    case "hexagon": {
      const pts = Array.from({length: 6}, (_, i) => {
        const angle = (Math.PI * i) / 3 - Math.PI / 6;
        return `${h + r * Math.cos(angle)},${h + r * Math.sin(angle)}`;
      }).join(" ");
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1} />
        </svg>
      );
    }

    case "ellipse":
      return (
        <svg width={SWATCH * 1.5} height={SWATCH} style={{flexShrink: 0}}>
          <ellipse
            cx={SWATCH * 0.75}
            cy={h}
            rx={SWATCH * 0.75 - 1}
            ry={r}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
          />
        </svg>
      );

    default: // circle
      return (
        <svg width={SWATCH} height={SWATCH} style={{flexShrink: 0}}>
          <circle
            cx={h}
            cy={h}
            r={r}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
          />
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Built-in items list
// ---------------------------------------------------------------------------

function BuiltInLegend({items}: {items: GraphinLegendItem[]}): React.ReactNode {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{display: "flex", alignItems: "center", gap: 7, fontSize: 12}}
        >
          <ShapeSwatch
            shape={item.shape}
            fill={item.fill}
            stroke={item.stroke}
          />
          <span style={{whiteSpace: "nowrap"}}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function LegendOverlay({
  legend,
  parentCard,
}: {
  legend: GraphinLegend;
  parentCard: string;
}): React.ReactNode {
  const posStyle = POSITION_STYLES[legend.position ?? "bottom-left"];

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    ...posStyle,
    backgroundColor: "var(--color-card, white)",
    border: "1px solid hsl(var(--border, 214 32% 91%))",
    padding: "10px 12px",
    borderRadius: "var(--radius, 4px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    zIndex: 10,
    pointerEvents: "none",
    ...legend.style,
  };

  return (
    <div className={clsx(legend.className)} style={wrapperStyle}>
      {legend.cardName ? (
        // Custom pihanga card — receives no special context; source data from
        // Redux state inside the card itself.
        <Card cardName={legend.cardName} parentCard={parentCard} />
      ) : legend.items && legend.items.length > 0 ? (
        <BuiltInLegend items={legend.items} />
      ) : null}
    </div>
  );
}
