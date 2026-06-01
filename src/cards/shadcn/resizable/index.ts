import {type PiRegister, createCardDeclaration} from "@pihanga2/core";

import {ResizableComponent} from "./resizable.component";
import {type ResizableProps} from "./resizable.types";

export {Resizable} from "./resizable.types";
export const SD_RESIZABLE_CARD = "shad/resizable";
export const SdResizable =
  createCardDeclaration<ResizableProps>(SD_RESIZABLE_CARD);

export function resizableInit(register: PiRegister): void {
  register.cardComponent({
    name: SD_RESIZABLE_CARD,
    component: ResizableComponent,
  });
}
