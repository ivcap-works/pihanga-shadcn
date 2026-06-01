import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {PasteTargetComponent} from "./pasteTarget.component";
import {PASTE_TARGET_ACTION, PASTE_TARGET_CARD} from "./pasteTarget.types";

export * from "./pasteTarget.types";

registerCardComponent({
  name: PASTE_TARGET_CARD,
  component: PasteTargetComponent,
  events: actionTypesToEvents(PASTE_TARGET_ACTION),
});
