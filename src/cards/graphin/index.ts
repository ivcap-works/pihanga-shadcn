import {registerCardComponent} from "@pihanga2/core";

import {GraphinComponent} from "./graphin.component";
import {GRAPHIN_CARD} from "./graphin.types";

export * from "./graphin.types";
export type {TooltipContext} from "./tooltip.component";

registerCardComponent({
  name: GRAPHIN_CARD,
  component: GraphinComponent,
});
