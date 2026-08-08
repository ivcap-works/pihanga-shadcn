import {createCardDeclaration} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";
import type {SkeletonRowSize, SkeletonSpacing} from "@/cards/loadingSkeleton";

// ── Card id ───────────────────────────────────────────────────────────────────

export const SUSPENSE_CARD = "shad/suspense";

// ── Card declaration factory ──────────────────────────────────────────────────

export const Suspense = createCardDeclaration<SuspenseProps>(SUSPENSE_CARD);

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for the `shad/suspense` card.
 *
 * Wraps `content` in a React `<Suspense>` boundary so it can suspend
 * independently of its siblings (e.g. when its component is code-split via
 * `React.lazy`).
 *
 * **Default fallback** — animated shimmer skeleton rows (same as
 * `shad/loading-skeleton`); customise with `rows` / `rowSize` / `spacing`:
 * ```ts
 * registerCard("myApp/editorSection", PiSuspense({
 *   content: "myApp/codeEditor",
 *   rows:    5,
 *   rowSize: "lg",
 * }));
 * ```
 *
 * **Custom fallback card** — pass any registered card name via `fallback` to
 * replace the built-in skeleton entirely:
 * ```ts
 * registerCard("myApp/graphSection", PiSuspense({
 *   content:  "myApp/graphView",
 *   fallback: "myApp/graphPlaceholder",
 * }));
 * ```
 */
export type SuspenseProps = {
  /**
   * The card to render inside the Suspense boundary.
   * Typically registered with a `React.lazy` component so it can suspend.
   */
  content: PiCardRef;

  /**
   * Optional card to use as the Suspense fallback.
   * When provided, the built-in skeleton props below are ignored.
   */
  fallback?: PiCardRef;

  // ── Built-in skeleton fallback options (ignored when `fallback` is set) ────

  /**
   * Number of placeholder rows shown while suspended.
   * @default 3
   */
  rows?: number;

  /**
   * Named height preset for each shimmer row.
   * @default "md"
   */
  rowSize?: SkeletonRowSize;

  /**
   * Named gap preset between shimmer rows.
   * @default "md"
   */
  spacing?: SkeletonSpacing;

  /**
   * Raw Tailwind classes for every shimmer row.
   * When set, takes precedence over `rowSize`.
   */
  rowClassName?: string;

  /**
   * Raw Tailwind classes for the outer wrapper `<div>`.
   * When set, takes precedence over `spacing`.
   */
  className?: string;
};
// No events — display-only structural card.
