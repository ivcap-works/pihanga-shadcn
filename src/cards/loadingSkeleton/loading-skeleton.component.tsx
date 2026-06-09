import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import type {
  LoadingSkeletonProps,
  SkeletonRowSize,
  SkeletonSpacing,
} from "./loading-skeleton.types";

// ── Preset maps ───────────────────────────────────────────────────────────────

/** Height class for each named `rowSize` preset. */
const ROW_SIZE_CLASS: Record<SkeletonRowSize, string> = {
  xs: "h-3", // 12 px — tiny text / timestamp lines
  sm: "h-5", // 20 px — small text or menu items
  md: "h-10", // 40 px — standard input / row
  lg: "h-14", // 56 px — large card rows
  xl: "h-20", // 80 px — wide widget / hero section
};

/** Gap class for each named `spacing` preset. */
const SPACING_CLASS: Record<SkeletonSpacing, string> = {
  sm: "gap-2", //  8 px
  md: "gap-3", // 12 px
  lg: "gap-4", // 16 px
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * LoadingSkeletonComponent
 *
 * While `loading` is `true`: renders `rows` animated shimmer rows inside a
 * flex column wrapper.
 *
 * **Presets** — `rowSize` and `spacing` select named height / gap values
 * without needing Tailwind knowledge.
 *
 * **Raw overrides** — `rowClassName` (overrides `rowSize`) and `className`
 * (overrides `spacing`) accept arbitrary Tailwind classes for custom layouts.
 *
 * While `loading` is `false`: transparently passes through to `content` (no
 * extra DOM wrapper) or renders nothing when `content` is omitted.
 */
export const LoadingSkeletonComponent = (
  props: PiCardProps<LoadingSkeletonProps>,
): React.ReactNode => {
  const {
    cardName,
    loading,
    rows = 3,
    rowSize = "md",
    spacing = "md",
    rowClassName,
    className,
    content,
  } = props;

  if (loading) {
    // rawClassName takes precedence over the preset; preset is the fallback.
    const rowCls =
      rowClassName ?? `rounded-md bg-foreground/15 ${ROW_SIZE_CLASS[rowSize]}`;
    const wrapperCls =
      className ?? `flex w-full flex-col ${SPACING_CLASS[spacing]}`;

    return (
      <div data-pihanga={cardName} className={wrapperCls}>
        {Array.from({length: rows}).map((_, i) => (
          <div key={i} className={`animate-pulse ${rowCls}`} />
        ))}
      </div>
    );
  }

  if (content) {
    // Transparent pass-through: no extra wrapper element.
    return <Card cardName={content} parentCard={cardName} />;
  }

  // Loaded with no content card — render nothing.
  return null;
};
