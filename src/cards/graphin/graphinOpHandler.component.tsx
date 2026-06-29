/**
 * GraphinOpHandler
 *
 * A renderless child component (must live inside a <Graphin> tree) that
 * subscribes to Graphin OP actions dispatched from anywhere in the app and
 * executes the corresponding G6 imperative calls.
 *
 * Using usePiReducer() here means the handler receives actions directly from
 * Redux WITHOUT touching options / data, so the layout engine NEVER re-runs.
 * This makes it safe to call at high frequency (e.g. per-frame animations,
 * real-time colour updates, highlight pulses, etc.).
 */
import {useRef} from "react";
import {useGraphin} from "@antv/graphin";
import {usePiReducer, type ReduxState} from "@pihanga2/core";
import {
  GRAPHIN_OP_ACTION,
  type GraphinNodeStyleMap,
  type GraphinSetNodeStylesAction,
  type GraphinClearNodeStylesAction,
  type GraphinZoomToNodeAction,
  type GraphinUpdateNodeStyleMapAction,
  type ReduxAction,
} from "./graphin.types";

export type GraphinOpHandlerProps = {
  cardName: string;
  nodeStylesRef: React.MutableRefObject<GraphinNodeStyleMap>;
  /** Ref to the current nodeStyleKey (defaults to "style"). */
  nodeStyleKeyRef: React.MutableRefObject<string>;
};

export function GraphinOpHandler({
  cardName,
  nodeStylesRef,
  nodeStyleKeyRef,
}: GraphinOpHandlerProps): null {
  const {graph, isReady} = useGraphin();

  // Use refs so the mapper closures always call the latest graph instance
  // without needing to tear down and re-register the reducers on each render.
  const graphRef = useRef(graph);
  graphRef.current = graph;
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  // ── OP: setNodeStyles ────────────────────────────────────────────────────
  // Writes a style name into the nodeStyleKey field of each specified node's
  // data bag, then calls graph.draw() so the nodeStyles map is re-evaluated
  // and the new colour / shape / size appears immediately — zero layout re-runs.
  //
  // Example dispatch:
  //   dispatchGraphinSetNodeStyles(dispatch, {
  //     cardName: "myGraph",
  //     nodeStyles: { "db-u": "failed", "users": "degraded" },
  //   });
  usePiReducer<ReduxState, GraphinSetNodeStylesAction & ReduxAction>(
    GRAPHIN_OP_ACTION.SET_NODE_STYLES,
    (_, a) => {
      if (a.cardName !== cardName) return;
      const g = graphRef.current;
      if (!isReadyRef.current || !g) return;
      try {
        const key = nodeStyleKeyRef.current;
        const updates = Object.entries(
          a.nodeStyles as Record<string, string>,
        ).map(([id, styleName]) => ({id, data: {[key]: styleName}}));
        g.updateNodeData(updates);
        void g.draw();
      } catch {
        // noop
      }
    },
    cardName,
  );

  // ── OP: clearNodeStyles ──────────────────────────────────────────────────
  // Clears the styleKey field from the specified nodes (or ALL nodes when
  // nodeIds is omitted), reverting them to the default fallback appearance.
  // Calls graph.draw() — zero layout re-runs.
  //
  // Example dispatch:
  //   dispatchGraphinClearNodeStyles(dispatch, {
  //     cardName: "myGraph",
  //     // nodeIds: ["n1"],   ← omit to clear every node
  //   });
  usePiReducer<ReduxState, GraphinClearNodeStylesAction & ReduxAction>(
    GRAPHIN_OP_ACTION.CLEAR_NODE_STYLES,
    (_, a) => {
      if (a.cardName !== cardName) return;
      const g = graphRef.current;
      if (!isReadyRef.current || !g) return;
      try {
        const key = nodeStyleKeyRef.current;
        const nodeIds: string[] =
          (a.nodeIds as string[] | undefined) ??
          g.getNodeData().map((n: {id: string}) => n.id);
        const updates = nodeIds.map((id: string) => ({
          id,
          data: {[key]: undefined},
        }));
        g.updateNodeData(updates);
        void g.draw();
      } catch {
        // noop
      }
    },
    cardName,
  );

  // ── OP: zoomToNode ───────────────────────────────────────────────────────
  // Pan (and optionally zoom) the viewport so a node is centred.
  // Example dispatch:
  //   dispatchGraphinZoomToNode(dispatch, {
  //     cardName: "myGraph",
  //     nodeId:   "n3",
  //     zoomLevel: 1.5,    // optional; keeps current zoom when omitted
  //     duration:  600,    // animation duration ms (default 400)
  //   });
  usePiReducer<ReduxState, GraphinZoomToNodeAction & ReduxAction>(
    GRAPHIN_OP_ACTION.ZOOM_TO_NODE,
    (_, a) => {
      if (a.cardName !== cardName) return;
      const g = graphRef.current;
      if (!isReadyRef.current || !g) return;
      try {
        const animation = {duration: a.duration ?? 400};
        // focusElement centres the viewport on the node.
        g.focusElement(a.nodeId, animation);
        // Optionally change the zoom level after focusing.
        if (a.zoomLevel !== undefined) {
          g.zoomTo(a.zoomLevel, animation);
        }
      } catch {
        // noop
      }
    },
    cardName,
  );

  // ── OP: updateNodeStyleMap ───────────────────────────────────────────────
  // Merge (or replace) entries in the live node-style map and trigger a G6
  // re-draw so the new colours / shapes / sizes appear immediately — without
  // touching `data` or `options` and without re-running the layout.
  //
  // Example dispatch:
  //   dispatchGraphinUpdateNodeStyleMap(dispatch, {
  //     cardName: "myGraph",
  //     styles: { service: { fill: "#e74c3c" } },  // mark all "service" nodes red
  //   });
  usePiReducer<ReduxState, GraphinUpdateNodeStyleMapAction & ReduxAction>(
    GRAPHIN_OP_ACTION.UPDATE_NODE_STYLE_MAP,
    (_, a) => {
      if (a.cardName !== cardName) return;
      const g = graphRef.current;
      if (!isReadyRef.current || !g) return;
      try {
        if (a.replace) {
          nodeStylesRef.current = {...(a.styles as GraphinNodeStyleMap)};
        } else {
          nodeStylesRef.current = {
            ...nodeStylesRef.current,
            ...(a.styles as GraphinNodeStyleMap),
          };
        }
        void g.draw();
      } catch {
        // noop
      }
    },
    cardName,
  );

  return null;
}
