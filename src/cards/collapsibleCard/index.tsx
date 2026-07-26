import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {CollapsibleCardComponent} from "./collapsibleCard.component";
import {
  COLLAPSIBLE_CARD,
  COLLAPSIBLE_CARD_ACTION,
} from "./collapsibleCard.types";

export * from "./collapsibleCard.types";

registerCardComponent({
  name: COLLAPSIBLE_CARD,
  component: CollapsibleCardComponent,
  events: actionTypesToEvents(COLLAPSIBLE_CARD_ACTION),
});
