import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ScrollbarWithAnnotationsComponent} from "./scrollbarWithAnnotations.component";
import {
  SCROLLBAR_WITH_ANNOTATIONS_ACTION,
  SCROLLBAR_WITH_ANNOTATIONS_CARD,
} from "./scrollbarWithAnnotations.types";

export * from "./scrollbarWithAnnotations.types";

registerCardComponent({
  name: SCROLLBAR_WITH_ANNOTATIONS_CARD,
  component: ScrollbarWithAnnotationsComponent,
  events: actionTypesToEvents(SCROLLBAR_WITH_ANNOTATIONS_ACTION),
});
