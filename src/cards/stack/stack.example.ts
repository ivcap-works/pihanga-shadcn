/**
 * Playground definition for the `shad/stack` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Stack} from "./index";
import type {StackProps} from "./stack.types";

export default definePlayground<StackProps>({
  cardId: "shad/stack",
  title: "Stack",

  preview: (props) => Stack(props),

  defaultProps: {
    content: [],
    direction: "column",
    spacing: 4,
  },

  facets: [
    {
      id: "column",
      title: "Column",
      description: "Vertical stack — the default layout for page sections.",
      props: {content: [], direction: "column", spacing: 4},
    },
    {
      id: "row",
      title: "Row",
      description:
        "Horizontal stack — ideal for toolbars, button groups, or card rows.",
      props: {content: [], direction: "row", spacing: 4},
    },
    {
      id: "centered",
      title: "Centered",
      description: "Items are centred on both axes — useful for hero sections.",
      props: {
        content: [],
        direction: "column",
        spacing: 4,
        justifyContent: "center",
        alignItems: "center",
        className: "min-h-32",
      },
    },
    {
      id: "space-between",
      title: "Space between",
      description:
        "Items spread to fill the container — classic header/footer layout.",
      props: {
        content: [],
        direction: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
  ],

  controls: [
    {
      prop: "direction",
      type: "token",
      label: "Direction",
      options: ["row", "column", "row-reverse", "column-reverse"],
    },
    {
      prop: "spacing",
      type: "text",
      label: "Spacing (gap units)",
      placeholder: "e.g. 4",
    },
    {
      prop: "justifyContent",
      type: "token",
      label: "Justify content",
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    },
    {
      prop: "alignItems",
      type: "token",
      label: "Align items",
      options: ["flex-start", "center", "flex-end", "stretch", "baseline"],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. p-4 bg-card",
    },
  ],

  note: `
Build a two-section page layout with a Stack:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Stack} from "@/cards/stack";

// Horizontal toolbar
registerCard("myApp/toolbar", Stack({
  direction:      "row",
  spacing:        2,
  alignItems:     "center",
  justifyContent: "space-between",
  content:        ["myApp/logo", "myApp/navLinks", "myApp/userMenu"],
}));

// Full page column layout
registerCard("myApp/page", Stack({
  direction: "column",
  content:   ["myApp/toolbar", "myApp/mainContent", "myApp/footer"],
}));
\`\`\`
  `.trim(),
});
