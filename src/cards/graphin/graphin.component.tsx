import React, {useEffect, useRef} from "react";
import type {PiCardProps} from "@pihanga2/core";
import {Graphin, useGraphin} from "@antv/graphin";
import {type GraphOptions} from "@antv/g6";

import {
  type GraphinEvents,
  type GraphinNodeStyleMap,
  type GraphinProps,
} from "./graphin.types";
import clsx from "clsx";
import {cloneDeep, merge} from "lodash";
import {TooltipComponent} from "./tooltip.component";
import {ContextMenuComponent} from "./contextMenu.component";
import {GraphinEventDispatcher} from "./eventDispatcher.component";
import {GraphinOpHandler} from "./graphinOpHandler.component";

/**
 * Renderless child (must live inside a <Graphin> tree).
 * Keeps `nodeStylesRef` in sync with the `nodeStyles` prop and calls
 * graph.draw() to re-apply styles without re-running the layout.
 */
function NodeStyleWatcher({
  nodeStyles,
  nodeStylesRef,
}: {
  nodeStyles?: GraphinNodeStyleMap;
  nodeStylesRef: React.MutableRefObject<GraphinNodeStyleMap>;
}): null {
  const {graph, isReady} = useGraphin();

  useEffect(() => {
    nodeStylesRef.current = nodeStyles ?? {};
    if (isReady && graph) {
      void graph.draw();
    }
  }, [nodeStyles, graph, isReady, nodeStylesRef]);

  return null;
}

/**
 * Renderless child (must live inside a <Graphin> tree).
 * Calls graph.zoomTo() imperatively whenever `zoomLevel` changes so that
 * zoom updates work after initial mount — options.zoom is only read once.
 */
function ZoomController({zoomLevel}: {zoomLevel?: number}): null {
  const {graph, isReady} = useGraphin();

  useEffect(() => {
    if (!isReady || !graph || zoomLevel === undefined) return;
    graph.zoomTo(zoomLevel, {duration: 300});
  }, [graph, isReady, zoomLevel]);

  return null;
}

