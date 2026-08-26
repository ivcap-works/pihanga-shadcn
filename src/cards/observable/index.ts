import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ObservableComponent} from "./observable.component";
import {OBSERVABLE_ACTION, OBSERVABLE_CARD} from "./observable.types";

export * from "./observable.types";

registerCardComponent({
  name: OBSERVABLE_CARD,
  component: ObservableComponent,
  events: actionTypesToEvents(OBSERVABLE_ACTION),
});
