import {registerCardComponent} from "@pihanga2/core";

import {FlexGridComponent} from "./flexGrid.component";
import {FLEX_GRID_CARD} from "./flexGrid.types";

export * from "./flexGrid.types";

registerCardComponent({
  name: FLEX_GRID_CARD,
  component: FlexGridComponent,
});
