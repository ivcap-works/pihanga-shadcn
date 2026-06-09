import {createCardDeclaration} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";

// ── Card id ───────────────────────────────────────────────────────────────────

export const LOADING_SKELETON_CARD = "shad/loading-skeleton";

// ── Card declaration factory ──────────────────────────────────────────────────

export const LoadingSkeleton = createCardDeclaration<LoadingSkeletonProps>(
  LOADING_SKELETON_CARD,
);

// ── Preset enums ──────────────────────────────────────────────────────────────

/**
 * Named height presets for skeleton rows.
 *
 * | Value | Height   | Typical use                     |
 * |-------|----------|---------------------------------|
 * | `xs`  | 12 px    | Tiny text / timestamp lines     |
 * | `sm`  | 20 px    | Small text or menu items        |
 * | `md`  | 40 px    | Standard input / row (default)  |
 * | `lg`  | 56 px    | Large card rows                 |
 * | `xl`  | 80 px    | Wide widget / hero section      |
 */
export type SkeletonRowSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Named gap presets between skeleton rows.
 *
 * | Value | Gap    |
 * |-------|--------|
 * | `sm`  |  8 px  |
 * | `md`  | 12 px  |
 * | `lg`  | 16 px  |
 */
export type SkeletonSpacing = "sm" | "md" | "lg";

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for the `shad/loading-skeleton` card.
 *
 * Shows animated shimmer rows while `loading` is `true`; once `loading`
 * becomes `false` it transparently passes through to `content` (or renders
 * nothing when `content` is omitted).
 *
 * **Quick setup** — use the preset props:
 * ```ts
 * registerCard("myApp/area", LoadingSkeleton({
 *   loading:  memo((s: AppState) => s.dataLoading),
 *   rows:     4,
 *   rowSize:  "lg",
 *   spacing:  "lg",
 *   content:  "myApp/dataList",
 * }));
 * ```
 *
 * **Custom Tailwind** — override with raw class strings:
 * ```ts
 * registerCard("myApp/area", LoadingSkeleton({
 *   loading:      memo((s: AppState) => s.dataLoading),
 *   rows:         4,
 *   rowClassName: "h-32 rounded-xl bg-primary/10",
 *   className:    "grid grid-cols-2 gap-4 w-full",
 *   content:      "myApp/cardGrid",
 * }));
 * ```
 */
export type LoadingSkeletonProps = {
  /** When `true`, render animated skeleton rows; when `false` render
   *  `content` (or nothing if `content` is omitted). */
  loading: boolean;

  /**
   * Number of placeholder rows to render while loading.
   * @default 3
   */
  rows?: number;

  // ── Preset controls (no Tailwind knowledge needed) ────────────────────────

  /**
   * Named height preset for each shimmer row.
   * Ignored when `rowClassName` is provided.
   * @default "md"
   */
  rowSize?: SkeletonRowSize;

  /**
   * Named gap preset between shimmer rows.
   * Ignored when `className` is provided.
   * @default "md"
   */
  spacing?: SkeletonSpacing;

  // ── Raw Tailwind overrides (power users) ──────────────────────────────────

  /**
   * Raw Tailwind classes for every shimmer row.
   * When set, takes precedence over `rowSize`.
   * Must include a height (`h-*`) and optionally `rounded-*` and `bg-*`.
   * Tip: use `bg-foreground/15` for good contrast in both themes.
   */
  rowClassName?: string;

  /**
   * Raw Tailwind classes for the outer `<div>` wrapper (loading state only).
   * When set, takes precedence over `spacing`.
   * Include `w-full` to ensure rows fill the container.
   */
  className?: string;

  /**
   * Card to render when `loading` is `false`.
   * When omitted the card renders nothing in the loaded state.
   */
  content?: PiCardRef;
};
// No events — display-only card.
