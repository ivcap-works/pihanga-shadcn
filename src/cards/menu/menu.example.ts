/**
 * Playground definition for the `shad/menu` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Menu, onMenuClicked, type MenuProps} from "./index";

export default definePlayground<MenuProps>({
  cardId: "shad/menu",
  title: "Menu",

  preview: (props) => Menu(props),

  defaultProps: {
    menuButton: {label: "Options"},
    items: [
      {id: "edit", title: "Edit"},
      {id: "duplicate", title: "Duplicate"},
      null,
      {id: "delete", title: "Delete", color: "danger"},
    ],
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Simple action list triggered by a labelled button.",
      props: {
        menuButton: {label: "Actions"},
        items: [
          {id: "view", title: "View"},
          {id: "edit", title: "Edit"},
          {id: "delete", title: "Delete"},
        ],
      },
    },
    {
      id: "with-separator",
      title: "With separator",
      description:
        "A `null` item renders a visual divider between groups of actions.",
      props: {
        menuButton: {label: "Options"},
        items: [
          {id: "edit", title: "Edit"},
          {id: "duplicate", title: "Duplicate"},
          null,
          {id: "archive", title: "Archive"},
          null,
          {id: "delete", title: "Delete"},
        ],
      },
    },
    {
      id: "icon-trigger",
      title: "Icon trigger",
      description:
        "An icon-only trigger (⋯) — the conventional 'more actions' pattern.",
      props: {
        menuButton: {
          label: "⋯",
          tooltip: "More options",
          variant: "ghost",
        },
        items: [
          {id: "rename", title: "Rename"},
          {id: "move", title: "Move to…"},
          null,
          {id: "delete", title: "Delete"},
        ],
        placement: "bottom-end",
      },
    },
    {
      id: "with-disabled-items",
      title: "With disabled items",
      description: "Some items are shown but non-interactive.",
      props: {
        menuButton: {label: "File"},
        items: [
          {id: "new", title: "New"},
          {id: "open", title: "Open"},
          {id: "save", title: "Save"},
          {id: "export", title: "Export", disabled: true},
        ],
      },
    },
  ],

  controls: [
    {
      prop: "placement",
      type: "token",
      label: "Placement",
      options: [
        "bottom",
        "bottom-start",
        "bottom-end",
        "top",
        "top-start",
        "top-end",
        "left",
        "right",
      ],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. w-48",
    },
  ],

  registerEvents: (r, logEvent) => {
    onMenuClicked(r, (state, ev) => {
      logEvent(state, "onMenuClicked", {itemID: ev.itemID});
    });
  },

  note: `
Inside \`app.pihanga.ts\`, respond to menu item clicks:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Menu, onMenuClicked} from "@/cards/menu";

register((r) => {
  onMenuClicked(r, (state, {itemID}) => {
    switch (itemID) {
      case "edit":
        state.editMode = true;
        break;
      case "delete":
        state.pendingDelete = state.selectedId;
        break;
    }
  });
});

registerCard("myApp/rowMenu", Menu({
  menuButton: {label: "⋯", tooltip: "More options", variant: "ghost"},
  placement:  "bottom-end",
  items: [
    {id: "edit",   title: "Edit"},
    {id: "clone",  title: "Duplicate"},
    null,
    {id: "delete", title: "Delete"},
  ],
}));
\`\`\`
  `.trim(),
});
