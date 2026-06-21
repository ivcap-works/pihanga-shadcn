import {registerCardComponent} from "@pihanga2/core";

import {Component} from "./stack.component";
import {STACK_CARD} from "./stack.types";

export * from "./stack.types";

registerCardComponent({
  name: STACK_CARD,
  component: Component,
});
