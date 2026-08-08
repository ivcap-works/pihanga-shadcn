import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import clsx from "clsx";

import "./resizableGrid.css";
import type {ResizableGridProps} from "./resizableGrid.types";

const DEFAULT_MIN_PERCENT = 10;
const DIVIDER_PX = 8;

type ParsedUnit = {type: "px" | "pct" | "fr" | "auto"; value: number};

function parseWidthSpec(w: string): ParsedUnit {
  const s = w.trim();
  if (s === "auto") return {type: "auto", value: 0};
  if (s.endsWith("px")) return {type: "px", value: Math.max(0, parseFloat(s))};
  if (s.endsWith("%")) return {type: "pct", value: Math.max(0, parseFloat(s))};
  if (s.endsWith("fr")) return {type: "fr", value: Math.max(0, parseFloat(s))};
  return {type: "fr", value: 1};
}

/**
 * Convert CSS-like spec strings to an array of ratio values (summing to 100 for
 * explicit tracks; auto tracks get 0). The ratios are later rendered as `{v}fr`
 * units in the CSS grid template so the browser distributes available space
 * proportionally after fixed tracks (px, dividers) are allocated.
 */
function parseSpecs(
  specs: string[] | undefined,
  count: number,
  containerPx: number,
): number[] {
  if (!specs?.length || specs.length !== count) {
    return new Array(count).fill(100 / count);
  }

  const parsed = specs.map(parseWidthSpec);

  const totalPxAsPct =
    containerPx > 0
      ? parsed.reduce(
          (s, p) => s + (p.type === "px" ? (p.value / containerPx) * 100 : 0),
          0,
        )
      : 0;
  const totalExplicitPct = parsed.reduce(
    (s, p) => s + (p.type === "pct" ? p.value : 0),
    0,
  );
  const remainingPct = Math.max(0, 100 - totalPxAsPct - totalExplicitPct);
  const totalFr = parsed.reduce(
    (s, p) => s + (p.type === "fr" ? p.value : 0),
    0,
  );

  const raw = parsed.map((p) => {
    if (p.type === "auto") return 0;
    if (p.type === "px")
      return containerPx > 0 ? (p.value / containerPx) * 100 : 0;
    if (p.type === "pct") return p.value;
    return totalFr > 0 ? (p.value / totalFr) * remainingPct : 0;
  });

  // Normalise so explicit entries sum to 100 (auto entries stay 0).
  const explicitTotal = raw.reduce((s, v) => s + v, 0);
  if (explicitTotal <= 0) {
    const n = parsed.filter((p) => p.type !== "auto").length || count;
    return parsed.map((p) => (p.type === "auto" ? 0 : 100 / n));
  }
  return raw.map((v, i) =>
    parsed[i].type === "auto" ? 0 : (v / explicitTotal) * 100,
  );
}

/** Build CSS grid-template-columns / grid-template-rows string. */
function buildTemplate(specs: string[], ratios: number[]): string {
  return specs
    .map((spec, i) => {
      const cell = spec === "auto" ? "auto" : `${ratios[i]}fr`;
      const addDivider =
        i < specs.length - 1 && spec !== "auto" && specs[i + 1] !== "auto";
      return addDivider ? `${cell} ${DIVIDER_PX}px` : cell;
    })
    .join(" ");
}

/** Compute 1-based CSS grid track index for each cell column/row. */
function computeCellTrackIndices(specs: string[]): number[] {
  let track = 1;
  return specs.map((spec, i) => {
    const idx = track;
    track++;
    if (i < specs.length - 1 && spec !== "auto" && specs[i + 1] !== "auto") {
      track++; // skip divider track
    }
    return idx;
  });
}

/**
 * CSS track index of the divider between cell[i] and cell[i+1].
 * Returns null when no divider should be rendered.
 */
