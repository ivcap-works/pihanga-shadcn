import {registerCardComponent} from "@pihanga2/core";

import {EmptyCardComponent} from "./emptyCard.component";
import {EMPTY_CARD} from "./emptyCard.types";

export * from "./emptyCard.types";

registerCardComponent({
  name: EMPTY_CARD,
  component: EmptyCardComponent,
});
