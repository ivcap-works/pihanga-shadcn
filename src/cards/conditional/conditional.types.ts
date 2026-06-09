import {createCardDeclaration} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";

// ── Card id ───────────────────────────────────────────────────────────────────

export const CONDITIONAL_CARD = "shad/conditional";

// ── Card declaration factory ──────────────────────────────────────────────────

export const Conditional =
  createCardDeclaration<ConditionalProps>(CONDITIONAL_CARD);

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Props for the `shad/conditional` card.
 *
 * Renders `content` only when `show` is `true`; renders nothing otherwise.
 * This is a transparent pass-through — no extra DOM wrapper is added.
 *
 * In a real app, drive `show` from a `memo()` selector so the card
 * reactively mounts/unmounts as state changes:
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
 */
export type ConditionalProps = {
  /** Render `content` only when this is `true`.  Drive with `memo()` for
   *  reactive mount/unmount behaviour. */
  show: boolean;

  /** The card to render when `show` is `true`. */
  content: PiCardRef;
};
