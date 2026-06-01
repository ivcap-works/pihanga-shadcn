import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {DataTableComponent} from "./dataTable.component";
import {DataTableRowDetailComponent} from "./dataTableRowDetail.component";
import {
  DATA_TABLE_ACTION,
  DATA_TABLE_CARD,
  DATA_TABLE_ROW_DETAIL_CARD,
} from "./dataTable.types";

export * from "./dataTable.types";

registerCardComponent({
  name: DATA_TABLE_CARD,
  component: DataTableComponent,
  events: actionTypesToEvents(DATA_TABLE_ACTION),
});

registerCardComponent({
  name: DATA_TABLE_ROW_DETAIL_CARD,
  component: DataTableRowDetailComponent,
});
