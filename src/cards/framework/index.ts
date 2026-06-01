import {
  type WindowProps,
  createCardDeclaration,
  registerCardComponent,
} from "@pihanga2/core";

import {Component} from "./framework.component";

const CARD_TYPE = "shad/framework";
export const SdFramework = createCardDeclaration<WindowProps>(CARD_TYPE);

registerCardComponent({
  name: CARD_TYPE,
  component: Component,
});
