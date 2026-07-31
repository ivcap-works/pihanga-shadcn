import React from "react";
import {
  createCardDeclaration,
  createOnAction,
  registerActions,
  type DispatchF,
  type ReduxAction,
} from "@pihanga2/core";
import type {GraphData, GraphOptions} from "@antv/g6";

export const GRAPHIN_CARD = "graphin";
export const Graphin = createCardDeclaration<GraphinProps, GraphinEvents>(
  GRAPHIN_CARD,
);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const GRAPHIN_ACTION = registerActions(GRAPHIN_CARD, [
  "node_hovered",
  "node_hover_end",
  "node_clicked",
  "node_dbl_clicked",
  "tooltip_open",
  "tooltip_close",
  "context_menu_open",
  "context_menu_close",
  "after_layout",
]);

export const onGraphinNodeHovered = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.NODE_HOVERED,
);
export const onGraphinNodeHoverEnd = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.NODE_HOVER_END,
);
export const onGraphinNodeClicked = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.NODE_CLICKED,
);
export const onGraphinNodeDblClicked = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.NODE_DBL_CLICKED,
);
export const onGraphinTooltipOpen = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.TOOLTIP_OPEN,
);
export const onGraphinTooltipClose = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.TOOLTIP_CLOSE,
);
export const onGraphinContextMenuOpen = createOnAction<GraphinNodeEventContext>(
  GRAPHIN_ACTION.CONTEXT_MENU_OPEN,
);
export const onGraphinContextMenuClose =
  createOnAction<GraphinNodeEventContext>(GRAPHIN_ACTION.CONTEXT_MENU_CLOSE);
export const onGraphinAfterLayout = createOnAction<GraphinAfterLayoutContext>(
  GRAPHIN_ACTION.AFTER_LAYOUT,
);

// ---------------------------------------------------------------------------
// Event context
// ---------------------------------------------------------------------------

/**
 * Payload carried by the `afterlayout` lifecycle event.
 */
export type GraphinAfterLayoutContext = Record<string, unknown> & {
  cardID: string;
};

/**
 * Payload carried by all node interaction events.
 * Also forwarded as props to tooltip / context-menu `PiCard` content cards
 * so they can render node-specific information.
 */
