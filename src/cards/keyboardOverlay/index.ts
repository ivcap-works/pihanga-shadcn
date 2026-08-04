import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {KeyboardOverlayComponent} from "./keyboardOverlay.component";
import {
  KEYBOARD_OVERLAY_ACTION,
  KEYBOARD_OVERLAY_CARD,
} from "./keyboardOverlay.types";

export * from "./keyboardOverlay.types";

registerCardComponent({
  name: KEYBOARD_OVERLAY_CARD,
  component: KeyboardOverlayComponent,
  events: actionTypesToEvents(KEYBOARD_OVERLAY_ACTION),
});
