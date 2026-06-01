import {
  actionTypesToEvents,
  createCardDeclaration,
  registerCardComponent,
} from "@pihanga2/core";

import {Component} from "./pageWithNavbar.component";
import {PAGE_WITH_NAVBAR_ACTION} from "./pageWithNavbar.type";

export * from "./pageWithNavbar.type";

const CARD_NAME = "shad/pageWithNavbar";

export const SdPageWithNavbar = createCardDeclaration(CARD_NAME);

registerCardComponent({
  name: CARD_NAME,
  component: Component,
  events: actionTypesToEvents(PAGE_WITH_NAVBAR_ACTION),
});
