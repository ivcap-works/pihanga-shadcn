import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const DROP_DOWN_MENU_CARD = "pi/drop-down-menu";
export const DropDownMenu = createCardDeclaration<
  DropDownMenuProps,
  DropDownMenuEvents
>(DROP_DOWN_MENU_CARD);

export const DROP_DOWN_MENU_ACTION = registerActions(DROP_DOWN_MENU_CARD, [
  "selected",
]);

export const onDropDownMenuClicked = createOnAction<DropDownMenuSelectedEvent>(
  DROP_DOWN_MENU_ACTION.SELECTED,
);

export type DropDownMenuProps = {
  /**
   * Dropdown trigger.
   *
   * - For a PiButton (or any custom) trigger, pass a `PiCardRef` and use the
   *   referenced card's props. For `PiButton` specifically:
   *   - `opts.iconName` + `opts.iconPlacement` to show an icon on the left/right.
   *   - `label: ""` for an icon-only button.
   *
   * Implementation note: the dropdown trigger is wrapped in a DOM element so
   * Radix can attach trigger handlers even when the trigger is rendered via
   * `@pihanga2/core`'s `<Card />`.
   */
  trigger: PiCardRef;
  menuAlign?: "center" | "end" | "start";
  menuLabel?: string;

  /**
   * Menu declaration (supports sub-menus, checkbox/radio items, groups, labels, separators, ...).
   *
   * Prefer this over `itemGroups`.
   */
  items?: DropDownMenuEntry[];

  /**
   * When set (ms), selecting a checkbox item will keep the menu open and auto-close
   * it after this delay. Each checkbox selection resets the timer.
   *
   * Blur / outside interactions still close immediately.
   */
  checkboxCloseDelayMs?: number;

  className?: string;
};

/**
 * Menu content can either be plain text or an embedded PiCard.
 *
 * NOTE: we intentionally type this as `PiCardRef` (a string), not a card definition.
 */
export type MenuContent = string | PiCardRef;

export type MenuSeparatorEntry = null | {type: "separator"};

export type MenuLabelEntry = {
  type: "label";
  label: MenuContent;
  inset?: boolean;
};

export type MenuActionItemEntry = {
  type: "item";
  id: string;
  label: MenuContent;
  disabled?: boolean;
  inset?: boolean;
  shortcut?: string;
  /** Prevents the dropdown from closing when selected. */
  keepOpen?: boolean;
};

export type MenuCheckboxItemEntry = {
  type: "checkbox";
  id: string;
  label: MenuContent;
  disabled?: boolean;
  inset?: boolean;
  shortcut?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Prevents the dropdown from closing when selected. */
  keepOpen?: boolean;
};

export type MenuRadioItemEntry = {
  value: string;
  label: MenuContent;
  disabled?: boolean;
  inset?: boolean;
  shortcut?: string;
  /** Prevents the dropdown from closing when selected. */
  keepOpen?: boolean;
  /** Only affects the icon rendering (registry/ui supports this). */
  hideIcon?: boolean;
};

export type MenuRadioGroupEntry = {
  type: "radio-group";
  id: string;
  label?: MenuContent;
  /** Optional extra left padding for the label (matches shadcn dropdown label inset). */
  inset?: boolean;
  value?: string;
  defaultValue?: string;
  items: MenuRadioItemEntry[];
};

export type MenuGroupEntry = {
  type: "group";
  label?: MenuContent;
  /** Optional extra left padding for the label (matches shadcn dropdown label inset). */
  inset?: boolean;
  items: DropDownMenuEntry[];
};

export type MenuSubMenuEntry = {
  type: "submenu";
  /** Optional id used for event `path` (falls back to label string if possible). */
  id?: string;
  label: MenuContent;
  disabled?: boolean;
  inset?: boolean;
  shortcut?: string;
  items: DropDownMenuEntry[];
};

export type DropDownMenuEntry =
  | string
  | MenuSeparatorEntry
  | MenuLabelEntry
  | MenuActionItemEntry
  | MenuCheckboxItemEntry
  | MenuRadioGroupEntry
  | MenuGroupEntry
  | MenuSubMenuEntry;

export type DropDownMenuSelectedEventAdvanced = {
  /** Discriminant for advanced menu items. */
  type: "item" | "checkbox" | "radio";

  /** The id of the selected menu entry (or the radio group id for `type: 'radio'`). */
  id: string;

  /** For radio items this is the selected value. */
  value?: string;

  /** For checkbox items this is the new checked state. */
  checked?: boolean;

  /** Hierarchical path of submenu ids leading to the item (if any). */
  path?: string[];
};

export type DropDownMenuSelectedEvent = DropDownMenuSelectedEventAdvanced;

export type DropDownMenuEvents = {
  onSelected: DropDownMenuSelectedEvent;
};
