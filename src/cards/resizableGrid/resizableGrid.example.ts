import {registerCard} from "@pihanga2/core";
import {Box} from "@/cards/box";
import {definePlayground} from "@/playground/definePlayground";
import {LoadingSkeleton} from "@/cards/loadingSkeleton";
import {ResizableGrid, type ResizableGridProps} from "./index";

// Register a reusable placeholder once so cells can be referenced by string ID.
const CELL = "playground/resizable-grid/cell";
registerCard(CELL, LoadingSkeleton({loading: true, rows: 2}));

export default definePlayground<ResizableGridProps>({
  cardId: "pi/resizable-grid",
  title: "Resizable Grid",

  // Box sets an inline `style.height` (160 px) so the inner component's
  // `height: 100%` resolves to a definite value without needing !important.
  preview: (props) =>
    Box({
      height: 160,
      className: "w-full overflow-hidden",
      singleContent: ResizableGrid(props as ResizableGridProps),
    }),

  defaultProps: {
    cells: [
      [CELL, CELL],
      [CELL, CELL],
    ],
    columnWidths: ["1fr", "1fr"],
    rowHeights: ["1fr", "1fr"],
  },

  facets: [
    {
      id: "2x2",
      title: "2×2 equal grid",
      description:
        "Four equal cells. Drag horizontal or vertical dividers to resize.",
      props: {
        cells: [
          [CELL, CELL],
          [CELL, CELL],
        ],
        columnWidths: ["1fr", "1fr"],
        rowHeights: ["1fr", "1fr"],
      },
    },
    {
      id: "auto-header",
      title: "Auto header row",
      description:
        "Top row follows natural content height ('auto'). No drag handle between it and the body row.",
      props: {
        cells: [
          [CELL, CELL],
          [CELL, CELL],
        ],
        columnWidths: ["1fr", "1fr"],
        rowHeights: ["auto", "1fr"],
      },
    },
    {
      id: "sidebar-grid",
      title: "Sidebar + 2 rows",
      description:
        "Fixed-width left column (200 px) alongside two resizable rows.",
      props: {
        cells: [
          [CELL, CELL],
          [CELL, CELL],
        ],
        columnWidths: ["200px", "1fr"],
        rowHeights: ["1fr", "1fr"],
      },
    },
    {
      id: "3x3",
      title: "3×3 grid",
      description: "Nine cells — drag any column or row divider independently.",
      props: {
        cells: [
          [CELL, CELL, CELL],
          [CELL, CELL, CELL],
          [CELL, CELL, CELL],
        ],
        columnWidths: ["1fr", "2fr", "1fr"],
        rowHeights: ["auto", "1fr", "auto"],
      },
    },
  ],

  controls: [
    {
      prop: "minColumnPercent",
      type: "number",
      label: "Min col %",
      placeholder: "e.g. 10",
    },
    {
      prop: "minRowPercent",
      type: "number",
      label: "Min row %",
      placeholder: "e.g. 10",
    },
  ],

  note: `
Use \`ResizableGrid\` for 2-D layouts where users resize both columns and rows:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {ResizableGrid} from "@/cards/resizableGrid";

registerCard("myApp/workspace", ResizableGrid({
  cells: [
    ["myApp/sidebar",  "myApp/editor" ],
    ["myApp/console",  "myApp/console"],
  ],
  columnWidths: ["220px", "1fr"],
  rowHeights:   ["1fr", "200px"],
}));
\`\`\`
  `.trim(),
});
