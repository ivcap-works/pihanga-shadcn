import React, {useMemo, useState} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  X,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  DataTableColumn,
  DataTableEvents,
  DataTableProps,
  DataTableRow as DataTableRowType,
} from "./dataTable.types";

// ---------------------------------------------------------------------------
// Cell renderer
// ---------------------------------------------------------------------------

function renderCell(
  column: DataTableColumn,
  value: unknown,
  parentCard: string,
): React.ReactNode {
  if (value == null) return null;

  switch (column.type) {
    case "number": {
      const num = typeof value === "number" ? value : Number(value);
      return isNaN(num)
        ? String(value)
        : column.format
          ? column.format(num)
          : String(num);
    }

    case "date": {
      if (column.format) {
        return column.format(value as Date | string);
      }
      const d = value instanceof Date ? value : new Date(String(value));
      return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    }

    case "badge": {
      const strVal = String(value);
      const variant = column.variants?.[strVal] ?? "secondary";
      return <Badge variant={variant}>{strVal}</Badge>;
    }

    case "boolean": {
      return value ? (
        <Check className="size-4 text-green-600" aria-label="true" />
      ) : (
        <X className="size-4 text-muted-foreground" aria-label="false" />
      );
    }

    case "card": {
      // Cell value is expected to be a PiCardRef (string)
      return <Card cardName={String(value)} parentCard={parentCard} />;
    }

    default:
      // "text" or omitted type
      return String(value);
  }
}

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

function SortIcon({
  columnKey,
  activeKey,
  ascending,
}: {
  columnKey: string;
  activeKey: string | undefined;
  ascending: boolean;
}): React.ReactNode {
  if (columnKey !== activeKey) {
    return <ChevronsUpDown className="ml-1 inline size-3.5 opacity-40" />;
  }
  return ascending ? (
    <ChevronUp className="ml-1 inline size-3.5" />
  ) : (
    <ChevronDown className="ml-1 inline size-3.5" />
  );
}

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------

