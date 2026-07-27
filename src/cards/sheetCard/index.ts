import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";
import {SheetCardComponent} from "./sheetCard.component";
import {PI_SHEET_ACTION, PI_SHEET_CARD} from "./sheetCard.types";

export * from "./sheetCard.types";

registerCardComponent({
  name: PI_SHEET_CARD,
  component: SheetCardComponent,
  events: actionTypesToEvents(PI_SHEET_ACTION),
});
