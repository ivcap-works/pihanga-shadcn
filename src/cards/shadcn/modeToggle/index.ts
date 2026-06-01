import {
  type PiRegister,
  createCardDeclaration,
  actionTypesToEvents,
} from "@pihanga2/core";

import {Component} from "./mode-toggle.component";
import {
  type ModeToggleProps,
  type ModeToggleEvents,
  MODE_TOGGLE_ACTION,
} from "./mode-toggle.types";

const CARD_TYPE = "shad/mode-toggle";
export const SdModeToggle = createCardDeclaration<
  ModeToggleProps,
  ModeToggleEvents
>(CARD_TYPE);

export function modeToggleInit(register: PiRegister): void {
  register.cardComponent({
    name: CARD_TYPE,
    component: Component,
    events: actionTypesToEvents(MODE_TOGGLE_ACTION),
  });
}
