import {createCardDeclaration} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";

// ── Card id ───────────────────────────────────────────────────────────────────

export const CONDITIONAL_CARD = "shad/conditional";

// ── Card declaration factory ──────────────────────────────────────────────────

export const Conditional =
  createCardDeclaration<ConditionalProps>(CONDITIONAL_CARD);

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Named Tailwind-compatible breakpoints.
 *
 *  `xs`   → viewport  < 640 px (mobile-first default)
 *  `sm`   → viewport ≥ 640 px
 *  `md`   → viewport ≥ 768 px
 *  `lg`   → viewport ≥ 1024 px
 *  `xl`   → viewport ≥ 1280 px
 *  `2xl`  → viewport ≥ 1536 px
 */
export type BreakpointName = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * A `BreakpointName` **or** a custom pixel expression.
 *
 * Pixel expressions
 * ─────────────────
 *  `400px`    → viewport ≥ 400 px  (bare value = min-width)
 *  `>=640px`  → viewport ≥ 640 px
 *  `>640px`   → viewport >  640 px (min-width: 641px)
 *  `<=1024px` → viewport ≤ 1024 px
 *  `<1024px`  → viewport <  1024 px (max-width: 1023px)
 */
export type BreakpointSelector =
  | BreakpointName
  | (string & Record<never, never>); // allows arbitrary strings with IDE hints

/**
 * A partial map from each named breakpoint to a value of type `T`.
 *
 * Useful for props that need per-breakpoint configuration — e.g. the CSS
 * `display` value to apply at each viewport width.
 *
 * @example
 * ```ts
 * const display: BreakpointMap = { xs: "none", md: "flex" };
 * ```
 */
export type BreakpointMap<T = string> = Partial<Record<BreakpointName, T>>;

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for the `shad/conditional` card.
 *
 * The card renders `content` only when the combined visibility condition is
 * `true`; it renders nothing otherwise.  This is a transparent pass-through —
 * no extra DOM wrapper is added.
 *
 * ## Modes
 *
 * ### 1 · Manual boolean (existing behaviour)
 *
 * Drive `show` from a `memo()` selector so the card reactively mounts/unmounts
 * as state changes:
 *
 * ```ts
 * import {memo, registerCard} from "@pihanga2/core";
 * import {Conditional} from "@/cards/conditional";
 *
 * registerCard("myApp/hint", Conditional({
 *   show:    memo((s: AppState) => s.items.length === 0 && !s.isLoading),
 *   content: "myApp/emptyStateHint",
 * }));
 * ```
 *
 * ### 2 · Breakpoint-based auto-selection (new)
 *
 * Set `showOn` to a breakpoint name or pixel expression.  The component
 * subscribes to `window.matchMedia` and automatically mounts/unmounts the
 * content card as the viewport crosses the breakpoint — no state, no memo:
 *
 * ```ts
 * // Show only on tablet-sized screens and up
 * registerCard("myApp/sidebar", Conditional({
 *   showOn:  "md",
 *   content: "myApp/desktopSidebar",
 * }));
 *
 * // Show only on narrow viewports (mobile drawer)
 * registerCard("myApp/mobileNav", Conditional({
 *   showOn:  "<768px",
 *   content: "myApp/drawer",
 * }));
 * ```
 *
 * ### 3 · Combined
 *
 * Both conditions are ANDed — content renders only when the breakpoint matches
 * **and** `show` is `true`:
 *
 * ```ts
 * registerCard("myApp/adminSidebar", Conditional({
 *   show:    memo((s: AppState) => s.isAdmin),
 *   showOn:  "lg",
 *   content: "myApp/adminPanel",
 * }));
 * ```
 */
export type ConditionalProps = {
  /**
   * Manual boolean gate.  When omitted it defaults to `true` so that a
   * `showOn`-only card does not need to set it explicitly.
   *
   * Drive with `memo()` for reactive mount/unmount behaviour.
   */
  show?: boolean;

  /**
   * Viewport-width breakpoint selector.  When set, the component subscribes
   * to `window.matchMedia` and reactively shows/hides the content card
   * whenever the viewport crosses the breakpoint.
   *
   * Supported values: `xs` | `sm` | `md` | `lg` | `xl` | `2xl` (Tailwind),
   * or pixel expressions such as `>400px`, `>=640px`, `<768px`, `<=1024px`,
   * `400px`.
   *
   * When both `show` and `showOn` are provided the content is rendered only
   * when **both** conditions are satisfied.
   *
   * By default the breakpoint is evaluated against the **viewport** width via
   * `window.matchMedia`.  Set `containerQuery: true` to evaluate it against
   * the width of the **enclosing container** instead (uses `ResizeObserver`).
   */
  showOn?: BreakpointSelector;

  /**
   * When `true`, the `showOn` breakpoint is measured against the width of the
   * component's **enclosing container** rather than the viewport.
   *
   * Internally the component renders a transparent `<div style="width:100%">`
   * wrapper and observes it with `ResizeObserver`.  This means a single extra
   * DOM node is added when `containerQuery` is `true`.
   *
   * Has no effect when `showOn` is not set.
   *
   * @default false
   */
  containerQuery?: boolean;

  /** The card to render when the visibility condition is met. */
  content: PiCardRef;
};