export const GraphinComponent = (
  props: PiCardProps<GraphinProps, GraphinEvents>,
): React.ReactNode => {
  const {
    cardName,
    data,
    options,
    layout,
    suppressZoom,
    suppressPan,
    suppressDrag,
    zoomLevel,
    directed,
    tooltip,
    contextMenu,
    style,
    className,
    _cls,
    onNodeHovered,
    onNodeHoverEnd,
    onNodeClicked,
    onNodeDblClicked,
    onTooltipOpen,
    onTooltipClose,
    onContextMenuOpen,
    onContextMenuClose,
    nodeStyles,
    nodeStyleKey,
  } = props;

  // ── nodeStyles ref ───────────────────────────────────────────────────────
  // Kept in a ref so G6 style functions can always read the LATEST map value
  // without rebuilding mergedOptions (which would re-run the layout).
  // Updated by NodeStyleWatcher (on prop change) and by GraphinOpHandler
  // (on OP action), both of which call graph.draw() to trigger a re-render.
  const nodeStylesRef = useRef<GraphinNodeStyleMap>(nodeStyles ?? {});
  const nodeStyleKeyRef = useRef(nodeStyleKey ?? "style");
  // Keep refs in sync on every render so their values are always fresh.
  nodeStylesRef.current = nodeStyles ?? {};
  nodeStyleKeyRef.current = nodeStyleKey ?? "style";

  const _style = {
    display: "flex",
    width: "100%",
    height: "100%",
    // Prevent the G6 WebGL/Canvas element from bleeding outside its container
    // and painting over sibling elements (controls panel, JSON viewer, etc.).
    overflow: "hidden",
    position: "relative" as const,
    ...style?.root,
  };

  // ── Build options (memoised) ────────────────────────────────────────────
  // IMPORTANT: `mergedOptions` must NOT be recreated on every render.
  // If a new object reference is passed to <Graphin options={...}> on each
  // render G6 calls graph.setOptions() / graph.layout() which snaps every
  // node back to its layout position, undoing any manual drag.
  const mergedOptions = React.useMemo<GraphOptions>(() => {
    const defOptions: GraphOptions = {
      data,
      autoResize: true,
      node: {
        style: {
          labelText: (d) => {
            return (d.data?.displayName || d.id) as string;
          },
          lod: {
            0: {labelFontSize: 10},
            1: {labelFontSize: 12},
            2: {labelFontSize: 6},
          },
        },
      },
      layout: {
        type: "force-atlas2",
        preventOverlap: true,
        kr: 20,
        // Run synchronously in one pass then stop so dragged nodes stay put.
        animation: false,
      },
      behaviors: [
        "drag-canvas",
        "drag-element",
        {
          type: "auto-adapt-label",
          enableAnimation: true,
          throttle: 100,
          padding: 0,
        },
        {
          type: "zoom-canvas",
          id: "zoom-canvas-1",
          fixSelectedItems: {fixLabel: true},
        },
      ],
      animation: true,
    };

    const merged = merge(cloneDeep(defOptions), options);

    // ── layout shorthand ──────────────────────────────────────────────────
    if (layout) {
      const existing = merged.layout;
      if (
        existing &&
        !Array.isArray(existing) &&
        typeof existing === "object"
      ) {
        (existing as Record<string, unknown>).type = layout;
      } else {
        merged.layout = {type: layout};
      }
    }

    // ── suppressZoom ──────────────────────────────────────────────────────
    if (suppressZoom && Array.isArray(merged.behaviors)) {
      merged.behaviors = merged.behaviors.filter((b) => {
        if (typeof b === "string") return b !== "zoom-canvas";
        if (typeof b === "object" && b !== null)
          return (b as Record<string, unknown>).type !== "zoom-canvas";
        return true;
      });
    }

    // ── suppressPan ───────────────────────────────────────────────────────
    if (suppressPan && Array.isArray(merged.behaviors)) {
      merged.behaviors = merged.behaviors.filter((b) => {
        if (typeof b === "string") return b !== "drag-canvas";
        if (typeof b === "object" && b !== null)
          return (b as Record<string, unknown>).type !== "drag-canvas";
        return true;
      });
    }

    // ── suppressDrag ──────────────────────────────────────────────────────
    if (suppressDrag && Array.isArray(merged.behaviors)) {
      merged.behaviors = merged.behaviors.filter((b) => {
        if (typeof b === "string") return b !== "drag-element";
        if (typeof b === "object" && b !== null)
          return (b as Record<string, unknown>).type !== "drag-element";
        return true;
      });
    }

    // ── zoomLevel ─────────────────────────────────────────────────────────
    // G6's autoFit ('view') runs after layout and overrides options.zoom.
    // Disable it when an explicit zoom is requested so the value is respected.
    // Range: [0.02, 16] — 1 = 100 %, 0.5 = 50 % (zoom out), 2 = 200 % (zoom in).
    if (zoomLevel !== undefined) {
      merged.zoom = zoomLevel;
      if (!merged.autoFit) {
        // only override when the caller hasn't set autoFit themselves
        merged.autoFit = undefined; // disables the default 'view' autoFit
      }
    }

    // ── directed ──────────────────────────────────────────────────────────
    if (directed) {
      merged.edge = merge(merged.edge ?? {}, {style: {endArrow: true}});
    }

    // ── nodeStyles ─────────────────────────────────────────────────────────
    // Build G6 style functions from the serialisable nodeStyles map.
    // The functions close over nodeStylesRef and nodeStyleKeyRef (both stable
    // refs) so G6 always reads the LATEST map on every draw — OP actions and
    // prop changes update the refs and call graph.draw() independently.
    if (nodeStyles !== undefined) {
      const getSpec = (d: {id?: string; data?: Record<string, unknown>}) => {
        const key = nodeStyleKeyRef.current;
        const name = d.data?.[key] as string | string[] | undefined;
        if (!name) return undefined;
        if (Array.isArray(name)) {
          return Object.assign(
            {},
            ...name.map((k) => nodeStylesRef.current[k] ?? {}),
          );
        }
        return nodeStylesRef.current[name];
      };

      const baseStyle = (merged.node?.style ?? {}) as Record<string, unknown>;
      merged.node = {
        ...merged.node,
        // Per-node shape driven by the style map
        type: (d: {id?: string; data?: Record<string, unknown>}) =>
          getSpec(d)?.type ?? "circle",
        style: {
          // Preserve defaults (labelText, lod) from defOptions
          ...baseStyle,
          fill: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.fill ?? "#4793AF",
          stroke: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.stroke ?? "#d2dde8",
          lineWidth: (d: {id?: string; data?: Record<string, unknown>}) => {
            const s = getSpec(d);
            return s?.strokeWidth ?? s?.lineWidth ?? 1;
          },
          size: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.size ?? 24,
          opacity: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.opacity ?? 1,
          labelFill: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.labelFill ?? "#000000",
          labelFontSize: (d: {id?: string; data?: Record<string, unknown>}) =>
            getSpec(d)?.labelFontSize ?? 12,
        },
      };
    }

    return merged;
    // NOTE: nodeStyles is intentionally excluded from deps.
    // Style functions close over nodeStylesRef (always current) so G6 sees
    // the latest values without rebuilding the options / re-running the layout.
    // NodeStyleWatcher (below) triggers graph.draw() when the prop changes.
    // nodeStyleKey is intentionally included as a change-trigger even though
    // it is not referenced directly in the callback body.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    options,
    layout,
    suppressZoom,
    suppressPan,
    suppressDrag,
    zoomLevel,
    directed,
    nodeStyles, // include so that the style functions are installed when
    nodeStyleKey, // nodeStyles is first provided (or key changes)
  ]);

  return (
    <div
      style={_style}
      className={clsx(_cls("root"), className)}
      data-pihanga={cardName}
    >
      <Graphin
        options={mergedOptions}
        style={{width: "inherit", height: "inherit"}}
      >
        {/* Hover tooltip — pointer-events: none floating card */}
        {tooltip && (
          <TooltipComponent
            contentCards={tooltip}
            parentCard={cardName}
            onOpen={onTooltipOpen}
            onClose={onTooltipClose}
          />
        )}

        {/* Context panel — interactive, click-to-open, outside-click-to-close */}
        {contextMenu && (
          <ContextMenuComponent
            contentCards={contextMenu}
            parentCard={cardName}
            onOpen={onContextMenuOpen}
            onClose={onContextMenuClose}
          />
        )}

        {/* Keeps nodeStylesRef in sync with prop; triggers graph.draw() on change */}
        {nodeStyles !== undefined && (
          <NodeStyleWatcher
            nodeStyles={nodeStyles}
            nodeStylesRef={nodeStylesRef}
          />
        )}

        {/* Applies explicit zoom imperatively — options.zoom is only read on mount */}
        <ZoomController zoomLevel={zoomLevel} />

        {/* Handles OP actions (setNodeStyles, clearNodeStyles, zoomToNode, updateNodeStyleMap) */}
        <GraphinOpHandler
          cardName={cardName}
          nodeStylesRef={nodeStylesRef}
          nodeStyleKeyRef={nodeStyleKeyRef}
        />

        {/* Bridges G6 node events to Pihanga action dispatchers */}
        <GraphinEventDispatcher
          onNodeHovered={onNodeHovered}
          onNodeHoverEnd={onNodeHoverEnd}
          onNodeClicked={onNodeClicked}
          onNodeDblClicked={onNodeDblClicked}
        />
      </Graphin>
    </div>
  );
};
