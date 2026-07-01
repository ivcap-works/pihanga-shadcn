import {
  DropDownMenu,
  onDropDownMenuClicked,
  type DropDownMenuProps,
} from "./index";
import {Button} from "@/cards/button";
import {definePlayground} from "@/playground/definePlayground";

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

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<Record<string, unknown>>({
  cardId: "pi/drop-down-menu",
  title: "Drop-down Menu",

  // `props` is the merged (defaultProps + facet.props) object.
  // We always substitute a real Button for the placeholder trigger strings
  // used in facet definitions (e.g. "myApp/menu-button") so the preview
  // renders correctly without requiring those cards to be registered.
  preview: (props) => {
    const p = props as unknown as DropDownMenuProps;
    return DropDownMenu({
      trigger: Button({label: "Open Menu"}),
      menuAlign: p.menuAlign ?? "start",
      menuLabel: p.menuLabel,
      checkboxCloseDelayMs: p.checkboxCloseDelayMs,
      items: p.items ?? [],
    });
  },

  defaultProps: {
    trigger: "myApp/menu-trigger",
    menuAlign: "start",
    items: [
      {type: "label", label: "Actions"},
      {type: "item", id: "new", label: "New", shortcut: "⌘N"},
      {type: "item", id: "open", label: "Open…", shortcut: "⌘O"},
      {type: "separator"},
      {type: "item", id: "settings", label: "Settings"},
    ],
  },

  facets: [
    {
      id: "basic",
      title: "Basic actions",
      description: "Simple list of action items with keyboard shortcuts.",
      props: {
        trigger: "myApp/menu-button",
        menuAlign: "start",
        items: [
          {type: "item", id: "new", label: "New", shortcut: "⌘N"},
          {type: "item", id: "open", label: "Open…", shortcut: "⌘O"},
          {type: "separator"},
          {type: "item", id: "save", label: "Save", shortcut: "⌘S"},
        ],
      },
    },
    {
      id: "checkbox-radio",
      title: "Checkbox + radio",
      description:
        "Checkbox items and radio groups for persistent toggle/selection state.",
      props: {
        trigger: "myApp/menu-button",
        checkboxCloseDelayMs: 1200,
        items: [
          {type: "label", label: "View options"},
          {type: "checkbox", id: "autosave", label: "Auto-save", checked: true},
          {
            type: "checkbox",
            id: "preview",
            label: "Show preview",
            checked: false,
          },
          {type: "separator"},
          {
            type: "radio-group",
            id: "sort",
            label: "Sort by",
            value: "name",
            items: [
              {value: "name", label: "Name"},
              {value: "date", label: "Date modified"},
              {value: "size", label: "File size"},
            ],
          },
        ],
      },
    },
    {
      id: "submenu",
      title: "Sub-menus",
      description: "Nested sub-menus for hierarchical actions.",
      props: {
        trigger: "myApp/menu-button",
        menuLabel: "File",
        items: [
          {type: "item", id: "new", label: "New"},
          {
            type: "submenu",
            id: "export",
            label: "Export as…",
            items: [
              {type: "item", id: "export:pdf", label: "PDF"},
              {type: "item", id: "export:csv", label: "CSV"},
              {type: "item", id: "export:docx", label: "DOCX"},
            ],
          },
          {type: "separator"},
          {type: "item", id: "quit", label: "Quit"},
        ],
      },
    },
    {
      id: "avatar",
      title: "Avatar trigger",
      description:
        "User account menu triggered by a circular letter-avatar button.",
      props: {
        trigger: "myApp/user-avatar-button",
        menuAlign: "end",
        items: [
          {type: "label", label: "Account"},
          {type: "item", id: "profile", label: "Profile"},
          {type: "item", id: "settings", label: "Settings"},
          {type: "separator"},
          {type: "item", id: "logout", label: "Log out"},
        ],
      },
    },
  ],

  controls: [
    {
      prop: "menuAlign",
      type: "token",
      label: "Menu alignment",
      options: ["start", "center", "end"],
    },
    {
      prop: "menuLabel",
      type: "text",
      label: "Menu label",
      placeholder: "e.g. File",
    },
    {
      prop: "checkboxCloseDelayMs",
      type: "text",
      label: "Checkbox close delay (ms)",
      placeholder: "e.g. 1200",
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires when any menu item (action, checkbox, or radio) is selected.
    onDropDownMenuClicked(r, (state, ev) => {
      logEvent(state, "onDropDownMenuClicked", {
        type: ev.type,
        id: ev.id,
        value: ev.value,
        checked: ev.checked,
        path: ev.path,
      });
    });
  },

  note: `
\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {DropDownMenu, onDropDownMenuClicked} from "@/cards/dropDownMenu";
import {Button} from "@/cards/button";

register((r) => {
  onDropDownMenuClicked(r, (state, {id, type, checked, value}) => {
    if (type === "item" && id === "logout") {
      state.currentUser = null;
    }
    if (type === "checkbox" && id === "autosave") {
      state.autosave = checked ?? false;
    }
    if (type === "radio" && id === "sort") {
      state.sortBy = value ?? "name";
    }
  });
});

registerCard("nav/userMenu", DropDownMenu({
  trigger: Button({
    label: "A",
    ariaLabel: "Account menu",
    opts: {variant: "secondary", size: "icon"},
    className: "rounded-full font-semibold",
  }),
  menuAlign: "end",
  items: [
    {type: "item", id: "profile",  label: "Profile"},
    {type: "item", id: "settings", label: "Settings"},
    {type: "separator"},
    {type: "item", id: "logout",   label: "Log out"},
  ],
}));
\`\`\`
  `.trim(),
});
