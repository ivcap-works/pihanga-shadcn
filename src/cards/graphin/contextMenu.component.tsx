/**
 * ContextMenuComponent
 *
 * A child component (must live inside a <Graphin> tree) that renders a
 * floating, interactive panel anchored near the node the user clicked.
 *
 * Behaviour:
 *  - Opens on `node:click`.
 *  - Stays open until:
 *      (a) the user clicks outside the panel, or
 *      (b) the built-in ✕ close button is pressed.
 *  - An `onClose` callback is forwarded to the content card so custom
 *    cards can close the panel programmatically.
 *  - The panel passes `GraphinNodeEventContext` (nodeId, nodeData, x, y)
 *    as extra props to the content card.
 */
import React, {useState, useEffect, useRef, useCallback} from "react";
import {useGraphin} from "@antv/graphin";
import type {IPointerEvent} from "@antv/g6";
import type {DisplayObject} from "@antv/g";
import {Target} from "@antv/g6/lib/types";
import {Card} from "@pihanga2/core";
import type {
  GraphinContextMenu,
  GraphinNodeEventContext,
} from "./graphin.types";

// ---------------------------------------------------------------------------
// Public context type
// ---------------------------------------------------------------------------

/**
 * Context forwarded to the content card as props.
 * Consumers can import this type to type their card props:
 *
 * ```ts
 * type MyMenuProps = ContextMenuContext & { ... }
 * ```
 */
export type ContextMenuContext<T = Record<string, unknown>> = {
  /** Whether this panel was triggered from an edge (vs node) */
  isEdge?: boolean;
  /** The G6 element id */
  elementID?: string;
  /** The element's raw `data` bag */
  elementData?: T;
  /**
   * Call this to close the context menu panel from within the content card.
   */
  onClose?: () => void;
};

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

type ContextMenuState = ContextMenuContext & {
  visible: boolean;
  x: number;
  y: number;
};

// ---------------------------------------------------------------------------
// Component
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
 * element** so that `position:absolute` overlays land at the click point
 * regardless of zoom / pan / page scroll / container offset.
 */
function getContainerXY(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: any,
  evt: IPointerEvent<DisplayObject & Target>,
): [number, number] {
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
  const vp = (evt as unknown as {viewport?: {x: number; y: number}}).viewport;
  if (vp) return [vp.x, vp.y];
  return [evt.canvas?.x ?? evt.x, evt.canvas?.y ?? evt.y];
}

export function ContextMenuComponent(props: {
  contentCards: GraphinContextMenu;
  parentCard: string;
  onOpen?: (ctx: GraphinNodeEventContext) => void;
  onClose?: (ctx: GraphinNodeEventContext) => void;
}): React.ReactNode {
  const {contentCards, parentCard, onOpen, onClose} = props;
  const [ox, oy] = resolveOffset(contentCards.offset);
  const {graph, isReady} = useGraphin();

  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isOpeningRef = useRef(false);
  // Keep Pihanga callbacks in refs so closures always call the latest version
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;
  // Store last context so onClose can forward it
  const lastCtxRef = useRef<GraphinNodeEventContext | null>(null);

  const handleClose = useCallback(() => {
    const ctx = lastCtxRef.current ?? {nodeId: "", x: 0, y: 0};
    setMenu((prev) => ({...prev, visible: false}));
    onCloseRef.current?.(ctx);
  }, []);

  // ── G6 node click → open / update panel ───────────────────────────────
  useEffect(() => {
    if (!isReady || !graph) return;

    const handleNodeClick = (evt: IPointerEvent<DisplayObject & Target>) => {
      const nodeId = (evt.target as {id?: string})?.id;
      if (!nodeId) return;

      isOpeningRef.current = true;
      setTimeout(() => {
        isOpeningRef.current = false;
      }, 0);

      const [px, py] = getContainerXY(graph, evt);
      let nodeData: Record<string, unknown> | undefined;
      try {
        nodeData = graph.getNodeData(nodeId)?.data as
          | Record<string, unknown>
          | undefined;
      } catch {
        // noop
      }
      const ctx: GraphinNodeEventContext = {nodeId, nodeData, x: px, y: py};
      lastCtxRef.current = ctx;
      setMenu({
        visible: true,
        x: px,
        y: py,
        isEdge: false,
        elementID: nodeId,
        elementData: nodeData,
      });
      onOpenRef.current?.(ctx);
    };

    graph.on("node:click", handleNodeClick);
    return () => {
      graph.off("node:click", handleNodeClick);
    };
  }, [graph, isReady]);

  // ── Outside-click → dismiss ────────────────────────────────────────────
  useEffect(() => {
    if (!menu.visible) return;

    const handleOutsideClick = (e: MouseEvent) => {
      // Ignore the click that opened this menu
      if (isOpeningRef.current) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    // Defer by one tick so the click that opened the menu isn't caught
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menu.visible, handleClose]);

  // ── Nothing to render ─────────────────────────────────────────────────
  if (!contentCards.node) return null;
  if (!menu.visible) return null;

  const {visible: _v, x, y, ...contextProps} = menu;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x + ox,
        top: y + oy,
        zIndex: 1000,
        // Panel is fully interactive
        pointerEvents: "auto",
      }}
      // Prevent clicks inside the panel from bubbling to the outside-click handler
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Content card — responsible for its own chrome (close button, etc.) */}
      <Card
        cardName={contentCards.node}
        parentCard={parentCard}
        {...contextProps}
        onClose={handleClose}
      />
    </div>
  );
}
