import {registerCardComponent} from "@pihanga2/core";
import {SUSPENSE_CARD} from "./suspense.types";
import {SuspenseComponent} from "./suspense.component";

export * from "./suspense.types";

// No events — structural card.
registerCardComponent({
  name: SUSPENSE_CARD,
  component: SuspenseComponent,
});
