/**
 * TooltipComponent
 *
 * A child component (must live inside a <Graphin> tree) that renders a
 * lightweight, non-interactive floating card while the pointer hovers
 * over a node.  The panel has `pointerEvents: none` so it never blocks
 * interaction with the graph.
 *
 * For an interactive, click-to-open panel see ContextMenuComponent.
 */
import {useState, useEffect, useRef} from "react";
import {useGraphin} from "@antv/graphin";
import type {IPointerEvent} from "@antv/g6";
import type {DisplayObject} from "@antv/g";
import type {Target} from "@antv/g6/lib/types";
import {Card} from "@pihanga2/core";
import type {GraphinNodeEventContext, GraphinTooltip} from "./graphin.types";

// ---------------------------------------------------------------------------
// Public context type
// ---------------------------------------------------------------------------

/**
 * Context forwarded to the tooltip content card as props.
 *
 * ```ts
 * type MyTooltipProps = TooltipContext & { ... }
 * ```
 */
export type TooltipContext<T = Record<string, unknown>> = {
  /** `true` when the hovered element is an edge, `false` for a node */
  isEdge?: boolean;
  /** The G6 element id */
  elementID?: string;
  /** The element's raw `data` bag */
  elementData?: T;
};

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

type TooltipState = TooltipContext & {
  visible: boolean;
  x: number;
  y: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve offset prop → [ox, oy] in pixels. */
function resolveOffset(
  offset: number | [number, number] | undefined,
): [number, number] {
  if (offset === undefined) return [4, 4];
  if (Array.isArray(offset)) return offset;
  return [offset, offset];
}

/**
 * Compute the pointer position in **CSS pixels relative to the G6 container
 * element** so that `position:absolute` overlays land at the pointer
 * regardless of zoom / pan / page scroll / container offset.
 *
 * Strategy: use `evt.client.x/y` (browser client coords, equivalent to the
 * native `clientX/Y`) minus the container element's `getBoundingClientRect()`.
 * This is immune to the coordinate-system mismatch between G6 world space and
 * our absolute-positioning context.
 *
 * Falls back to `evt.viewport` → `evt.canvas` → `evt.x/y` when the container
 * cannot be resolved.
 */
function getContainerXY(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: any,
  evt: IPointerEvent<DisplayObject & Target>,
): [number, number] {
  // Try: clientX/Y minus container bounding rect
  try {
    const container: HTMLElement | undefined =
      graph?.container ??
      graph?.canvas?.getConfig?.()?.container ??
      graph?.getContainer?.();
    if (container) {
      const rect = container.getBoundingClientRect();
      const clientEvt = evt as unknown as {client?: {x: number; y: number}};
      const cx = clientEvt.client?.x ?? rect.left;
      const cy = clientEvt.client?.y ?? rect.top;
      return [cx - rect.left, cy - rect.top];
    }
  } catch {
    // fall through
  }
  // Fallback: G6 viewport (CSS pixels relative to canvas element)
  const vp = (evt as unknown as {viewport?: {x: number; y: number}}).viewport;
  if (vp) return [vp.x, vp.y];
  // Last resort: world coordinates (wrong when zoomed/panned)
  return [evt.canvas?.x ?? evt.x, evt.canvas?.y ?? evt.y];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TooltipComponent(props: {
  contentCards: GraphinTooltip;
  parentCard: string;
  onOpen?: (ctx: GraphinNodeEventContext) => void;
  onClose?: (ctx: GraphinNodeEventContext) => void;
}): React.ReactNode {
  const {contentCards, parentCard, onOpen, onClose} = props;
  const [ox, oy] = resolveOffset(contentCards.offset);
  const {graph, isReady} = useGraphin();

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Keep callbacks in a ref so the G6 handler always calls the latest version
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;
  // Store last context so onClose can forward it
  const lastCtxRef = useRef<GraphinNodeEventContext | null>(null);

  useEffect(() => {
    if (!isReady || !graph) return;

    const handleNodePointerEnter = (
      evt: IPointerEvent<DisplayObject & Target>,
    ) => {
      const nodeId = (evt.target as {id?: string})?.id;
      if (!nodeId) return;
      const [px, py] = getContainerXY(graph, evt);
      let nodeData: Record<string, unknown> | undefined;
      try {
        nodeData = graph.getNodeData(nodeId)?.data as
          | Record<string, unknown>
          | undefined;
      } catch {
        // noop
      }
      const ctx: GraphinNodeEventContext = {
        nodeId,
        nodeData,
        x: px,
        y: py,
      };
      lastCtxRef.current = ctx;
      setTooltip({
        visible: true,
        x: px,
        y: py,
        isEdge: false,
        elementID: nodeId,
        elementData: nodeData,
      });
      onOpenRef.current?.(ctx);
    };

    const handleNodePointerLeave = () => {
      const ctx = lastCtxRef.current ?? {nodeId: "", x: 0, y: 0};
      setTooltip({
        visible: false,
        x: 0,
        y: 0,
        isEdge: undefined,
        elementID: undefined,
        elementData: undefined,
      });
      onCloseRef.current?.(ctx);
    };

    graph.on("node:pointerenter", handleNodePointerEnter);
    graph.on("node:pointerleave", handleNodePointerLeave);

    return () => {
      graph.off("node:pointerenter", handleNodePointerEnter);
      graph.off("node:pointerleave", handleNodePointerLeave);
    };
  }, [graph, isReady]);

  if (!contentCards.node) return null;
  if (!tooltip.visible) return null;

  const {visible: _v, x, y, ...contextProps} = tooltip;

  return (
    <div
      className={contentCards.className}
      style={{
        position: "absolute",
        left: x + ox,
        top: y + oy,
        backgroundColor: "var(--color-card, white)",
        border: "1px solid hsl(var(--border, 214 32% 91%))",
        padding: "12px",
        borderRadius: "var(--radius, 4px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        // Tooltip must never block graph interaction
        pointerEvents: "none",
        zIndex: 1000,
        ...contentCards.style,
      }}
    >
      <Card
        cardName={contentCards.node}
        parentCard={parentCard}
        {...contextProps}
      />
    </div>
  );
}
