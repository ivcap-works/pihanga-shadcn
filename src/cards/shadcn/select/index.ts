import {
  type PiRegister,
  createCardDeclaration,
  actionTypesToEvents,
} from "@pihanga2/core";

import {Component} from "./select.component";
import {
  SELECT_ACTION,
  type SelectProps,
  type SelectEvents,
} from "@pihanga2/cards";

const CARD_TYPE = "shad/select";
export const SdSelect = createCardDeclaration<SelectProps, SelectEvents>(
  CARD_TYPE
);

export function selectInit(register: PiRegister): void {
  register.cardComponent({
    name: CARD_TYPE,
    component: Component,
    events: actionTypesToEvents(SELECT_ACTION),
  });
}
