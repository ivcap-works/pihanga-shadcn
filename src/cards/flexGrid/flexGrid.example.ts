/**
 * Playground definition for the `flex_grid` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {FlexGrid, type FlexGridProps} from "./index";

export default definePlayground<FlexGridProps>({
  cardId: "flex_grid",
  title: "Flex Grid",

  preview: (props) => FlexGrid(props),

  defaultProps: {
    cards: {
      header: "pi/empty",
      main: "pi/empty",
      footer: "pi/empty",
    },
    template: {
      area: [["header"], ["main"], ["footer"]],
      rows: ["auto", "1fr", "auto"],
      columns: ["1fr"],
    },
    height: "300px",
  },

  facets: [
    {
      id: "simple-column",
      title: "Simple column",
      description: "Three-row layout: header, scrollable main, footer.",
      props: {
        cards: {header: "pi/empty", main: "pi/empty", footer: "pi/empty"},
        template: {
          area: [["header"], ["main"], ["footer"]],
          rows: ["auto", "1fr", "auto"],
          columns: ["1fr"],
        },
        height: "300px",
      },
    },
    {
      id: "sidebar-layout",
      title: "Sidebar layout",
      description: "Classic nav + content layout with a fixed-width sidebar.",
      props: {
        cards: {
          header: "pi/empty",
          nav: "pi/empty",
          main: "pi/empty",
          footer: "pi/empty",
        },
        template: {
          area: [
            ["header", "header"],
            ["nav", "main"],
            ["footer", "footer"],
          ],
          rows: ["auto", "1fr", "auto"],
          columns: ["220px", "1fr"],
          gap: "0",
        },
        height: "320px",
      },
    },
    {
      id: "two-column",
      title: "Two column",
      description:
        "Equal-width two-column layout — ideal for comparison views.",
      props: {
        cards: {left: "pi/empty", right: "pi/empty"},
        template: {
          area: [["left", "right"]],
          rows: ["1fr"],
          columns: ["1fr", "1fr"],
          gap: "16px",
        },
        height: "200px",
      },
    },
  ],

  controls: [
    {
      prop: "height",
      type: "text",
      label: "Height",
      placeholder: "e.g. 400px",
    },
    {
      prop: "template.gap",
      type: "text",
      label: "Gap",
      placeholder: "e.g. 8px",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. border rounded",
    },
  ],

  note: `
Build a full-page app shell with \`FlexGrid\`:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {FlexGrid} from "@/cards/flexGrid";

registerCard("myApp/shell", FlexGrid({
  height: "100vh",
  cards: {
    header: "myApp/header",
    nav:    "myApp/sidebar",
    main:   "myApp/content",
    footer: "myApp/statusBar",
  },
  template: {
    area: [
      ["header", "header"],
      ["nav",    "main"  ],
      ["footer", "footer"],
    ],
    rows:    ["56px", "1fr", "32px"],
    columns: ["240px", "1fr"],
    gap:     "0",
  },
}));
\`\`\`
  `.trim(),
});