function dividerTrack(
  specs: string[],
  cellTracks: number[],
  i: number,
): number | null {
  if (i >= specs.length - 1) return null;
  if (specs[i] === "auto" || specs[i + 1] === "auto") return null;
  return cellTracks[i] + 1;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Update a pair of adjacent explicit tracks, keeping their combined ratio constant. */
function makePairUpdater(
  ref: React.MutableRefObject<number[]>,
  setter: React.Dispatch<React.SetStateAction<number[]>>,
  minPct: number,
) {
  return (divIdx: number, nextLeading: number) => {
    const curr = ref.current;
    const combined = curr[divIdx] + curr[divIdx + 1];
    const lo = Math.min(minPct, combined - minPct);
    const hi = Math.max(minPct, combined - minPct);
    const clamped = clamp(nextLeading, lo, hi);
    const next = [...curr];
    next[divIdx] = clamped;
    next[divIdx + 1] = combined - clamped;
    ref.current = next;
    setter(next);
  };
}

export const ResizableGridComponent = (
  props: PiCardProps<ResizableGridProps>,
): React.ReactNode => {
  const {
    cardName,
    cells = [],
    columnWidths,
    rowHeights,
    minColumnPercent = DEFAULT_MIN_PERCENT,
    minRowPercent = DEFAULT_MIN_PERCENT,
    className,
    dividerClassName,
  } = props;

  const numRows = cells.length;
  const numCols = cells[0]?.length ?? 0;

  const colSpecs = React.useMemo(
    () => columnWidths ?? new Array(numCols).fill("1fr"),
    [columnWidths, numCols],
  );
  const rowSpecs = React.useMemo(
    () => rowHeights ?? new Array(numRows).fill("1fr"),
    [rowHeights, numRows],
  );

  // Initialise with equal ratios; useLayoutEffect recalculates with real px.
  const [colRatios, setColRatios] = React.useState(() =>
    parseSpecs(colSpecs, numCols, 0),
  );
  const [rowRatios, setRowRatios] = React.useState(() =>
    parseSpecs(rowSpecs, numRows, 0),
  );
  const colRatiosRef = React.useRef(colRatios);
  const rowRatiosRef = React.useRef(rowRatios);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const colCleanupRef = React.useRef<(() => void) | null>(null);
  const rowCleanupRef = React.useRef<(() => void) | null>(null);

  // Re-parse after mount so px specs can be resolved against actual container size.
  React.useLayoutEffect(() => {
    if (!containerRef.current) return;
    const {width, height} = containerRef.current.getBoundingClientRect();
    const nextCol = parseSpecs(colSpecs, numCols, width);
    const nextRow = parseSpecs(rowSpecs, numRows, height);
    colRatiosRef.current = nextCol;
    rowRatiosRef.current = nextRow;
    setColRatios(nextCol);
    setRowRatios(nextRow);
  }, [colSpecs, rowSpecs, numCols, numRows]);

  React.useEffect(
    () => () => {
      colCleanupRef.current?.();
      rowCleanupRef.current?.();
    },
    [],
  );

  const updateColPair = React.useMemo(
    () => makePairUpdater(colRatiosRef, setColRatios, minColumnPercent),
    [minColumnPercent],
  );
  const updateRowPair = React.useMemo(
    () => makePairUpdater(rowRatiosRef, setRowRatios, minRowPercent),
    [minRowPercent],
  );

  const handleColMouseDown = React.useCallback(
    (divIdx: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startLeading = colRatiosRef.current[divIdx];
      const container = containerRef.current;
      if (!container) return;
      const {width} = container.getBoundingClientRect();
      if (width <= 0) return;
      const onMove = (ev: MouseEvent) =>
        updateColPair(
          divIdx,
          startLeading + ((ev.clientX - startX) / width) * 100,
        );
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        colCleanupRef.current = null;
      };
      colCleanupRef.current?.();
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      colCleanupRef.current = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    },
    [updateColPair],
  );

  const handleColKeyDown = React.useCallback(
    (divIdx: number) => (e: React.KeyboardEvent) => {
      const curr = colRatiosRef.current[divIdx];
      const combined = curr + colRatiosRef.current[divIdx + 1];
      const step = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateColPair(divIdx, curr - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateColPair(divIdx, curr + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        updateColPair(divIdx, minColumnPercent);
      } else if (e.key === "End") {
        e.preventDefault();
        updateColPair(divIdx, combined - minColumnPercent);
      }
    },
    [updateColPair, minColumnPercent],
  );

  const handleRowMouseDown = React.useCallback(
    (divIdx: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startLeading = rowRatiosRef.current[divIdx];
      const container = containerRef.current;
      if (!container) return;
      const {height} = container.getBoundingClientRect();
      if (height <= 0) return;
      const onMove = (ev: MouseEvent) =>
        updateRowPair(
          divIdx,
          startLeading + ((ev.clientY - startY) / height) * 100,
        );
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        rowCleanupRef.current = null;
      };
      rowCleanupRef.current?.();
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      rowCleanupRef.current = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    },
    [updateRowPair],
  );

  const handleRowKeyDown = React.useCallback(
    (divIdx: number) => (e: React.KeyboardEvent) => {
      const curr = rowRatiosRef.current[divIdx];
      const combined = curr + rowRatiosRef.current[divIdx + 1];
      const step = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        updateRowPair(divIdx, curr - step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateRowPair(divIdx, curr + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        updateRowPair(divIdx, minRowPercent);
      } else if (e.key === "End") {
        e.preventDefault();
        updateRowPair(divIdx, combined - minRowPercent);
      }
    },
    [updateRowPair, minRowPercent],
  );

  if (numRows === 0 || numCols === 0) return null;

  const colTemplate = buildTemplate(colSpecs, colRatios);
  const rowTemplate = buildTemplate(rowSpecs, rowRatios);
  const colTracks = computeCellTrackIndices(colSpecs);
  const rowTracks = computeCellTrackIndices(rowSpecs);

  return (
    <div
      ref={containerRef}
      data-pihanga={cardName}
      className={clsx("pi-resizable-grid", className)}
      style={
        {
          gridTemplateColumns: colTemplate,
          gridTemplateRows: rowTemplate,
        } as React.CSSProperties
      }
    >
      {/* Grid cells */}
      {cells.map((row, ri) =>
        row.map((card, ci) => (
          <div
            key={`c${ri}-${ci}`}
            className="pi-resizable-grid-cell"
            style={{gridColumn: colTracks[ci], gridRow: rowTracks[ri]}}
          >
            <Card cardName={card} parentCard={cardName} />
          </div>
        )),
      )}

      {/* Vertical column dividers — each spans all row tracks */}
      {colSpecs.map((_, ci) => {
        const track = dividerTrack(colSpecs, colTracks, ci);
        if (track === null) return null;
        return (
          <div
            key={`cd${ci}`}
            className={clsx("pi-resizable-grid-col-divider", dividerClassName)}
            style={{gridColumn: track, gridRow: "1 / -1"}}
            onMouseDown={handleColMouseDown(ci)}
            onKeyDown={handleColKeyDown(ci)}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize columns ${ci + 1} and ${ci + 2}`}
            aria-valuenow={Math.round(colRatios[ci])}
            tabIndex={0}
          />
        );
      })}

      {/* Horizontal row dividers — each spans all column tracks */}
      {rowSpecs.map((_, ri) => {
        const track = dividerTrack(rowSpecs, rowTracks, ri);
        if (track === null) return null;
        return (
          <div
            key={`rd${ri}`}
            className={clsx("pi-resizable-grid-row-divider", dividerClassName)}
            style={{gridRow: track, gridColumn: "1 / -1"}}
            onMouseDown={handleRowMouseDown(ri)}
            onKeyDown={handleRowKeyDown(ri)}
            role="separator"
            aria-orientation="horizontal"
            aria-label={`Resize rows ${ri + 1} and ${ri + 2}`}
            aria-valuenow={Math.round(rowRatios[ri])}
            tabIndex={0}
          />
        );
      })}
    </div>
  );
};