export type GraphinNodeEventContext<T = Record<string, unknown>> = {
  /** The G6 node id */
  nodeId: string;
  /** The node's `data` bag as stored in `GraphData` */
  nodeData?: T;
  /** Canvas x-coordinate of the pointer when the event fired */
  x: number;
  /** Canvas y-coordinate of the pointer when the event fired */
  y: number;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Convenience union of every built-in G6 layout-type string.
 *
 * | Value | Description |
 * |---|---|
 * | `"force-atlas2"` | Force Atlas 2 – general-purpose force (default) |
 * | `"force"` / `"gforce"` | Classic force-directed |
 * | `"d3-force"` | D3 force simulation |
 * | `"fruchterman"` | Fruchterman-Reingold force |
 * | `"dagre"` | Hierarchical / DAG (Dagre) |
 * | `"antv-dagre"` | AntV variant of Dagre |
 * | `"circular"` | Nodes arranged in a circle |
 * | `"concentric"` | Concentric rings ordered by degree |
 * | `"radial"` | Radial tree from a focal node |
 * | `"grid"` | Uniform grid |
 * | `"mds"` | Multi-dimensional scaling |
 * | `"random"` | Random positions |
 * | `"snake"` | Snake / serpentine path |
 * | `"fishbone"` | Fishbone / Ishikawa diagram |
 */
export type GraphinLayoutType =
  | "force-atlas2"
  | "force"
  | "gforce"
  | "d3-force"
  | "d3-force3d"
  | "fruchterman"
  | "fruchterman-gpu"
  | "dagre"
  | "antv-dagre"
  | "circular"
  | "concentric"
  | "radial"
  | "grid"
  | "mds"
  | "random"
  | "snake"
  | "fishbone";

export type GraphinProps = {
  data: GraphData;
  options?: Partial<Omit<GraphOptions, "data">>;

  /**
   * Shorthand for `options.layout.type`.  When provided it overrides whatever
   * layout type is set inside `options.layout`, while still preserving any
   * other layout parameters (e.g. `rankdir`, `preventOverlap`, …) you set
   * via `options`.
   *
   * Pass the full options as `options.layout` when you also need to tweak
   * layout-specific parameters.
   *
   * @default "force-atlas2"
   */
  layout?: GraphinLayoutType;

  /**
   * When `true` the default `zoom-canvas` behavior is removed, preventing
   * the user from zooming in/out with the scroll wheel.
   *
   * Useful when the graph is embedded inside a scrollable page and you do
   * not want accidental scroll events to zoom the canvas instead of
   * scrolling the page.
   *
   * You can still customise or re-enable zoom by passing a `zoom-canvas`
   * entry in `options.behaviors`.
   *
   * @default false
   */
  suppressZoom?: boolean;

  /**
   * When `true` the default `drag-canvas` behavior is removed, preventing
   * the user from **panning** (moving the entire canvas) by click-dragging
   * on the background.
   *
   * Useful when you want to lock the viewport (e.g. an embedded static
   * overview) or when touch-scroll conflicts with canvas pan on mobile.
   *
   * You can still customise or re-enable panning by passing a `drag-canvas`
   * entry in `options.behaviors`.
   *
   * @default false
   */
  suppressPan?: boolean;

  /**
   * When `true` the default `drag-element` behavior is removed, preventing
   * the user from **dragging individual nodes** to rearrange them after the
   * initial layout has been applied.
   *
   * By default nodes are freely repositionable.  Set this to `true` to
   * produce a read-only graph where the computed layout is preserved exactly.
   *
   * You can still customise or re-enable node dragging by passing a
   * `drag-element` entry in `options.behaviors`.
   *
   * @default false
   */
  suppressDrag?: boolean;

  /**
   * Initial zoom level of the canvas viewport.
   *
   * **Range:** `0.02` – `16`  (G6's default `zoomRange`)
   * - `1` = 100 % (actual size)
   * - `< 1` zooms out — e.g. `0.5` shows everything at 50 %
   * - `> 1` zooms in — e.g. `2` shows everything at 200 %
   *
   * Setting this prop automatically disables G6's default `autoFit: 'view'`
   * behaviour (which would otherwise fit the graph to the container and
   * override the requested zoom level).
   *
   * The user can still change the zoom interactively via scroll unless
   * `suppressZoom` is also set.
   *
   * @example 0.5  // 50 % — useful for large graphs; shows the full picture
   * @example 1    // 100 % — natural size
   * @example 2    // 200 % — start zoomed in on a small graph
   */
  zoomLevel?: number;

  /**
   * When `false` node labels are hidden globally.
   *
   * You can also hide/show labels on a per-style basis by setting
   * `showLabel: false` on individual entries in `nodeStyles`.
   *
   * @default true
   */
  showLabels?: boolean;

  /**
   * When `true` every edge is rendered with an arrowhead at its **target**
   * end, making the graph visually directed.
   *
   * You can override arrow style granularly via
   * `options.edge.style.endArrow` / `options.edge.style.startArrow`.
   *
   * @default false
   */
  directed?: boolean;

  /**
   * Hover tooltip — shown while the pointer is over a node or edge.
   * The specified `PiCardDef` is rendered inside a floating panel with
   * `pointerEvents: none`.  The card receives `GraphinNodeEventContext`
   * as extra props.
   */
  tooltip?: GraphinTooltip;
  /**
   * Context panel — opens when the user clicks a node and stays visible
   * until they click outside it or press the built-in ✕ close button.
   * The panel is interactive (`pointerEvents: auto`) and passes an
   * `onClose` callback as well as `GraphinNodeEventContext` to the card.
   */
  contextMenu?: GraphinContextMenu;

  /**
   * Serialisable map from **style name** → visual spec used to style nodes
   * without JavaScript functions in props (required for Redux serialisation).
   *
   * Nodes and edges reference a style by setting a string field in their
   * `data` object.  The field name defaults to `"style"` and can be
   * overridden with `nodeStyleKey`.
   *
   * The component builds the G6 style functions internally from this map, so
   * the layout engine never re-runs when styles change — use the
   * `dispatchGraphinUpdateNodeStyleMap` OP to update styles at runtime.
   *
   * @example
   * ```ts
   * nodeStyles: {
   *   gateway: { type: "star",   fill: "#e67e22", size: 48, labelFill: "#fff" },
   *   service: { type: "circle", fill: "#2980b9", size: 32, labelFill: "#fff" },
   *   db:      { type: "rect",   fill: "#8e44ad", size: 22, labelFill: "#fff" },
   * }
   * // node data:
   * { id: "gw", data: { displayName: "Gateway", style: "gateway" } }
   * ```
   */
  nodeStyles?: GraphinNodeStyleMap;

  /**
   * The field name inside `node.data` that holds the style name to look up
   * in `nodeStyles`.
   *
   * Useful when your data already has a different key (e.g. `"role"`,
   * `"type"`, `"category"`).
   *
   * @default "style"
   */
  nodeStyleKey?: string;

  /**
   * Legend overlay rendered as an absolutely-positioned panel over the graph.
   *
   * Two content modes:
   * - **`items`** — built-in swatch list (colour + shape + label).
   * - **`cardName`** — any registered Pihanga card used as a fully custom legend.
   *
   * @example
   * ```ts
   * legend: {
   *   position: "bottom-left",
   *   items: [
   *     { label: "Gateway", fill: "#e67e22", shape: "star" },
   *     { label: "Service",  fill: "#2980b9", shape: "circle" },
   *     { label: "Database", fill: "#8e44ad", shape: "rect" },
   *   ],
   * }
   * ```
   */
  legend?: GraphinLegend;

  style?: {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
  };
  className?: string;
};

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

/**
 * A single item in the built-in legend.
 */
export type GraphinLegendItem = {
  /** Text label displayed beside the shape swatch. */
  label: string;
  /** Fill colour of the swatch.  Defaults to `"#4793AF"`. */
  fill?: string;
  /** Stroke / border colour of the swatch. */
  stroke?: string;
  /**
   * Shape of the swatch marker.  Mirrors the values accepted by `nodeStyles`.
   * Use `"line"` for edge/connector legend entries.
   * @default "circle"
   */
  shape?:
    | "circle"
    | "rect"
    | "diamond"
    | "star"
    | "triangle"
    | "hexagon"
    | "ellipse"
    | "line";
};

/**
 * Legend overlay configuration.
 *
 * Two mutually-exclusive content modes:
 * - **`items`** — serialisable list of `{ label, fill, stroke, shape }` entries
 *   rendered as a built-in swatch list.
 * - **`cardName`** — name of any registered Pihanga card whose component is
 *   rendered as the legend body.  Takes priority over `items` when both are set.
 *   Use this for fully custom legends (images, interactive filters, etc.).
 */
export type GraphinLegend = {
  /**
   * Built-in legend items — each rendered as a small SVG shape swatch + label.
   * Ignored when `cardName` is also provided.
   */
  items?: GraphinLegendItem[];

  /**
   * Registered pihanga card name to use as the legend body.
   * The card is rendered inside the legend wrapper div; it receives no special
   * context props — source its data from Redux state as usual.
   */
  cardName?: string;

  /**
   * Corner of the graph container where the legend is anchored.
   * @default "bottom-left"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

  /**
   * Extra CSS class name(s) applied to the legend wrapper `<div>`.
   * @example "rounded-xl shadow-lg"
   */
  className?: string;

  /**
   * Inline style overrides for the legend wrapper `<div>`.
   * Merged on top of the built-in positioning styles.
   */
  style?: React.CSSProperties;
};

export type GraphinTooltip = {
  /** Registered card name whose component is rendered inside the floating panel. */
  node?: string;
  edge?: string;
  /**
   * Pixel gap between the pointer position and the top-left corner of the
   * tooltip panel.  Pass a single number for equal x/y offset, or
   * `[xOffset, yOffset]` to control each axis independently.
   *
   * @default 4
   */
  offset?: number | [number, number];
  /**
   * Extra CSS class name(s) applied to the tooltip wrapper `<div>`.
   * Use this to override the default background / border / shadow via
   * Tailwind utilities or your own CSS classes.
   *
   * @example "rounded-xl shadow-lg border-primary"
   */
  className?: string;
  /**
   * Inline style overrides for the tooltip wrapper `<div>`.
   * Merged on top of the built-in positioning / pointer-events styles so
   * you can safely override individual properties (e.g. `padding`, `zIndex`).
   */
  style?: React.CSSProperties;
};

export type GraphinContextMenu = {
  /** Registered card name whose component is rendered inside the click panel. */
  node?: string;
  edge?: string;
  /**
   * Pixel gap between the click point and the top-left corner of the context
   * panel.  Pass a single number for equal x/y offset, or
   * `[xOffset, yOffset]` to control each axis independently.
   *
   * @default 4
   */
  offset?: number | [number, number];
  /**
   * Extra CSS class name(s) applied to the context-menu wrapper `<div>`.
   * Use this to override the default background / border / shadow via
   * Tailwind utilities or your own CSS classes.
   *
   * @example "rounded-xl shadow-lg border-primary"
   */
  className?: string;
  /**
   * Inline style overrides for the context-menu wrapper `<div>`.
   * Merged on top of the built-in positioning / pointer-events styles so
   * you can safely override individual properties (e.g. `padding`, `zIndex`).
   */
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// Node style map
// ---------------------------------------------------------------------------

/**
 * Node shape types supported by G6 v5.
 */
export type GraphinNodeShape =
  | "circle"
  | "rect"
  | "diamond"
  | "star"
  | "triangle"
  | "hexagon"
  | "ellipse";

/**
 * Serialisable visual specification for a named node style.
 *
 * All fields are optional — unset fields fall back to the card's base style.
 */
export type GraphinNodeStyleDef = {
  /** Node shape.  @default "circle" */
  type?: GraphinNodeShape;
  /** Fill colour (CSS colour string). */
  fill?: string;
  /** Border colour. */
  stroke?: string;
  /** Border thickness in pixels. Alias: `strokeWidth` (takes precedence). */
  lineWidth?: number;
  /** Border thickness in pixels. Takes precedence over `lineWidth`. */
  strokeWidth?: number;
  /**
   * Node size in pixels.
   * Pass a number for a square/circle; pass `[width, height]` for a rectangle.
   */
  size?: number | [number, number];
  /** Fill opacity 0–1. */
  opacity?: number;
  /** Label text colour. */
  labelFill?: string;
  /** Label font size in pixels. */
  labelFontSize?: number;
  /**
   * When `false`, hides the label for nodes using this style.
   * Overrides the card-level `showLabels` prop for these nodes.
   * @default true
   */
  showLabel?: boolean;
};

/**
 * Map from **style name** → visual spec.
 *
 * Nodes reference a style by setting a string field in their `data` object
 * (default field name: `"style"`).  The component looks up that name here
 * and builds the G6 style functions internally — so no JavaScript functions
 * ever appear in props (safe for Redux serialisation).
 *
 * @example
 * ```ts
 * nodeStyles: {
 *   gateway: { type: "star",   fill: "#e67e22", size: 48 },
 *   service: { type: "circle", fill: "#2980b9", size: 32 },
 *   db:      { type: "rect",   fill: "#8e44ad", size: 22 },
 *   failed:  { fill: "#e74c3c", stroke: "#c0392b", lineWidth: 3 },
 * }
 * ```
 */
export type GraphinNodeStyleMap = Record<string, GraphinNodeStyleDef>;

// ---------------------------------------------------------------------------
// OP actions — dispatched FROM the app TO the card
// ---------------------------------------------------------------------------

/**
 * OP actions let external code drive G6 imperatively (highlight nodes,
 * zoom to a node, etc.) without touching `data` or `options` — so the
 * layout engine NEVER re-runs.
 *
 * Dispatch with the `dispatchGraphin*` helpers exported from this module.
 */
export const GRAPHIN_OP_ACTION = registerActions("graphin/op", [
  "set_node_styles",
  "clear_node_styles",
  "zoom_to_node",
  "update_node_style_map",
  "fit_view",
]);

// ── Action payloads ────────────────────────────────────────────────────────

/**
 * Payload for `GRAPHIN_OP_ACTION.SET_NODE_STYLES`.
 *
 * Sets the style-name field (determined by `nodeStyleKey`, default `"style"`)
 * on each specified node, then calls `graph.draw()` so the new style name is
 * looked up in `nodeStyles` and applied visually — **zero layout re-runs**.
 *
 * @example
 * ```ts
 * // Mark two nodes as failed; they will immediately render with the "failed"
 * // visual spec from the nodeStyles map.
 * dispatchGraphinSetNodeStyles(dispatch, {
 *   cardName: "myGraph",
 *   nodeStyles: { "db-u": "failed", "users": "degraded" },
 * });
 * ```
 */
export type GraphinSetNodeStylesAction = {
  cardName: string;
  /**
   * Map of `nodeId` → style name or ordered list of style names to merge
   * (each must be a key in the card's `nodeStyles` map).
   * When an array is given, styles are merged left-to-right with later entries
   * overriding duplicate properties from earlier ones.
   * @example { n1: "failed", n2: ["base", "degraded"], n3: "ok" }
   */
  nodeStyles: Record<string, string | string[]>;
};

/**
 * Payload for `GRAPHIN_OP_ACTION.CLEAR_NODE_STYLES`.
 *
 * Removes the style-name field from the specified nodes (or all nodes when
 * `nodeIds` is omitted), reverting them to the default `nodeStyles` fallback
 * appearance.  Calls `graph.draw()` — **zero layout re-runs**.
 *
 * @example
 * ```ts
 * // Restore all nodes to their default style
 * dispatchGraphinClearNodeStyles(dispatch, { cardName: "myGraph" });
 * ```
 */
export type GraphinClearNodeStylesAction = {
  cardName: string;
  /** Nodes to clear — omit to clear ALL nodes in the graph. */
  nodeIds?: string[];
};

/**
 * Payload for `GRAPHIN_OP_ACTION.ZOOM_TO_NODE`.
 *
 * Pans (and optionally zooms) the viewport so the target node is centred.
 */
export type GraphinZoomToNodeAction = {
  cardName: string;
  nodeId: string;
  /** Desired zoom level after centering.  Omit to keep the current zoom. */
  zoomLevel?: number;
  /** Animation duration in milliseconds.  @default 400 */
  duration?: number;
};

// ── Dispatch helpers ────────────────────────────────────────────────────────

/**
 * Set the style name on individual nodes — zero layout re-runs.
 *
 * The style name is written to the `nodeStyleKey` field in each node's data
 * bag, then `graph.draw()` is called so the `nodeStyles` map is re-evaluated
 * and the new colour / shape / size appears immediately.
 *
 * @example
 * ```ts
 * dispatchGraphinSetNodeStyles(dispatch, {
 *   cardName: "myGraph",
 *   nodeStyles: { "db-u": "failed", "users": "degraded" },
 * });
 * ```
 */
export const dispatchGraphinSetNodeStyles = (
  dispatch: DispatchF,
  payload: GraphinSetNodeStylesAction,
) => dispatch({...payload, type: GRAPHIN_OP_ACTION.SET_NODE_STYLES});

/**
 * Clear the style name from nodes (all nodes when `nodeIds` is omitted).
 * Nodes revert to the default fallback appearance defined in the component.
 *
 * @example
 * ```ts
 * dispatchGraphinClearNodeStyles(dispatch, { cardName: "myGraph" });
 * ```
 */
export const dispatchGraphinClearNodeStyles = (
  dispatch: DispatchF,
  payload: GraphinClearNodeStylesAction,
) => dispatch({...payload, type: GRAPHIN_OP_ACTION.CLEAR_NODE_STYLES});

/**
 * Pan (and optionally zoom) the viewport to centre a node.
 *
 * @example
 * ```ts
 * dispatchGraphinZoomToNode(dispatch, {
 *   cardName: "myGraph",
 *   nodeId:   "n3",
 *   zoomLevel: 1.5,
 *   duration:  600,
 * });
 * ```
 */
export const dispatchGraphinZoomToNode = (
  dispatch: DispatchF,
  payload: GraphinZoomToNodeAction,
) => dispatch({...payload, type: GRAPHIN_OP_ACTION.ZOOM_TO_NODE});

/**
 * Payload for `GRAPHIN_OP_ACTION.UPDATE_NODE_STYLE_MAP`.
 *
 * Merges (or replaces) style definitions in the card's live style map and
 * triggers a G6 re-draw — **without** re-running the layout engine.
 *
 * Use this to animate node colours, highlight failures, show traffic
 * intensity, etc. at runtime.
 */
export type GraphinUpdateNodeStyleMapAction = {
  cardName: string;
  /**
   * Style definitions to merge into the current map.
   * @example { failed: { fill: "#e74c3c", stroke: "#c0392b" } }
   */
  styles: GraphinNodeStyleMap;
  /**
   * When `true`, replaces the entire map instead of merging.
   * @default false
   */
  replace?: boolean;
};

/**
 * Merge new style definitions into the card's live node style map and
 * trigger a re-draw — zero layout re-runs.
 *
 * The style map is kept in a React ref inside the component so updates are
 * applied immediately without going through Redux state.
 *
 * @example
 * ```ts
 * // Mark "users" node style as failed (red) without touching node data
 * dispatchGraphinUpdateNodeStyleMap(dispatch, {
 *   cardName: "myGraph",
 *   styles: { service: { fill: "#e74c3c", stroke: "#c0392b" } },
 * });
 * ```
 */
export const dispatchGraphinUpdateNodeStyleMap = (
  dispatch: DispatchF,
  payload: GraphinUpdateNodeStyleMapAction,
) => dispatch({...payload, type: GRAPHIN_OP_ACTION.UPDATE_NODE_STYLE_MAP});

// ---------------------------------------------------------------------------
// OP: fitView
// ---------------------------------------------------------------------------

/**
 * Payload for `GRAPHIN_OP_ACTION.FIT_VIEW`.
 *
 * Fits (and optionally re-centres) the entire graph within the visible
 * container — the same effect as the initial `autoFit: 'view'`.
 */
export type GraphinFitViewAction = {
  cardName: string;
  /**
   * - `"view"` — zoom + pan so all nodes fit inside the viewport (default).
   * - `"center"` — pan to centre the graph without changing the zoom level.
   */
  mode?: "view" | "center";
};

/**
 * Fit the entire graph into the available canvas area.
 *
 * - `mode: "view"` (default) — zoom + pan so every node is visible.
 * - `mode: "center"` — pan to the graph centroid without changing zoom.
 *
 * @example
 * ```ts
 * // Zoom-to-fit after the user has panned/zoomed away
 * dispatchGraphinFitView(dispatch, { cardName: "myGraph" });
 *
 * // Re-centre without changing zoom
 * dispatchGraphinFitView(dispatch, { cardName: "myGraph", mode: "center" });
 * ```
 */
export const dispatchGraphinFitView = (
  dispatch: DispatchF,
  payload: GraphinFitViewAction,
) => dispatch({...payload, type: GRAPHIN_OP_ACTION.FIT_VIEW});

// Re-export ReduxAction so the Op handler can import it from here.
export type {ReduxAction};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type GraphinEvents = {
  /** Fired when the pointer enters a node */
  onNodeHovered: GraphinNodeEventContext;
  /** Fired when the pointer leaves a node */
  onNodeHoverEnd: GraphinNodeEventContext;
  /** Fired on a single click on a node */
  onNodeClicked: GraphinNodeEventContext;
  /** Fired on a double-click on a node */
  onNodeDblClicked: GraphinNodeEventContext;
  /** Fired when the hover tooltip becomes visible */
  onTooltipOpen: GraphinNodeEventContext;
  /** Fired when the hover tooltip is dismissed */
  onTooltipClose: GraphinNodeEventContext;
  /** Fired when the context-menu panel opens */
  onContextMenuOpen: GraphinNodeEventContext;
  /** Fired when the context-menu panel closes */
  onContextMenuClose: GraphinNodeEventContext;
  /** Fired when the G6 layout engine finishes positioning all nodes */
  onAfterLayout: GraphinAfterLayoutContext;
};
