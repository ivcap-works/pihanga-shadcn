import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";

export const RESIZABLE_CARD = "shad/resizable";

export const SdResizable =
  createCardDeclaration<ResizableProps>(RESIZABLE_CARD);

/** Convenience alias — same as {@link SdResizable}. */
export const Resizable = SdResizable;

export type ResizableProps<S = unknown> = {
  /** Ordered list of panels to render inside the resizable group. */
  content: PiResizablePanel[];
  /** Layout direction of the panel group.  Defaults to `"horizontal"`. */
  direction?: "horizontal" | "vertical";
  /**
   * Handle configuration(s) between panels.
   *
   * - A single `PiResizableHandle` is used for every handle in the group.
   * - An array must have exactly `content.length - 1` entries.
   *
   * Defaults to {@link DefResizableHandle} (visible drag handle).
   */
  handles?: PiResizableHandle | PiResizableHandle[];
  className?: string;
  /**
   * Optional Shadcn-style style overrides.
   *
   * When provided as `{ shad?: { root?: string; panel?: string; handle?: string } }`,
   * the nested class names are applied to the corresponding elements in
   * addition to any `className` already set.
   */
  style?: S;
};

export type PiResizablePanel = {
  /** Used for CSS class suffixes and stable ordering.  Defaults to `"panel{idx}"`. */
  name?: string;
  /** The card to render inside this panel. */
  content: PiCardRef;
  /** Initial size as a percentage of the group.  Defaults to `50`. */
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  /** When `true`, the panel can be collapsed to zero size. */
  collapsible?: boolean;
};

export type PiResizableHandle = {
  /** When `true`, renders a visible drag-handle grip indicator. */
  withHandle?: boolean;
  /** When `true`, the handle is decorative only (not draggable). */
  disabled?: boolean;
};

/** Default handle configuration: visible grip, draggable. */
export const DefResizableHandle: PiResizableHandle = {
  withHandle: true,
  disabled: false,
};
