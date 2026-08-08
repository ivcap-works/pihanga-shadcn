import {registerCardComponent} from "@pihanga2/core";

import {ResizableGridComponent} from "./resizableGrid.component";
import {RESIZABLE_GRID_CARD} from "./resizableGrid.types";

export * from "./resizableGrid.types";

registerCardComponent({
  name: RESIZABLE_GRID_CARD,
  component: ResizableGridComponent,
});
