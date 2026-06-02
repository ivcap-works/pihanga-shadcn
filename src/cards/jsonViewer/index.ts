import {registerCardComponent, actionTypesToEvents} from "@pihanga2/core";

import {JSON_VIEWER_CARD, JSON_VIEWER_ACTION} from "./jsonViewer.types";
import {JsonViewerComponent} from "./jsonViewer.component";

export * from "./jsonViewer.types";

registerCardComponent({
  name: JSON_VIEWER_CARD,
  component: JsonViewerComponent,
  events: actionTypesToEvents(JSON_VIEWER_ACTION),
});
