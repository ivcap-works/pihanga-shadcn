import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {FileDropComponent} from "./fileDrop.component";
import {
  FILE_DROP_ACTION,
  FILE_DROP_CARD,
  registerFileDropTheme,
} from "./fileDrop.types";

export * from "./fileDrop.types";
export {get_last_dropped} from "./fileDrop.component";

registerCardComponent({
  name: FILE_DROP_CARD,
  component: FileDropComponent,
  events: actionTypesToEvents(FILE_DROP_ACTION),
});

registerFileDropTheme("default-1", {
  root: "flex items-center justify-center p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50",
  dropZone: "flex flex-col items-center gap-3 text-center",
  icon: "flex items-center justify-center size-12 rounded-xl bg-slate-100",
  title: "text-lg font-bold text-slate-900",
  description: "text-sm text-slate-500 max-w-xs",
  browseButton:
    "mt-2 px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold cursor-pointer",
});
