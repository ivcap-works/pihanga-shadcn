import {createCardDeclaration, registerCardComponent} from "@pihanga2/core";

import {BoxComponent} from "./box.component";
import type {BoxProps} from "@pihanga2/cards";

export const BOX_CARD = "shad/box";
export const Box = createCardDeclaration<BoxProps>(BOX_CARD);

registerCardComponent({
  name: BOX_CARD,
  component: BoxComponent,
});
