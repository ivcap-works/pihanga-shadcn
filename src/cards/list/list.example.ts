/**
 * Playground definition for the `shad/list` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {List, onListItemClicked, type ListProps} from "./index";

export default definePlayground<ListProps>({
  cardId: "shad/list",
  title: "List",

  preview: (props) => List(props),

  defaultProps: {
    items: [
      {id: "inbox", title: "Inbox", subTitle: "12 new messages"},
      {id: "drafts", title: "Drafts", subTitle: "3 unsent"},
      {id: "sent", title: "Sent"},
      {id: "trash", title: "Trash", subTitle: "24 items"},
    ],
    size: "md",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Simple list of labels — the minimum configuration.",
      props: {
        items: [
          {id: "home", title: "Home"},
          {id: "about", title: "About"},
          {id: "contact", title: "Contact"},
        ],
      },
    },
    {
      id: "with-subtitles",
      title: "With subtitles",
      description:
        "Two-line items: primary title and a secondary subtitle below.",
      props: {
        items: [
          {id: "inbox", title: "Inbox", subTitle: "12 new messages"},
          {id: "drafts", title: "Drafts", subTitle: "3 unsent"},
          {id: "sent", title: "Sent", subTitle: "All clear"},
        ],
      },
    },
    {
      id: "with-chips",
      title: "With chip decorators",
      description:
        "End-decorated chips show compact metadata alongside each item.",
      props: {
        items: [
          {
            id: "bug",
            title: "Bug fixes",
            endDecorator: {type: "chip", text: "14"},
          },
          {
            id: "feature",
            title: "New features",
            endDecorator: {type: "chip", text: "3"},
          },
          {
            id: "docs",
            title: "Documentation",
            endDecorator: {type: "chip", text: "7"},
          },
        ],
      },
    },
    {
      id: "with-selection",
      title: "With selection",
      description: "One item is highlighted as selected via `isSelected`.",
      props: {
        items: [
          {id: "dashboard", title: "Dashboard", isSelected: true},
          {id: "reports", title: "Reports"},
          {id: "settings", title: "Settings"},
        ],
      },
    },
    {
      id: "dense",
      title: "Dense",
      description: "Small size — compact layout for sidebars or tight panels.",
      props: {
        size: "sm",
        items: [
          {id: "a", title: "Alpha"},
          {id: "b", title: "Beta"},
          {id: "c", title: "Gamma"},
          {id: "d", title: "Delta"},
        ],
      },
    },
  ],

  controls: [
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["sm", "md", "lg"],
    },
    {
      prop: "marker",
      type: "text",
      label: "Marker",
      placeholder: "none / disc / decimal…",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. w-64",
    },
  ],

  registerEvents: (r, logEvent) => {
    onListItemClicked(r, (state, ev) => {
      logEvent(state, "onListItemClicked", {itemID: ev.itemID});
    });
  },

  note: `
Inside \`app.pihanga.ts\`, respond to item clicks:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {List, onListItemClicked} from "@/cards/list";
import type {AppState} from "@/app.state";

register((r) => {
  onListItemClicked(r, (state, {itemID}) => {
    state.selectedItem = itemID;
  });
});

registerCard("myApp/sidebar", List({
  items: memo((s: AppState) =>
    s.pages.map((p) => ({
      id:         p.id,
      title:      p.title,
      isSelected: p.id === s.selectedItem,
    })),
  ),
}));
\`\`\`
  `.trim(),
});
