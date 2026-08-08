import * as React from "react";
import {Suspense} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import type {SuspenseProps} from "./suspense.types";

// ── Preset maps (mirrors loading-skeleton) ─────────────────────────────────────

const ROW_SIZE_CLASS: Record<string, string> = {
  xs: "h-3",
  sm: "h-5",
  md: "h-10",
  lg: "h-14",
  xl: "h-20",
};

const SPACING_CLASS: Record<string, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

// ── Inline skeleton (used when no `fallback` card is provided) ─────────────────

function InlineSkeleton({
  rows = 3,
  rowSize = "md",
  spacing = "md",
  rowClassName,
  className,
}: Pick<
  SuspenseProps,
  "rows" | "rowSize" | "spacing" | "rowClassName" | "className"
>) {
  const rowCls =
    rowClassName ??
    `rounded-md bg-foreground/15 ${ROW_SIZE_CLASS[rowSize ?? "md"]}`;
  const wrapperCls =
    className ?? `flex w-full flex-col ${SPACING_CLASS[spacing ?? "md"]}`;

  return (
    <div className={wrapperCls}>
      {Array.from({length: rows}).map((_, i) => (
        <div key={i} className={`animate-pulse ${rowCls}`} />
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * SuspenseComponent
 *
 * Wraps `content` in a React `<Suspense>` boundary so it commits and paints
 * independently of the rest of the tree.
 *
 * When `content`'s registered component is code-split with `React.lazy`, this
 * boundary catches the thrown promise and shows either:
 *   • a custom `fallback` card (when the `fallback` prop is set), or
 *   • an animated shimmer skeleton (default).
 */
export const SuspenseComponent = (
  props: PiCardProps<SuspenseProps>,
): React.ReactNode => {
  const {
    cardName,
    content,
    fallback,
    rows,
    rowSize,
    spacing,
    rowClassName,
    className,
  } = props;

  const fallbackNode = fallback ? (
    <Card cardName={fallback} parentCard={cardName} />
  ) : (
    <InlineSkeleton
      rows={rows}
      rowSize={rowSize}
      spacing={spacing}
      rowClassName={rowClassName}
      className={className}
    />
  );

  return (
    <Suspense fallback={fallbackNode}>
      <Card cardName={content} parentCard={cardName} />
    </Suspense>
  );
};
