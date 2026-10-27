import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {SwimlaneComponent} from "./swimlane.component";
import {SWIMLANE_ACTION, SWIMLANE_CARD} from "./swimlane.types";

export * from "./swimlane.types";
export * from "./swimlane.model";

registerCardComponent({
  name: SWIMLANE_CARD,
  component: SwimlaneComponent,
  events: actionTypesToEvents(SWIMLANE_ACTION),
});
