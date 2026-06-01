import type {DropDownMenuProps} from "./drop-down.types";

import {Button} from "@/cards/button";

/**
 * Example menu model showcasing advanced features: labels, separators, checkbox items,
 * radio groups, and sub-menus.
 */
export const exampleDropDownMenuProps: DropDownMenuProps = {
  trigger: Button({
    label: "Menu",
  }),
  menuAlign: "start",
  menuLabel: "My Menu",
  checkboxCloseDelayMs: 1200,
  items: [
    {type: "label", label: "Actions"},
    {type: "item", id: "new", label: "New", shortcut: "⌘N"},
    {type: "item", id: "open", label: "Open…", shortcut: "⌘O"},
    {type: "separator"},
    {type: "checkbox", id: "autosave", label: "Auto-save", checked: true},
    {
      type: "radio-group",
      id: "sort",
      label: "Sort by",
      value: "name",
      items: [
        {value: "name", label: "Name"},
        {value: "date", label: "Date"},
      ],
    },
    {type: "separator"},
    {
      type: "submenu",
      id: "more",
      label: "More",
      items: [
        {type: "item", id: "settings", label: "Settings"},
        {
          type: "submenu",
          id: "export",
          label: "Export",
          items: [
            {type: "item", id: "export:pdf", label: "PDF"},
            {type: "item", id: "export:docx", label: "DOCX"},
          ],
        },
      ],
    },
  ],
};

/**
 * Dropdown menu triggered by a circular "letter avatar" PiButton.
 *
 * This uses the preferred API: `trigger` is a `PiCardRef`.
 */
export const exampleDropDownMenuWithAvatarTriggerProps: DropDownMenuProps = {
  trigger: Button({
    id: "user-menu",
    label: "A",
    ariaLabel: "Open account menu",
    tooltip: "Account",
    opts: {
      variant: "secondary",
      size: "icon",
      truncate: false,
    },
    className: "rounded-full font-semibold",
  }),
  menuAlign: "end",
  items: [
    {type: "label", label: "Account"},
    {type: "item", id: "profile", label: "Profile"},
    {type: "item", id: "settings", label: "Settings"},
    {type: "separator"},
    {type: "item", id: "logout", label: "Log out"},
  ],
};
