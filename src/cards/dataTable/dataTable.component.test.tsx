import {describe, expect, it, vi} from "vitest";
import {render, fireEvent, screen} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// The real `Card` component (rendered inside detail rows) requires a
// react-redux <Provider> since it dispatches/reads from the Pihanga store.
// For these unit tests we only care that DataTable *attempts* to render the
// row's `detailCard` when expanded, so stub it with a lightweight component
// that mirrors the observable contract (`data-pihanga` + `cardName`).
vi.mock("@pihanga2/core", async () => {
  const actual =
    await vi.importActual<typeof import("@pihanga2/core")>("@pihanga2/core");
  return {
    ...actual,
    Card: (props: {cardName: string}) => (
      <div data-pihanga={props.cardName} data-testid="mock-detail-card" />
    ),
  };
});

import {DataTableComponent} from "./dataTable.component";
import type {
  DataTableEvents,
  DataTableProps,
  DataTableRow,
} from "./dataTable.types";

const ROWS: DataTableRow[] = [
  {id: "1", data: {title: "Inception", year: 2010}},
  {id: "2", data: {title: "The Godfather", year: 1972}},
  {id: "3", data: {title: "Superbad", year: 2007}},
];

const ROWS_WITH_DETAIL: DataTableRow[] = [
  {
    id: "1",
    data: {title: "Inception", year: 2010},
    detailCard: "playground/row-detail-template",
  },
  {id: "2", data: {title: "The Godfather", year: 1972}},
];

const COLUMNS: DataTableProps["columns"] = [
  {key: "title", title: "Title"},
  {key: "year", title: "Year", type: "number"},
];

function renderTable(
  props: Partial<DataTableProps> = {},
  eventOverrides: Partial<DataTableEvents> = {},
) {
  const handlers = {
    onRowClicked: vi.fn(),
    onSortChanged: vi.fn(),
    onShowDetail: vi.fn(),
    onHideDetail: vi.fn(),
    onPageChanged: vi.fn(),
    onRowsSelected: vi.fn(),
    onAllRowsSelected: vi.fn(),
    onSearchChanged: vi.fn(),
    ...eventOverrides,
  };
  const full = {
    cardName: "test/data-table",
    columns: COLUMNS,
    rows: ROWS,
    ...props,
    ...handlers,
  } as unknown as PiCardProps<DataTableProps, DataTableEvents>;
  return {...handlers, ...render(<DataTableComponent {...full} />)};
}

