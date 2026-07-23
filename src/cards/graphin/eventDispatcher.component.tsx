/**
 * GraphinEventDispatcher
 *
 * A renderless child component (must live inside a <Graphin> tree) that
 * attaches G6 node-level event listeners and bridges them to Pihanga
 * action dispatchers extracted from the parent card's props.
 *
 * Using a child component + useGraphin() keeps the listeners in sync with
 * the graph instance without requiring re-registration on every parent
 * render: the ref pattern ensures handlers always see fresh closures.
 */
import {useEffect, useRef} from "react";
import {useGraphin} from "@antv/graphin";
import type {IPointerEvent} from "@antv/g6";
import type {DisplayObject} from "@antv/g";
import type {Target} from "@antv/g6/lib/types";
import type {
  GraphinAfterLayoutContext,
  GraphinNodeEventContext,
} from "./graphin.types";

export type GraphinEventDispatcherProps = {
  cardName: string;
  onNodeHovered?: (ctx: GraphinNodeEventContext) => void;
  onNodeHoverEnd?: (ctx: GraphinNodeEventContext) => void;
  onNodeClicked?: (ctx: GraphinNodeEventContext) => void;
  onNodeDblClicked?: (ctx: GraphinNodeEventContext) => void;
  onAfterLayout?: (ctx: GraphinAfterLayoutContext) => void;
};

export function GraphinEventDispatcher(
  props: GraphinEventDispatcherProps,
): null {
  const {graph, isReady} = useGraphin();

  // Use a ref so G6 listeners always call the latest handlers without
  // needing to be torn down and re-registered on every render.
  const handlersRef = useRef(props);
  handlersRef.current = props;

  useEffect(() => {
    if (!isReady || !graph) return;

    const buildCtx = (
      evt: IPointerEvent<DisplayObject & Target>,
    ): GraphinNodeEventContext | null => {
      const nodeId = (evt.target as {id?: string})?.id;
      if (!nodeId) return null;
      try {
        const nodeData = graph.getNodeData(nodeId);
        return {
          nodeId,
          nodeData: nodeData?.data as Record<string, unknown> | undefined,
          x: evt.canvas?.x ?? evt.x,
          y: evt.canvas?.y ?? evt.y,
        };
      } catch {
        // node data may not be accessible (e.g. edge label click)
        return {
          nodeId,
          x: evt.canvas?.x ?? evt.x,
          y: evt.canvas?.y ?? evt.y,
        };
      }
    };

    const handleNodePointerEnter = (
      evt: IPointerEvent<DisplayObject & Target>,
    ) => {
      const ctx = buildCtx(evt);
      if (ctx) handlersRef.current.onNodeHovered?.(ctx);
    };

    const handleNodePointerLeave = (
      evt: IPointerEvent<DisplayObject & Target>,
    ) => {
      const ctx = buildCtx(evt);
      if (ctx) handlersRef.current.onNodeHoverEnd?.(ctx);
    };

    const handleNodeClick = (evt: IPointerEvent<DisplayObject & Target>) => {
      const ctx = buildCtx(evt);
      if (ctx) handlersRef.current.onNodeClicked?.(ctx);
    };

    const handleNodeDblClick = (evt: IPointerEvent<DisplayObject & Target>) => {
      const ctx = buildCtx(evt);
      if (ctx) handlersRef.current.onNodeDblClicked?.(ctx);
    };

    const handleAfterLayout = () => {
      handlersRef.current.onAfterLayout?.({
        cardID: handlersRef.current.cardName,
      });
    };

    graph.on("node:pointerenter", handleNodePointerEnter);
    graph.on("node:pointerleave", handleNodePointerLeave);
    graph.on("node:click", handleNodeClick);
    graph.on("node:dblclick", handleNodeDblClick);
    graph.on("afterlayout", handleAfterLayout);

    return () => {
      graph.off("node:pointerenter", handleNodePointerEnter);
      graph.off("node:pointerleave", handleNodePointerLeave);
      graph.off("node:click", handleNodeClick);
      graph.off("node:dblclick", handleNodeDblClick);
      graph.off("afterlayout", handleAfterLayout);
    };
  }, [graph, isReady]);

  return null;
}
