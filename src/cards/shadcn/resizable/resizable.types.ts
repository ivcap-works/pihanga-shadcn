import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";
//import { AlignItemsT, DirectionT, JustifyContentT } from "./common"

export const RESIZABLE_CARD = "resizable";
export const Resizable = createCardDeclaration<ResizableProps>(RESIZABLE_CARD);

export type ResizableProps<S = unknown> = {
  content: PiResizablePanel[];
  direction?: "horizontal" | "vertical"; // [horizontal]
  handles?: PiResizableHandle | PiResizableHandle[]; // if array, size needs to be len(content - 1) [DefResizableHandle]

  className?: string;
  style?: S;
};

export type PiResizablePanel = {
  name?: string; // used for css & ordering
  content: PiCardRef;
  defaultSize?: number; // [50] .. all default sizes within.
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
};

export type PiResizableHandle = {
  withHandle?: boolean;
  disabled?: boolean;
};

export const DefResizableHandle = {
  withHandle: true,
  disabled: false,
};
