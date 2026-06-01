import {
  actionTypesToEvents,
  registerCardComponent,
} from "@pihanga2/core";

import {Component} from "./navbarSearch.component";
import {NAVBAR_SEARCH_ACTION, NAVBAR_SEARCH_CARD} from "./navbarSearch.type";

export * from "./navbarSearch.type";

registerCardComponent({
  name: NAVBAR_SEARCH_CARD,
  component: Component,
  events: actionTypesToEvents(NAVBAR_SEARCH_ACTION),
});
