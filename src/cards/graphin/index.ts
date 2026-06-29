import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {GraphinComponent} from "./graphin.component";
import {GRAPHIN_ACTION, GRAPHIN_CARD} from "./graphin.types";

export * from "./graphin.types";
export type {TooltipContext} from "./tooltip.component";
export type {ContextMenuContext} from "./contextMenu.component";

registerCardComponent({
  name: GRAPHIN_CARD,
  component: GraphinComponent,
  // Wire GRAPHIN_ACTION keys → on{EventName} handler names so that
  // PiCardProps can create action-dispatching functions for each event.
  events: actionTypesToEvents(GRAPHIN_ACTION),
});
