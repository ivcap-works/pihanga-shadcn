import {registerCard} from "@pihanga2/core";
import {Box} from "@/cards/box";
import {definePlayground} from "@/playground/definePlayground";
import {LoadingSkeleton} from "@/cards/loadingSkeleton";
import {ResizableColumns, type ResizableColumnsProps} from "./index";

// Register a reusable placeholder once so cells can be referenced by string ID.
const CELL = "playground/resizable-columns/cell";
registerCard(CELL, LoadingSkeleton({loading: true, rows: 2}));

export default definePlayground<ResizableColumnsProps>({
  cardId: "pi/resizable-columns",
  title: "Resizable Columns",

  // Box sets an inline `style.height` (160 px) so the inner component's
  // `min-height: 100%` resolves to a definite value without needing !important.
  preview: (props) =>
    Box({
      height: 160,
      className: "w-full overflow-hidden",
      singleContent: ResizableColumns(props as ResizableColumnsProps),
    }),

  defaultProps: {
    columnCards: [CELL, CELL],
    columnWidths: ["1fr", "1fr"],
  },

  facets: [
    {
      id: "two-equal",
      title: "Two equal columns",
      description:
        "Two columns sharing space equally. Drag the divider to resize.",
      props: {
        columnCards: [CELL, CELL],
        columnWidths: ["1fr", "1fr"],
      },
    },
    {
      id: "sidebar",
      title: "Sidebar + content",
      description:
        "Fixed-width sidebar (200 px initial) with a flexible main area.",
      props: {
        columnCards: [CELL, CELL],
        columnWidths: ["200px", "1fr"],
      },
    },
    {
      id: "three-columns",
      title: "Three columns",
      description:
        "Three columns where the centre column gets twice the space.",
      props: {
        columnCards: [CELL, CELL, CELL],
        columnWidths: ["1fr", "2fr", "1fr"],
      },
    },
    {
      id: "percent",
      title: "Percentage split",
      description: "Explicit 30 / 70 percentage split.",
      props: {
        columnCards: [CELL, CELL],
        columnWidths: ["30%", "70%"],
      },
    },
  ],

  controls: [
    {
      prop: "minColumnPercent",
      type: "number",
      label: "Min %",
      placeholder: "e.g. 10",
    },
  ],

  note: `
Use \`ResizableColumns\` to build layouts where the user can drag to resize panes:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {ResizableColumns} from "@/cards/resizableColumns";

registerCard("myApp/shell", ResizableColumns({
  columnCards: ["myApp/sidebar", "myApp/content"],
  columnWidths: ["240px", "1fr"],   // fixed sidebar, flexible main
}));
\`\`\`
  `.trim(),
});
