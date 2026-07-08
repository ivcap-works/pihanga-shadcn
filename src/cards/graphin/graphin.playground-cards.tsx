/**
 * Tiny card registrations used exclusively by the Graphin playground examples.
 *
 * These are NOT part of the card library — they are demo-only components
 * showing how tooltip / context-menu content cards receive node context from
 * the Graphin card.  Imported (for side effects) by graphin.example.ts.
 */
import React from "react";
import {registerCardComponent} from "@pihanga2/core";
import type {TooltipContext} from "./tooltip.component";
import type {ContextMenuContext} from "./contextMenu.component";

// ---------------------------------------------------------------------------
// Demo tooltip card
// ---------------------------------------------------------------------------

type DemoTooltipProps = TooltipContext & {
  cardName: string;
  parentCard: string;
};

/**
 * Minimal tooltip content card for the playground demo.
 *
 * In a real app you'd replace this with any PiCard (a Typography, a Stack
 * of fields, even a DataTable) — the same `elementID` and `elementData`
 * context props are always forwarded to whatever card you point `tooltip.node`
 * at.
 */
function DemoTooltipCard(props: DemoTooltipProps): React.ReactNode {
  const displayName =
    (props.elementData?.displayName as string | undefined) ?? props.elementID;
  const extraFields = Object.entries(props.elementData ?? {}).filter(
    ([k]) => k !== "displayName",
  );

  return (
    <div style={{minWidth: 160}}>
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: 13,
          lineHeight: 1.4,
        }}
      >
        {displayName}
      </p>
      {extraFields.map(([k, v]) => (
        <p key={k} style={{margin: "3px 0 0", fontSize: 11, opacity: 0.65}}>
          {k}: {String(v)}
        </p>
      ))}
    </div>
  );
}

registerCardComponent({
  name: "pg/graphin/demo-tooltip",
  component: DemoTooltipCard as Parameters<
    typeof registerCardComponent
  >[0]["component"],
});

// ---------------------------------------------------------------------------
// Demo context-menu card
// ---------------------------------------------------------------------------

type DemoContextMenuProps = ContextMenuContext & {
  cardName: string;
  parentCard: string;
};

/**
 * Minimal context-panel content card for the playground demo.
 *
 * The ContextMenuComponent already wraps it in a panel with a ✕ close button.
 * The `onClose` callback is forwarded here so custom cards can also dismiss
 * the panel programmatically (e.g. after a "Delete node" action).
 *
 * In a real app you'd render action buttons, a detailed form, or even a full
 * PiCard layout — whatever you need the panel to show for the clicked node.
 */
function DemoContextMenuCard(props: DemoContextMenuProps): React.ReactNode {
  const displayName =
    (props.elementData?.displayName as string | undefined) ?? props.elementID;
  const entries = Object.entries(props.elementData ?? {});

  return (
    <div style={{minWidth: 200}}>
      {/* Node name */}
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {displayName}
      </p>

      {/* ID */}
      {props.elementID && (
        <p style={{margin: "4px 0 0", fontSize: 11, opacity: 0.6}}>
          id: {props.elementID}
        </p>
      )}

      {/* All data fields */}
      {entries.length > 0 && (
        <table
          style={{
            marginTop: 10,
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k}>
                <td
                  style={{
                    padding: "2px 8px 2px 0",
                    opacity: 0.65,
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  {k}
                </td>
                <td style={{padding: "2px 0", fontWeight: 500}}>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Demo action button — calls onClose to dismiss the panel */}
      <button
        type="button"
        onClick={props.onClose}
        style={{
          marginTop: 14,
          padding: "5px 14px",
          borderRadius: 4,
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--muted))",
          cursor: "pointer",
          fontSize: 12,
          width: "100%",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

registerCardComponent({
  name: "pg/graphin/demo-context-menu",
  component: DemoContextMenuCard as Parameters<
    typeof registerCardComponent
  >[0]["component"],
});

// ---------------------------------------------------------------------------
// Demo custom-legend card
// ---------------------------------------------------------------------------

type DemoLegendProps = {
  cardName: string;
  parentCard: string;
};

/**
 * Example of a fully custom pihanga-card legend.
 *
 * In a real app you would derive the legend entries from Redux state —
 * e.g. to show only the node types actually present in the current graph.
 * This demo renders a hard-coded list using the same colours as the
 * "styled-nodes" / "legend" playground facets.
 */
function DemoLegendCard(_props: DemoLegendProps): React.ReactNode {
  const items = [
    {label: "Gateway", fill: "#e67e22", shape: "star"},
    {label: "Service", fill: "#2980b9", shape: "circle"},
    {label: "Database", fill: "#8e44ad", shape: "rect"},
    {label: "Connection", fill: "#555", shape: "line"},
  ] as const;

  return (
    <div style={{minWidth: 130}}>
      <p
        style={{
          margin: "0 0 8px",
          fontWeight: 600,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          opacity: 0.55,
        }}
      >
        Legend
      </p>
      {items.map(({label, fill, shape}) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <svg
            width={14}
            height={14}
            style={{flexShrink: 0, overflow: "visible"}}
          >
            {shape === "star" ? (
              <polygon
                points={Array.from({length: 10}, (_, i) => {
                  const a = (Math.PI * i) / 5 - Math.PI / 2;
                  const r = i % 2 === 0 ? 6 : 2.5;
                  return `${7 + r * Math.cos(a)},${7 + r * Math.sin(a)}`;
                }).join(" ")}
                fill={fill}
              />
            ) : shape === "rect" ? (
              <rect x={1} y={1} width={12} height={12} fill={fill} rx={1} />
            ) : shape === "line" ? (
              <line
                x1={0}
                y1={7}
                x2={14}
                y2={7}
                stroke={fill}
                strokeWidth={2}
              />
            ) : (
              <circle cx={7} cy={7} r={6} fill={fill} />
            )}
          </svg>
          <span style={{fontSize: 12}}>{label}</span>
        </div>
      ))}
    </div>
  );
}

registerCardComponent({
  name: "pg/graphin/demo-legend",
  component: DemoLegendCard as Parameters<
    typeof registerCardComponent
  >[0]["component"],
});
