/**
 * Usage examples for the DataTable card ("shad/data-table").
 *
 * The DataTable card renders a shadcn/Tailwind-styled data table with support
 * for:
 *   - Typed columns: text, number, date, badge, boolean, card
 *   - Sortable columns (client-side or controlled via events)
 *   - Expandable row details rendered as a full-width Pihanga card
 *   - Client-side pagination
 *   - Striped rows, compact mode, sticky header
 *   - Empty state (text or card)
 *
 * ---
 * ## Example 1 — Basic movie table with sortable columns
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {DataTable} from "@/cards/dataTable";
 *
 * registerCard("movies/table", DataTable({
 *   columns: [
 *     { key: "title",    title: "Title",       sortable: true },
 *     { key: "year",     title: "Year",        type: "number", sortable: true },
 *     { key: "rating",   title: "Rating",      type: "number",
 *       format: (n) => n.toFixed(1) },
 *     { key: "genre",    title: "Genre",       type: "badge",
 *       variants: { Action: "default", Drama: "secondary", Comedy: "outline" } },
 *     { key: "released", title: "Released",    type: "date" },
 *     { key: "watched",  title: "Watched",     type: "boolean" },
 *   ],
 *   rows: [
 *     { id: "1", data: { title: "Inception",   year: 2010, rating: 8.8, genre: "Action",  released: "2010-07-16", watched: true  } },
 *     { id: "2", data: { title: "The Godfather",year: 1972, rating: 9.2, genre: "Drama",   released: "1972-03-24", watched: true  } },
 *     { id: "3", data: { title: "Superbad",    year: 2007, rating: 7.6, genre: "Comedy",  released: "2007-08-17", watched: false } },
 *   ],
 *   striped: true,
 *   hoverable: true,
 * }));
 * ```
 *
 * ---
 * ## Example 2 — Expandable row details (demo-movie style)
 *
 * Each row can carry a `detailCard` reference.  When the user clicks the
 * chevron at the start of a row, the referenced card is rendered full-width
 * below it.  The data table emits `onShowDetail` / `onHideDetail` so you can
 * update the `detailCard` dynamically based on application state.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {DataTable, onDataTableShowDetail} from "@/cards/dataTable";
 * import {Typography} from "@/cards/typography";
 *
 * // Register a detail card for each movie
 * registerCard("movies/detail/1", Typography({
 *   content: "**Inception** — A thief who steals corporate secrets through dream-sharing technology...",
 * }));
 * registerCard("movies/detail/2", Typography({
 *   content: "**The Godfather** — The aging patriarch of an organized crime dynasty...",
 * }));
 *
 * registerCard("movies/table", DataTable({
 *   columns: [
 *     { key: "title", title: "Title", sortable: true },
 *     { key: "year",  title: "Year",  type: "number", sortable: true },
 *     { key: "genre", title: "Genre", type: "badge" },
 *   ],
 *   rows: [
 *     { id: "1", data: { title: "Inception",    year: 2010, genre: "Action" }, detailCard: "movies/detail/1" },
 *     { id: "2", data: { title: "The Godfather", year: 1972, genre: "Drama"  }, detailCard: "movies/detail/2" },
 *     { id: "3", data: { title: "Superbad",     year: 2007, genre: "Comedy" } }, // no detail
 *   ],
 * }));
 *
 * // Optional: react to expand/collapse in a reducer
 * onDataTableShowDetail((state, {rowId}) => ({
 *   ...state,
 *   expandedMovieId: rowId,
 * }));
 * ```
 *
 * ---
 * ## Example 3 — Card-type column (Pihanga card as cell content)
 *
 * For fully custom cell rendering, set `type: "card"` on a column and supply
 * each row's cell value as a `PiCardRef` (registered card name).
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {DataTable} from "@/cards/dataTable";
 * import {Button} from "@/cards/button";
 *
 * // Register one action button per row
 * registerCard("movies/action/1", Button({ label: "View",   opts: { variant: "outline", size: "xs" } }));
 * registerCard("movies/action/2", Button({ label: "View",   opts: { variant: "outline", size: "xs" } }));
 *
 * registerCard("movies/table", DataTable({
 *   columns: [
 *     { key: "title",  title: "Title" },
 *     { key: "action", title: "", type: "card", width: "80px", align: "center" },
 *   ],
 *   rows: [
 *     { id: "1", data: { title: "Inception",    action: "movies/action/1" } },
 *     { id: "2", data: { title: "The Godfather", action: "movies/action/2" } },
 *   ],
 * }));
 * ```
 *
 * ---
 * ## Example 4 — Pagination
 *
 * ```ts
 * registerCard("movies/table", DataTable({
 *   columns: [
 *     { key: "title", sortable: true },
 *     { key: "year",  type: "number", sortable: true },
 *   ],
 *   rows: Array.from({ length: 50 }, (_, i) => ({
 *     id: String(i + 1),
 *     data: { title: `Movie ${i + 1}`, year: 2000 + i },
 *   })),
 *   pageSize: 10,
 * }));
 * ```
 *
 * ---
 * ## Events reference
 *
 * | Export                   | Fires when…                                              |
 * |--------------------------|----------------------------------------------------------|
 * | `onDataTableRowClicked`  | A data row is clicked (`{ rowId, row }`)                 |
 * | `onDataTableSortChanged` | A sortable column header is clicked (`{ key, ascending }`)|
 * | `onDataTableShowDetail`  | A row's detail panel is expanded (`{ rowId, row }`)      |
 * | `onDataTableHideDetail`  | A row's detail panel is collapsed (`{ rowId, row }`)     |
 * | `onDataTablePageChanged` | The user navigates to a new page (`{ page, pageSize }`)  |
 */

export {};
