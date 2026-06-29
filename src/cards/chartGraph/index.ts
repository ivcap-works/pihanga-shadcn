import {registerCardComponent} from "@pihanga2/core";

import {ChartGraphComponent} from "./chartGraph.component";
import {PI_CHART_GRAPH_CARD} from "./chartGraph.types";

export * from "./chartGraph.types";

registerCardComponent({
  name: PI_CHART_GRAPH_CARD,
  component: ChartGraphComponent,
});