function PaginationBar({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}): React.ReactNode {
  return (
    <div className="flex items-center justify-end gap-2 mt-2 px-2">
      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        className={cn(
          "rounded border px-2 py-1 text-sm transition-colors",
          "hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40",
        )}
        disabled={page === 0}
        onClick={onPrev}
      >
        Previous
      </button>
      <button
        type="button"
        className={cn(
          "rounded border px-2 py-1 text-sm transition-colors",
          "hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40",
        )}
        disabled={page >= totalPages - 1}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: derive a human-readable title from a camelCase key
// ---------------------------------------------------------------------------

function keyToTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Main data-table component
// ---------------------------------------------------------------------------

export const DataTableComponent = (
  props: PiCardProps<DataTableProps, DataTableEvents>,
): React.ReactNode => {
  const {
    columns,
    rows,
    caption,
    sortKey: sortKeyProp,
    sortAscending: sortAscendingProp,
    pageSize,
    currentPage: currentPageProp,
    stickyHeader = false,
    striped = false,
    hoverable = true,
    compact = false,
    emptyCard,
    emptyText = "No data",
    className,
    cardName,
    onRowClicked,
    onSortChanged,
    onShowDetail,
    onHideDetail,
    onPageChanged,
  } = props;

  // ── Expanded-rows state ──────────────────────────────────────────────────
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set(),
  );

  // ── Sort state (uncontrolled; props override when present) ───────────────
  const [localSortKey, setLocalSortKey] = useState<string | undefined>(
    sortKeyProp,
  );
  const [localSortAsc, setLocalSortAsc] = useState<boolean>(
    sortAscendingProp ?? true,
  );
  const activeSortKey = sortKeyProp !== undefined ? sortKeyProp : localSortKey;
  const activeSortAsc =
    sortAscendingProp !== undefined ? sortAscendingProp : localSortAsc;

  // ── Pagination state (uncontrolled; props override when present) ─────────
  const [localPage, setLocalPage] = useState<number>(currentPageProp ?? 0);
  const activePage =
    currentPageProp !== undefined ? currentPageProp : localPage;

  // ── Derived flags ────────────────────────────────────────────────────────
  const hasDetailRows = rows.some((row) => row.detailCard != null);
  // Total column count used for detail-row colSpan
  const colCount = columns.length + (hasDetailRows ? 1 : 0);

  // ── Sorted rows ──────────────────────────────────────────────────────────
  const sortedRows = useMemo(() => {
    if (!activeSortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = (a.data as Record<string, unknown>)[activeSortKey];
      const bv = (b.data as Record<string, unknown>)[activeSortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return activeSortAsc ? cmp : -cmp;
    });
  }, [rows, activeSortKey, activeSortAsc]);

  // ── Paginated slice ──────────────────────────────────────────────────────
  const paginatedRows = useMemo(() => {
    if (!pageSize) return sortedRows;
    const start = activePage * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, pageSize, activePage]);

  const totalPages = pageSize ? Math.ceil(sortedRows.length / pageSize) : 1;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSortClick = (key: string) => {
    const newAsc = activeSortKey === key ? !activeSortAsc : true;
    setLocalSortKey(key);
    setLocalSortAsc(newAsc);
    onSortChanged({key, ascending: newAsc});
  };

  const handleToggleDetail = (row: DataTableRowType, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) {
        next.delete(row.id);
        onHideDetail({rowId: row.id, row});
      } else {
        next.add(row.id);
        onShowDetail({rowId: row.id, row});
      }
      return next;
    });
  };

  const handleRowClick = (row: DataTableRowType) => {
    onRowClicked({rowId: row.id, row});
  };

  const handlePageChange = (page: number) => {
    setLocalPage(page);
    if (pageSize) {
      onPageChanged({page, pageSize});
    }
  };

  // ── Cell padding ─────────────────────────────────────────────────────────
  const cellPad = compact ? "py-1 px-2" : "py-2 px-3";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("w-full", className)} data-pihanga={cardName}>
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <TableHeader
          className={
            stickyHeader ? "sticky top-0 z-10 bg-background" : undefined
          }
        >
          <TableRow>
            {/* Expand-toggle placeholder header cell */}
            {hasDetailRows && (
              <TableHead className="w-10 px-2" aria-label="Row details" />
            )}

            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={col.width ? {width: col.width} : undefined}
                className={cn(
                  cellPad,
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.sortable && "cursor-pointer select-none",
                  col.headerClassName,
                )}
                onClick={
                  col.sortable ? () => handleSortClick(col.key) : undefined
                }
              >
                <span className="inline-flex items-center">
                  {col.title ?? keyToTitle(col.key)}
                  {col.sortable && (
                    <SortIcon
                      columnKey={col.key}
                      activeKey={activeSortKey}
                      ascending={activeSortAsc}
                    />
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <TableBody>
          {paginatedRows.length === 0 ? (
            /* Empty state */
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="py-8 text-center text-muted-foreground"
              >
                {emptyCard ? (
                  <Card cardName={emptyCard} parentCard={cardName} />
                ) : (
                  emptyText
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row, rowIdx) => {
              const isExpanded = expandedRows.has(row.id);
              const isStriped = striped && rowIdx % 2 === 1;

              return (
                <React.Fragment key={row.id}>
                  {/* ── Data row ─────────────────────────────────────────── */}
                  <TableRow
                    className={cn(
                      isStriped && "bg-muted/30",
                      hoverable && "cursor-pointer",
                    )}
                    data-expanded={isExpanded || undefined}
                    onClick={() => handleRowClick(row)}
                  >
                    {/* Expand / collapse toggle */}
                    {hasDetailRows && (
                      <TableCell className="w-10 px-2">
                        {row.detailCard && (
                          <button
                            type="button"
                            aria-label={
                              isExpanded ? "Collapse detail" : "Expand detail"
                            }
                            aria-expanded={isExpanded}
                            className={cn(
                              "flex items-center justify-center rounded p-0.5 transition-colors",
                              "hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            )}
                            onClick={(e) => handleToggleDetail(row, e)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        )}
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((col) => {
                      const value = (row.data as Record<string, unknown>)[
                        col.key
                      ];
                      return (
                        <TableCell
                          key={col.key}
                          className={cn(
                            cellPad,
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.cellClassName,
                          )}
                        >
                          {renderCell(col, value, cardName)}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* ── Detail row (full-width, shown when expanded) ──────── */}
                  {isExpanded && row.detailCard && (
                    <TableRow
                      // Suppress the default hover/click styles on the detail row
                      className="hover:bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableCell colSpan={colCount} className="border-b p-0">
                        <div className="bg-muted/20 px-4 py-3">
                          {/*
                           * cardKey creates a unique virtual card instance per row
                           * (e.g. "myDetailTemplate@detail-42").
                           * The `row` prop is forwarded as ctxtProps so the detail
                           * card's state-mapper functions can access it via
                           * `ctx.ctxtProps.row` — no need to pre-register one card
                           * per row.
                           */}
                          <Card
                            cardName={row.detailCard}
                            cardKey={`detail-${row.id}`}
                            row={row}
                            parentCard={cardName}
                            key={`${cardName}-${row.id}-detail`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* ── Pagination controls ──────────────────────────────────────────── */}
      {pageSize && totalPages > 1 && (
        <PaginationBar
          page={activePage}
          totalPages={totalPages}
          onPrev={() => handlePageChange(activePage - 1)}
          onNext={() => handlePageChange(activePage + 1)}
        />
      )}
    </div>
  );
};
