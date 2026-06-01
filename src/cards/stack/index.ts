import {createCardDeclaration, registerCardComponent} from "@pihanga2/core";
import type {StackProps} from "@pihanga2/cards";

import {Component} from "./stack.component";

export const CARD_TYPE = "shad/stack";
export const Stack = createCardDeclaration<StackProps>(CARD_TYPE);

registerCardComponent({
  name: CARD_TYPE,
  component: Component,
});
