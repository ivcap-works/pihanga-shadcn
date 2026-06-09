import {registerCardComponent} from "@pihanga2/core";
import {ConditionalComponent} from "./conditional.component";
import {CONDITIONAL_CARD} from "./conditional.types";

export * from "./conditional.types";

// No events — this card is purely structural.
registerCardComponent({
  name: CONDITIONAL_CARD,
  component: ConditionalComponent,
});
