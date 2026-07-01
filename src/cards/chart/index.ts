import {registerCardComponent} from "@pihanga2/core";

import {ChartGraphComponent} from "./chart.component";
import {PI_CHART_GRAPH_CARD} from "./chart.types";

export * from "./chart.types";

registerCardComponent({
  name: PI_CHART_GRAPH_CARD,
  component: ChartGraphComponent,
});
