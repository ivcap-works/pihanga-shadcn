import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import clsx from "clsx";

import "./resizableColumns.css";
import type {ResizableColumnsProps} from "./resizableColumns.types";

const DEFAULT_MIN_PERCENT = 10;

type ParsedUnit = {type: "px" | "pct" | "fr"; value: number};

function parseColumnWidths(
  widths: string[] | undefined,
  count: number,
  containerPx: number,
): number[] {
  if (!widths?.length || widths.length !== count) {
    return new Array(count).fill(100 / count);
  }

  const parsed: ParsedUnit[] = widths.map((w) => {
    const s = w.trim();
    if (s.endsWith("px"))
      return {type: "px", value: Math.max(0, parseFloat(s))};
    if (s.endsWith("%"))
      return {type: "pct", value: Math.max(0, parseFloat(s))};
    if (s.endsWith("fr"))
      return {type: "fr", value: Math.max(0, parseFloat(s))};
    return {type: "fr", value: 1};
  });

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

  const result = parsed.map((p) => {
    if (p.type === "px")
      return containerPx > 0 ? (p.value / containerPx) * 100 : 100 / count;
    if (p.type === "pct") return p.value;
    return totalFr > 0
      ? (p.value / totalFr) * remainingPct
      : remainingPct / count;
  });

  const total = result.reduce((s, v) => s + v, 0);
  return total > 0
    ? result.map((v) => (v / total) * 100)
    : new Array(count).fill(100 / count);
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const ResizableColumnsComponent = (
  props: PiCardProps<ResizableColumnsProps>,
): React.ReactNode => {
  const {
    cardName,
    columnCards = [],
    columnWidths,
    minColumnPercent = DEFAULT_MIN_PERCENT,
    className,
    dividerClassName,
  } = props;

  const count = columnCards.length;

  // Equal split as the initial state — useLayoutEffect overwrites before paint.
  const [panePercents, setPanePercents] = React.useState<number[]>(() =>
    new Array(count).fill(100 / count),
  );
  const panePercentsRef = React.useRef(panePercents);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const dragCleanupRef = React.useRef<(() => void) | null>(null);

  // Parse columnWidths once the container is mounted so px values can be resolved.
  React.useLayoutEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.getBoundingClientRect().width;
    const next = parseColumnWidths(columnWidths, count, width);
    panePercentsRef.current = next;
    setPanePercents(next);
  }, [columnWidths, count]);

  // Cleanup any in-progress drag on unmount.
  React.useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const getDividerBounds = (dividerIndex: number, percents: number[]) => {
    const combined = percents[dividerIndex] + percents[dividerIndex + 1];
    return {min: minColumnPercent, max: combined - minColumnPercent};
  };

  const updatePanePair = React.useCallback(
    (dividerIndex: number, nextLeadingPercent: number) => {
      const current = panePercentsRef.current;
      const combined = current[dividerIndex] + current[dividerIndex + 1];
      const {min, max} = getDividerBounds(dividerIndex, current);
      const clamped = clamp(nextLeadingPercent, min, max);
      const next = [...current];
      next[dividerIndex] = clamped;
      next[dividerIndex + 1] = combined - clamped;
      panePercentsRef.current = next;
      setPanePercents(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minColumnPercent],
  );

  const handleMouseDown = React.useCallback(
    (dividerIndex: number) => (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startLeadingPercent = panePercentsRef.current[dividerIndex];
      const container = containerRef.current;
      if (!container) return;
      const {width} = container.getBoundingClientRect();
      if (width <= 0) return;

      const onMouseMove = (e: MouseEvent) => {
        const deltaPercent = ((e.clientX - startX) / width) * 100;
        updatePanePair(dividerIndex, startLeadingPercent + deltaPercent);
      };
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        dragCleanupRef.current = null;
      };

      dragCleanupRef.current?.();
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      dragCleanupRef.current = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    },
    [updatePanePair],
  );

  const handleKeyDown = React.useCallback(
    (dividerIndex: number) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      const {min, max} = getDividerBounds(
        dividerIndex,
        panePercentsRef.current,
      );
      const current = panePercentsRef.current[dividerIndex];
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          updatePanePair(dividerIndex, current + (event.shiftKey ? -10 : -2));
          break;
        case "ArrowRight":
          event.preventDefault();
          updatePanePair(dividerIndex, current + (event.shiftKey ? 10 : 2));
          break;
        case "Home":
          event.preventDefault();
          updatePanePair(dividerIndex, min);
          break;
        case "End":
          event.preventDefault();
          updatePanePair(dividerIndex, max);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatePanePair],
  );

  if (count === 0) return null;

  return (
    <div
      ref={containerRef}
      data-pihanga={cardName}
      className={clsx("pi-resizable-columns", className)}
    >
      {columnCards.map((card, i) => {
        const pct = panePercents[i] ?? 100 / count;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                className={clsx(
                  "pi-resizable-columns-divider",
                  dividerClassName,
                )}
                onMouseDown={handleMouseDown(i - 1)}
                onKeyDown={handleKeyDown(i - 1)}
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize columns ${i} and ${i + 1}`}
                aria-valuemin={minColumnPercent}
                aria-valuemax={
                  (panePercents[i - 1] ?? 0) +
                  (panePercents[i] ?? 0) -
                  minColumnPercent
                }
                aria-valuenow={Math.round(panePercents[i - 1] ?? 0)}
                tabIndex={0}
              />
            )}
            <div
              className="pi-resizable-columns-pane"
              style={{width: `${pct}%`}}
            >
              <Card cardName={card} parentCard={cardName} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