describe("shad/data-table — row selection", () => {
  it("does not render checkboxes when `selectable` is not set", () => {
    renderTable();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("renders one checkbox per row plus a select-all header checkbox", () => {
    renderTable({selectable: true});
    // 3 rows + 1 header "select all"
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });

  it("dispatches onRowsSelected with the selected row when a row checkbox is toggled", () => {
    const {onRowsSelected} = renderTable({selectable: true});
    const rowCheckbox = screen.getByLabelText("Select row 2");
    fireEvent.click(rowCheckbox);
    expect(onRowsSelected).toHaveBeenCalledWith({
      selected: [ROWS[1]],
    });
  });

  it("does not trigger onRowClicked when toggling a row checkbox", () => {
    const {onRowClicked} = renderTable({selectable: true});
    const rowCheckbox = screen.getByLabelText("Select row 1");
    fireEvent.click(rowCheckbox);
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  it("select-all toggles all visible rows and fires onAllRowsSelected + onRowsSelected", () => {
    const {onAllRowsSelected, onRowsSelected} = renderTable({
      selectable: true,
    });
    const selectAll = screen.getByLabelText("Select all rows");
    fireEvent.click(selectAll);
    expect(onAllRowsSelected).toHaveBeenCalledWith({
      selected: true,
      rows: ROWS,
    });
    expect(onRowsSelected).toHaveBeenCalledWith({selected: ROWS});
  });

  it("reflects controlled `selectedRowIds` prop", () => {
    renderTable({selectable: true, selectedRowIds: ["2"]});
    const rowCheckbox = screen.getByLabelText(
      "Select row 2",
    ) as HTMLInputElement;
    expect(rowCheckbox.checked).toBe(true);
    const otherCheckbox = screen.getByLabelText(
      "Select row 1",
    ) as HTMLInputElement;
    expect(otherCheckbox.checked).toBe(false);
  });
});

describe("shad/data-table — expandable row detail (the '>' chevron)", () => {
  it("does not render a chevron toggle column when no row has a detailCard", () => {
    renderTable();
    expect(screen.queryByLabelText("Expand detail")).toBeNull();
  });

  it("renders a collapsed '>' chevron for rows with a detailCard, and a blank cell for rows without one", () => {
    renderTable({rows: ROWS_WITH_DETAIL});
    // Only row 1 has a detailCard, so exactly one chevron toggle is rendered.
    expect(screen.getAllByLabelText("Expand detail")).toHaveLength(1);
  });

  it("reveals the detail card, dispatches onShowDetail, and flips to '⌄' when the chevron is clicked", () => {
    const {onShowDetail} = renderTable({rows: ROWS_WITH_DETAIL});
    const toggle = screen.getByLabelText("Expand detail");

    // Detail card is not mounted until expanded.
    expect(screen.queryByTestId("mock-detail-card")).toBeNull();

    fireEvent.click(toggle);

    expect(onShowDetail).toHaveBeenCalledWith({
      rowId: "1",
      row: ROWS_WITH_DETAIL[0],
    });
    // Chevron flips to the collapse state once expanded.
    expect(screen.getByLabelText("Collapse detail")).not.toBeNull();
    // The row's detailCard is now mounted with the correct cardName.
    const detailCard = screen.getByTestId("mock-detail-card");
    expect(detailCard.getAttribute("data-pihanga")).toBe(
      "playground/row-detail-template",
    );
  });

  it("hides the detail row again and dispatches onHideDetail when toggled a second time", () => {
    const {onHideDetail} = renderTable({rows: ROWS_WITH_DETAIL});
    const toggle = screen.getByLabelText("Expand detail");

    fireEvent.click(toggle); // expand
    fireEvent.click(screen.getByLabelText("Collapse detail")); // collapse

    expect(onHideDetail).toHaveBeenCalledWith({
      rowId: "1",
      row: ROWS_WITH_DETAIL[0],
    });
    expect(screen.getByLabelText("Expand detail")).not.toBeNull();
  });

  it("does not trigger onRowClicked when toggling the detail chevron", () => {
    const {onRowClicked} = renderTable({rows: ROWS_WITH_DETAIL});
    fireEvent.click(screen.getByLabelText("Expand detail"));
    expect(onRowClicked).not.toHaveBeenCalled();
  });
});

describe("shad/data-table — search", () => {
  it("does not render a search input by default", () => {
    renderTable();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("renders a search input when `showSearch` is set", () => {
    renderTable({showSearch: true});
    expect(screen.getByRole("searchbox")).not.toBeNull();
  });

  it("filters rows client-side as the user types", () => {
    renderTable({showSearch: true});
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, {target: {value: "Godfather"}});
    expect(screen.getByText("The Godfather")).not.toBeNull();
    expect(screen.queryByText("Inception")).toBeNull();
  });

  it("dispatches onSearchChanged with the new text", () => {
    const {onSearchChanged} = renderTable({showSearch: true});
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, {target: {value: "abc"}});
    expect(onSearchChanged).toHaveBeenCalledWith({text: "abc"});
  });

  it("does not filter client-side when `searchText` is controlled", () => {
    renderTable({showSearch: true, searchText: "zzz-no-match"});
    // Controlled mode delegates filtering to the caller, so all rows remain.
    expect(screen.getByText("Inception")).not.toBeNull();
    expect(screen.getByText("The Godfather")).not.toBeNull();
  });
});
