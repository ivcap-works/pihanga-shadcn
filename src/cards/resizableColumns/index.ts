import {registerCardComponent} from "@pihanga2/core";

import {ResizableColumnsComponent} from "./resizableColumns.component";
import {RESIZABLE_COLUMNS_CARD} from "./resizableColumns.types";

export * from "./resizableColumns.types";

registerCardComponent({
  name: RESIZABLE_COLUMNS_CARD,
  component: ResizableColumnsComponent,
});
