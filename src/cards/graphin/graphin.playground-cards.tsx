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
