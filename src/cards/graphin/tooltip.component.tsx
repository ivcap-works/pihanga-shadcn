import {useState, useEffect} from "react";
import {useGraphin} from "@antv/graphin";
import type {IPointerEvent} from "@antv/g6";
import type {DisplayObject} from "@antv/g";
import {Target} from "@antv/g6/lib/types";
import {GraphinTooltip} from "@/cards/graphin/graphin.types";
import {Card} from "@pihanga2/core";

export type TooltipContext<T = Record<string, unknown>> = {
  isEdge?: boolean;
  elementID?: string;
  elementData?: T;
};

type tooltipState = TooltipContext & {
  visible: boolean;
  x: number;
  y: number;
};

export function TooltipComponent(props: {
  contentCards: GraphinTooltip;
  parentCard: string;
}): React.ReactNode {
  const {contentCards, parentCard} = props;
  const {graph, isReady} = useGraphin();
  const [tooltip, setTooltip] = useState<tooltipState>({
    visible: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!isReady || !graph) return;

    // Try different event name formats
    const handleNodePointerEnter = (
      evt: IPointerEvent<DisplayObject & Target>,
    ) => {
      const nodeId = evt.target.id;
      const nodeData = graph.getNodeData(nodeId);

      setTooltip({
        visible: true,
        x: evt.canvas.x || evt.x,
        y: evt.canvas.y || evt.y,
        isEdge: true,
        elementID: nodeId,
        elementData: nodeData.data,
      });
    };

    const handleNodePointerLeave = () => {
      console.log("Pointer leave event");
      setTooltip({
        visible: false,
        x: 0,
        y: 0,
        isEdge: undefined,
        elementID: undefined,
        elementData: undefined,
      });
    };

    // Listen to G6 events
    console.log(">>> tooltip effect", graph);
    graph.on("node:pointerenter", handleNodePointerEnter);
    graph.on("node:pointerleave", handleNodePointerLeave);

    return () => {
      graph.off("node:pointerenter", handleNodePointerEnter);
      graph.off("node:pointerleave", handleNodePointerLeave);
    };
  }, [graph, isReady]);

  if (!contentCards.node) return null;
  if (!tooltip.visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: tooltip.x + 10,
        top: tooltip.y + 10,
        background: "white",
        padding: "12px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {/* <h4 style={{margin: "0 0 8px 0"}}>{tooltip.elementID}</h4> */}
      <Card cardName={contentCards.node} parentCard={parentCard} {...tooltip} />
    </div>
  );
}
