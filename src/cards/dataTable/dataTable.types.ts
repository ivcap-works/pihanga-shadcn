import React from "react";
import {
  type PiCardRef,
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const DATA_TABLE_CARD = "shad/data-table";

export const DataTable = createCardDeclaration<DataTableProps, DataTableEvents>(
  DATA_TABLE_CARD,
);

export const DATA_TABLE_ACTION = registerActions(DATA_TABLE_CARD, [
  "row_clicked",
  "sort_changed",
  "show_detail",
  "hide_detail",
  "page_changed",
  "rows_selected",
  "all_rows_selected",
  "search_changed",
]);

export const onDataTableRowClicked = createOnAction<DataTableRowClickedEvent>(
  DATA_TABLE_ACTION.ROW_CLICKED,
);
export const onDataTableSortChanged = createOnAction<DataTableSortChangedEvent>(
  DATA_TABLE_ACTION.SORT_CHANGED,
);
export const onDataTableShowDetail = createOnAction<DataTableDetailEvent>(
  DATA_TABLE_ACTION.SHOW_DETAIL,
);
export const onDataTableHideDetail = createOnAction<DataTableDetailEvent>(
  DATA_TABLE_ACTION.HIDE_DETAIL,
);
export const onDataTablePageChanged = createOnAction<DataTablePageChangedEvent>(
  DATA_TABLE_ACTION.PAGE_CHANGED,
);
export const onDataTableRowsSelected =
  createOnAction<DataTableRowsSelectedEvent>(
    DATA_TABLE_ACTION.ROWS_SELECTED,
  );
export const onDataTableAllRowsSelected =
  createOnAction<DataTableAllRowsSelectedEvent>(
    DATA_TABLE_ACTION.ALL_ROWS_SELECTED,
  );
export const onDataTableSearchChanged =
  createOnAction<DataTableSearchChangedEvent>(
    DATA_TABLE_ACTION.SEARCH_CHANGED,
  );

// ---------------------------------------------------------------------------
// Column type definitions
// ---------------------------------------------------------------------------

/** Shared base for all column definitions */
export type DataTableColumnBase = {
  /** Key into the row's `data` object used to retrieve the cell value */
  key: string;
  /**
   * Column header label.
   * Defaults to the `key` with camelCase expanded to "Title Case".
   */
  title?: string;
  /** Column width as a CSS value (e.g. "120px", "10%", "1fr") */
  width?: string | number;
  /** Horizontal alignment of cell content. Defaults to "left". */
  align?: "left" | "center" | "right";
  /** Whether the column header is clickable for sorting */
  sortable?: boolean;
  /** Extra CSS class applied to the `<th>` header cell */
  headerClassName?: string;
  /**
   * Extra CSS class applied to every `<td>` data cell in this column.
   * May be a static string **or** a function called per-cell:
   * `(value, row) => "bg-red-500 text-white"`.
   */
  cellClassName?:
    | string
    | ((value: unknown, row: DataTableRow) => string | undefined);
  /**
   * Inline style applied to every `<td>` data cell in this column.
   * May be a static `React.CSSProperties` object **or** a function called
   * per-cell: `(value, row) => ({ backgroundColor: "blue", color: "white" })`.
   *
   * @example
   * ```ts
   * cellStyle: (value) => {
   *   const map: Record<string, React.CSSProperties> = {
   *     Superior:          { backgroundColor: "#4472C4", color: "#fff" },
   *     Satisfactory:      { backgroundColor: "#70AD47", color: "#fff" },
   *     "Needs Improvement": { backgroundColor: "#FFC000", color: "#fff" },
   *     Unsatisfactory:    { backgroundColor: "#FF0000", color: "#fff" },
   *   };
   *   return map[String(value)];
   * }
   * ```
   */
  cellStyle?:
    | React.CSSProperties
    | ((value: unknown, row: DataTableRow) => React.CSSProperties | undefined);
};

/** Plain text column — cell value rendered as a string */
export type TextColumn = DataTableColumnBase & {
  type?: "text";
};

/** Numeric column with optional custom formatter */
export type NumberColumn = DataTableColumnBase & {
  type: "number";
  /** Custom number formatter; defaults to `String(value)` */
  format?: (n: number) => string;
};

/** Badge/chip column — cell value is rendered inside a `<Badge>` */
export type BadgeColumn = DataTableColumnBase & {
  type: "badge";
  /**
   * Map from cell value (as a string) to a shadcn Badge variant.
   * Falls back to "secondary" for unrecognised values.
   */
  variants?: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  >;
};

/** Date column with optional custom formatter */
export type DateColumn = DataTableColumnBase & {
  type: "date";
  /** Custom date formatter; defaults to `toLocaleDateString()` */
  format?: (d: Date | string) => string;
};

/** Boolean column — renders a check-mark or cross icon */
export type BooleanColumn = DataTableColumnBase & {
  type: "boolean";
};

/**
 * Card column — cell value must be a `PiCardRef` (string).
 * The referenced card is rendered inline via Pihanga's `<Card />`.
 * This enables full reuse of any registered Pihanga card as cell content.
 */
export type CardColumn = DataTableColumnBase & {
  type: "card";
};

export type DataTableColumn =
  | TextColumn
  | NumberColumn
  | BadgeColumn
  | DateColumn
  | BooleanColumn
  | CardColumn;

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

export type DataTableRow<T = Record<string, unknown>> = {
  /** Unique row identifier used as the React key and in events */
  id: string | number;
  /**
   * Row payload — values are keyed by the column's `key` field.
   * For "card" columns the value should be a `PiCardRef` string.
   */
  data: T;
  /**
   * When set, the row shows an expand/collapse toggle button.
   * The referenced card is rendered full-width below the row on expand.
   * Use `onShowDetail` / `onHideDetail` events to track expanded state in
   * your redux store and update `detailCard` per row as needed.
   */
  detailCard?: PiCardRef;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DataTableProps<T = Record<string, unknown>> = {
  /** Column definitions — order determines display order */
  columns: DataTableColumn[];
  /** Row data */
  rows: DataTableRow<T>[];
  /** Optional visible `<caption>` rendered below the table */
  caption?: string;

  // --- Sorting ---
  /**
   * Key of the currently sorted column.
   * When provided the sort state is controlled; otherwise managed internally.
   */
  sortKey?: string;
  /**
   * Sort direction.
   * When provided together with `sortKey` the sort state is controlled.
   */
  sortAscending?: boolean;

  // --- Pagination ---
  /** Maximum number of rows per page. Omit to disable pagination. */
  pageSize?: number;
  /** Current page index (0-based). Treated as controlled when provided. */
  currentPage?: number;
  /**
   * Total row count, used for server-side pagination display.
   * Leave unset for client-side pagination derived from `rows.length`.
   */
  totalRows?: number;

  // --- Display ---
  /** Keep the header visible while the body scrolls */
  stickyHeader?: boolean;
  /** Alternate row background colour (zebra striping) */
  striped?: boolean;
  /** Highlight rows on hover (default: true) */
  hoverable?: boolean;
  /** Use compact row padding */
  compact?: boolean;

  // --- Empty state ---
  /** Card rendered when `rows` is empty */
  emptyCard?: PiCardRef;
  /** Fallback text when `rows` is empty and `emptyCard` is not set */
  emptyText?: string;

  // --- Row selection ---
  /**
   * When true, a checkbox column is rendered so rows can be selected.
   * Selection state is uncontrolled unless `selectedRowIds` is provided.
   */
  selectable?: boolean;
  /**
   * Ids of the currently selected rows.
   * When provided, selection becomes controlled — pair with `onRowsSelected`
   * to update it from your redux store.
   */
  selectedRowIds?: (string | number)[];

  // --- Search ---
  /** Show a search input above the table that filters rows client-side. */
  showSearch?: boolean;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /**
   * Current search text.
   * When provided the search box becomes controlled — pair with
   * `onSearchChanged` to filter `rows` yourself (e.g. server-side).
   */
  searchText?: string;

  className?: string;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type DataTableRowClickedEvent = {
  rowId: string | number;
  row: DataTableRow;
};

export type DataTableSortChangedEvent = {
  /** The column key that was clicked */
  key: string;
  /** `true` = ascending, `false` = descending */
  ascending: boolean;
};

export type DataTableDetailEvent = {
  rowId: string | number;
  row: DataTableRow;
};

export type DataTablePageChangedEvent = {
  /** New page index (0-based) */
  page: number;
  pageSize: number;
};

export type DataTableRowsSelectedEvent<T = Record<string, unknown>> = {
  /** All currently-selected rows (on the current page unless server-driven) */
  selected: DataTableRow<T>[];
};

export type DataTableAllRowsSelectedEvent<T = Record<string, unknown>> = {
  /** Whether the header checkbox selected (true) or cleared (false) all rows */
  selected: boolean;
  /** Rows affected by the select-all toggle (visible/paginated rows) */
  rows: DataTableRow<T>[];
};

export type DataTableSearchChangedEvent = {
  /** New search text */
  text: string;
};

export type DataTableEvents = {
  onRowClicked: DataTableRowClickedEvent;
  onSortChanged: DataTableSortChangedEvent;
  onShowDetail: DataTableDetailEvent;
  onHideDetail: DataTableDetailEvent;
  onPageChanged: DataTablePageChangedEvent;
  onRowsSelected: DataTableRowsSelectedEvent;
  onAllRowsSelected: DataTableAllRowsSelectedEvent;
  onSearchChanged: DataTableSearchChangedEvent;
};

// ---------------------------------------------------------------------------
// DataTableRowDetail — generic single-template detail panel
// ---------------------------------------------------------------------------

/** Configuration for a single field shown in the detail panel. */
export type DataTableRowDetailField = {
  /** Key to look up in `row.data` */
  key: string;
  /** Optional human-readable label prefix (e.g. "Director") */
  label?: string;
  /** Render style: "title" → h4 bold, "muted" → muted foreground, "text" (default) → plain */
  type?: "title" | "text" | "muted";
  /** Additional Tailwind class names forwarded to the element */
  className?: string;
};

export type DataTableRowDetailProps = {
  /**
   * The row to display. Set this via a state mapper so a single template
   * card works for all rows:
   * ```ts
   * DataTableRowDetail({
   *   row: (_, ctx) => ctx.ctxtProps?.row,
   *   fields: [{ key: "title", type: "title" }, ...],
   * })
   * ```
   */
  row?: DataTableRow<Record<string, unknown>>;
  /**
   * Fields to render in order.
   * When omitted, every key in `row.data` is rendered as a plain key:value pair.
   */
  fields?: DataTableRowDetailField[];
};

export const DATA_TABLE_ROW_DETAIL_CARD = "shad/data-table-row-detail";
export const DataTableRowDetail =
  createCardDeclaration<DataTableRowDetailProps>(DATA_TABLE_ROW_DETAIL_CARD);
