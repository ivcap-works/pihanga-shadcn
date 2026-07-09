import {definePlayground} from "@/playground/definePlayground";
import {
  DataTable,
  onDataTableRowClicked,
  onDataTableSortChanged,
  onDataTablePageChanged,
  onDataTableShowDetail,
  onDataTableHideDetail,
} from "./index";

export default definePlayground<Record<string, unknown>>({
  cardId: "shad/data-table",
  title: "Data Table",

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props) => DataTable(props as any),

  defaultProps: {
    columns: [
      {key: "title", title: "Title", sortable: true},
      {
        key: "year",
        title: "Year",
        type: "number",
        sortable: true,
        align: "right",
        width: "80px",
      },
      {
        key: "genre",
        title: "Genre",
        type: "badge",
        variants: {
          "Sci-Fi": "default",
          Drama: "secondary",
          Comedy: "outline",
          Thriller: "destructive",
        },
      },
      {key: "released", title: "Released", type: "date", sortable: true},
      {
        key: "watched",
        title: "Watched",
        type: "boolean",
        align: "center",
        width: "80px",
      },
    ],
    rows: [
      {
        id: "1",
        data: {
          title: "Inception",
          year: 2010,
          genre: "Sci-Fi",
          released: "2010-07-16",
          watched: true,
        },
      },
      {
        id: "2",
        data: {
          title: "The Godfather",
          year: 1972,
          genre: "Drama",
          released: "1972-03-24",
          watched: true,
        },
      },
      {
        id: "3",
        data: {
          title: "Superbad",
          year: 2007,
          genre: "Comedy",
          released: "2007-08-17",
          watched: false,
        },
      },
    ],
    striped: true,
    hoverable: true,
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description:
        "Simple table with sortable text, number, badge, date, and boolean columns.",
      props: {
        columns: [
          {key: "title", title: "Title", sortable: true},
          {
            key: "year",
            title: "Year",
            type: "number",
            sortable: true,
            align: "right",
            width: "80px",
          },
          {
            key: "genre",
            title: "Genre",
            type: "badge",
            variants: {
              "Sci-Fi": "default",
              Drama: "secondary",
              Comedy: "outline",
              Thriller: "destructive",
            },
          },
          {key: "released", title: "Released", type: "date", sortable: true},
          {
            key: "watched",
            title: "Watched",
            type: "boolean",
            align: "center",
            width: "80px",
          },
        ],
        rows: [
          {
            id: "1",
            data: {
              title: "Inception",
              year: 2010,
              genre: "Sci-Fi",
              released: "2010-07-16",
              watched: true,
            },
          },
          {
            id: "2",
            data: {
              title: "The Godfather",
              year: 1972,
              genre: "Drama",
              released: "1972-03-24",
              watched: true,
            },
          },
          {
            id: "3",
            data: {
              title: "Superbad",
              year: 2007,
              genre: "Comedy",
              released: "2007-08-17",
              watched: false,
            },
          },
        ],
        striped: true,
        hoverable: true,
      },
    },
    {
      id: "compact",
      title: "Compact + caption",
      description: "Dense row height with a caption line at the bottom.",
      props: {
        columns: [
          {key: "title", title: "Title"},
          {
            key: "year",
            title: "Year",
            type: "number",
            align: "right",
            width: "80px",
          },
          {
            key: "genre",
            title: "Genre",
            type: "badge",
            variants: {"Sci-Fi": "default", Drama: "secondary"},
          },
        ],
        rows: [
          {id: "1", data: {title: "Inception", year: 2010, genre: "Sci-Fi"}},
          {id: "2", data: {title: "The Godfather", year: 1972, genre: "Drama"}},
          {id: "3", data: {title: "Superbad", year: 2007, genre: "Comedy"}},
        ],
        compact: true,
        caption: "All-time classics",
      },
    },
    {
      id: "cell-styling",
      title: "Cell styling",
      description:
        "Per-cell background colour and font colour via `cellStyle` functions — reproduces a typical colour-coded delivery scorecard.",
      props: {
        columns: [
          {
            key: "tier",
            title: "Tier",
            align: "center" as const,
            cellStyle: (value: unknown) => {
              const map: Record<
                string,
                {backgroundColor: string; color: string; fontWeight: string}
              > = {
                BLUE: {
                  backgroundColor: "#4472C4",
                  color: "#ffffff",
                  fontWeight: "bold",
                },
                GREEN: {
                  backgroundColor: "#70AD47",
                  color: "#ffffff",
                  fontWeight: "bold",
                },
                YELLOW: {
                  backgroundColor: "#FFC000",
                  color: "#ffffff",
                  fontWeight: "bold",
                },
                RED: {
                  backgroundColor: "#FF0000",
                  color: "#ffffff",
                  fontWeight: "bold",
                },
              };
              return map[String(value)];
            },
          },
          {
            key: "label",
            title: "Performance",
            align: "center" as const,
            cellStyle: (value: unknown) => {
              const map: Record<
                string,
                {backgroundColor: string; color: string}
              > = {
                Superior: {backgroundColor: "#4472C4", color: "#ffffff"},
                Satisfactory: {backgroundColor: "#70AD47", color: "#ffffff"},
                "Needs Improvement": {
                  backgroundColor: "#FFC000",
                  color: "#ffffff",
                },
                Unsatisfactory: {backgroundColor: "#FF0000", color: "#ffffff"},
              };
              return map[String(value)];
            },
          },
          {key: "range", title: "Delivery", align: "right" as const},
        ],
        rows: [
          {
            id: "1",
            data: {tier: "BLUE", label: "Superior", range: "100% - 100%"},
          },
          {
            id: "2",
            data: {tier: "GREEN", label: "Satisfactory", range: "98% - 99.99%"},
          },
          {
            id: "3",
            data: {
              tier: "YELLOW",
              label: "Needs Improvement",
              range: "90% - 97.99%",
            },
          },
          {
            id: "4",
            data: {tier: "RED", label: "Unsatisfactory", range: "0% - 89.99%"},
          },
        ],
        hoverable: false,
      },
    },
    {
      id: "paginated",
      title: "Pagination",
      description: "Client-side pagination via the `pageSize` prop.",
      props: {
        columns: [
          {key: "title", title: "Title", sortable: true},
          {
            key: "year",
            title: "Year",
            type: "number",
            sortable: true,
            align: "right",
          },
        ],
        rows: [
          {id: "1", data: {title: "Inception", year: 2010}},
          {id: "2", data: {title: "The Godfather", year: 1972}},
          {id: "3", data: {title: "Superbad", year: 2007}},
          {id: "4", data: {title: "Interstellar", year: 2014}},
          {id: "5", data: {title: "Parasite", year: 2019}},
        ],
        pageSize: 3,
        striped: true,
      },
    },
  ],

  controls: [
    {prop: "striped", type: "boolean", label: "Striped rows"},
    {prop: "hoverable", type: "boolean", label: "Hoverable rows"},
    {prop: "compact", type: "boolean", label: "Compact"},
    {prop: "stickyHeader", type: "boolean", label: "Sticky header"},
    {
      prop: "caption",
      type: "text",
      label: "Caption",
      placeholder: "Table caption…",
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires when a table row is clicked.
    onDataTableRowClicked(r, (state, ev) => {
      logEvent(state, "onDataTableRowClicked", ev as Record<string, unknown>);
    });
    // Fires when the user clicks a column header to sort.
    onDataTableSortChanged(r, (state, ev) => {
      logEvent(state, "onDataTableSortChanged", ev as Record<string, unknown>);
    });
    // Fires when the user navigates to a different page.
    onDataTablePageChanged(r, (state, ev) => {
      logEvent(state, "onDataTablePageChanged", ev as Record<string, unknown>);
    });
    // Fires when a row's detail panel is expanded.
    onDataTableShowDetail(r, (state, ev) => {
      logEvent(state, "onDataTableShowDetail", ev as Record<string, unknown>);
    });
    // Fires when a row's detail panel is collapsed.
    onDataTableHideDetail(r, (state, ev) => {
      logEvent(state, "onDataTableHideDetail", ev as Record<string, unknown>);
    });
  },

  note: `
**Per-cell background & font styling** via \`cellStyle\`:

\`\`\`ts
registerCard("scorecard/table", DataTable({
  columns: [
    {
      key: "tier",
      title: "Tier",
      align: "center",
      // static style applies to every cell in the column
      cellStyle: { fontWeight: "bold" },
    },
    {
      key: "label",
      title: "Performance",
      align: "center",
      // function form — called per cell with (value, row)
      cellStyle: (value) => {
        const colours: Record<string, React.CSSProperties> = {
          Superior:           { backgroundColor: "#4472C4", color: "#fff" },
          Satisfactory:       { backgroundColor: "#70AD47", color: "#fff" },
          "Needs Improvement":{ backgroundColor: "#FFC000", color: "#fff" },
          Unsatisfactory:     { backgroundColor: "#FF0000", color: "#fff" },
        };
        return colours[String(value)];
      },
    },
    // cellClassName also accepts a function for Tailwind-based styling:
    {
      key: "status",
      title: "Status",
      cellClassName: (value) =>
        value === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
    },
  ],
  rows: [...],
}));
\`\`\`

**Basic table** with badge column variants:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {DataTable} from "@/cards/dataTable";

registerCard("movies/table", DataTable({
  columns: [
    {key: "title",  title: "Title",  sortable: true},
    {key: "year",   title: "Year",   type: "number", sortable: true},
    {key: "genre",  title: "Genre",  type: "badge",
      variants: {Action: "default", Drama: "secondary", Comedy: "outline"}},
    {key: "rating", title: "Rating", type: "number",
      format: (n) => \`★ \${n.toFixed(1)}\`},
  ],
  rows: [
    {id: "1", data: {title: "Inception",    year: 2010, genre: "Action", rating: 8.8}},
    {id: "2", data: {title: "The Godfather",year: 1972, genre: "Drama",  rating: 9.2}},
  ],
  striped: true,
  hoverable: true,
}));
\`\`\`

**Expandable row details:**

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {DataTable} from "@/cards/dataTable";
import {Stack} from "@/cards/stack";
import {Typography} from "@/cards/typography";
import {memo} from "@pihanga2/core";

// One shared detail template — DataTable passes \`row\` as ctxtProps.
registerCard("movies/detail", Stack({
  direction: "column",
  content: memo(
    (_, ctx) => ctx.ctxtProps?.row,
    (row) => [
      Typography({level: "h4", text: String(row?.data?.title ?? "")}),
      Typography({level: "muted", text: String(row?.data?.plot ?? "")}),
    ],
  ),
}));

registerCard("movies/table", DataTable({
  columns: [{key: "title", title: "Title"}],
  rows: [
    {id: "1", data: {title: "Inception", plot: "A thief…"}, detailCard: "movies/detail"},
  ],
}));
\`\`\`
  `.trim(),
});
