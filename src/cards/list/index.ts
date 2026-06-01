import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ListComponent} from "./list.component";
import {LIST_ACTION, LIST_CARD} from "./list.types";

export * from "./list.types";

registerCardComponent({
  name: LIST_CARD,
  component: ListComponent,
  events: actionTypesToEvents(LIST_ACTION),
});
