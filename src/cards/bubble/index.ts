import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {BubbleComponent} from "./bubble.component";
import {BubbleGroupComponent} from "./bubbleGroup.component";
import {BUBBLE_ACTION, BUBBLE_CARD, BUBBLE_GROUP_CARD} from "./bubble.types";

export * from "./bubble.types";

registerCardComponent({
  name: BUBBLE_CARD,
  component: BubbleComponent,
  events: actionTypesToEvents(BUBBLE_ACTION),
});

registerCardComponent({
  name: BUBBLE_GROUP_CARD,
  component: BubbleGroupComponent,
});
