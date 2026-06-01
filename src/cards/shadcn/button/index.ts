import {
  type PiRegister,
  createCardDeclaration,
  actionTypesToEvents,
} from "@pihanga2/core";

import {Component} from "./button.component";
import {
  BUTTON_ACTION,
  type ButtonProps,
  type ButtonEvents,
} from "@pihanga2/cards";

const CARD_TYPE = "shad/button";
export const SdButton = createCardDeclaration<ButtonProps, ButtonEvents>(
  CARD_TYPE
);

export function buttonInit(register: PiRegister): void {
  register.cardComponent({
    name: CARD_TYPE,
    component: Component,
    events: actionTypesToEvents(BUTTON_ACTION),
  });
}
