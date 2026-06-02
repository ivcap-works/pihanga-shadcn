import {registerCardComponent} from "@pihanga2/core";

import {TabsComponent} from "./tabs.component";
import {TABS_ACTION, TABS_CARD} from "./tabs.types";

export * from "./tabs.types";

registerCardComponent({
  name: TABS_CARD,
  component: TabsComponent,
  // Explicit mapping avoids CamelCase normalisation issues:
  // TABCHANGED → onTabChanged (lowercase 'c' would break with actionTypesToEvents)
  events: {
    onTabChanged: TABS_ACTION.TABCHANGED,
  },
});
