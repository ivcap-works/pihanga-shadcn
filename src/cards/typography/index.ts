import {registerCardComponent} from "@pihanga2/core";

import {TypographyComponent} from "./typography.component";
import {TYPOGRAPHY_CARD} from "./typography.types";

export * from "./typography.types";

registerCardComponent({
  name: TYPOGRAPHY_CARD,
  component: TypographyComponent,
});
