import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ModeToggleComponent} from "./mode-toggle.component";
import {MODE_TOGGLE_ACTION, MODE_TOGGLE_CARD} from "./mode-toggle.types";

export * from "./mode-toggle.types";

registerCardComponent({
  name: MODE_TOGGLE_CARD,
  component: ModeToggleComponent,
  events: actionTypesToEvents(MODE_TOGGLE_ACTION),
});
