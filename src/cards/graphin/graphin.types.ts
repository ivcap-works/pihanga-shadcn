import {createCardDeclaration, PiCardDef} from "@pihanga2/core";
import {GraphData, GraphOptions} from "@antv/g6";

export const GRAPHIN_CARD = "graphin";
export const Graphin = createCardDeclaration<GraphinProps>(GRAPHIN_CARD);

export type GraphinProps = {
  data: GraphData;
  options?: Partial<Omit<GraphOptions, "data">>;
  tooltip?: GraphinTooltip;
  style?: {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
  };
  className?: string;
};

export type GraphinTooltip = {
  node?: PiCardDef;
  edge?: PiCardDef;
};
