import {
  createCardDeclaration,
  createOnAction,
  registerActions,
  type PiCardRef,
} from "@pihanga2/core";
import type React from "react";

export const BUBBLE_CARD = "shad/bubble";

export const Bubble = createCardDeclaration<BubbleProps, BubbleEvents>(
  BUBBLE_CARD,
);

export const BUBBLE_ACTION = registerActions(BUBBLE_CARD, ["clicked"]);

export type BubbleClickedEvent = {id?: string};

export const onBubbleClicked = createOnAction<BubbleClickedEvent>(
  BUBBLE_ACTION.CLICKED,
);

export type BubbleEvents = {
  onClicked: BubbleClickedEvent;
};

/**
 * Bubble visual treatment — mirrors the shadcn `Bubble` `variant` prop.
 *
 * | Value           | Appearance                                          |
 * |-----------------|------------------------------------------------------|
 * | `"default"`     | Strong primary-coloured bubble.                     |
 * | `"secondary"`   | Secondary colour, filled.                           |
 * | `"muted"`       | Lower-emphasis muted background.                    |
 * | `"tinted"`      | Soft tint derived from the primary colour.          |
 * | `"outline"`     | Bordered, transparent background.                  |
 * | `"ghost"`       | Unframed — for assistant text, markdown, code, etc. |
 * | `"destructive"` | Red / error colour.                                 |
 */
export type BubbleVariant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive";

export type BubbleProps = {
  id?: string; // optional id echoed in click events

  /** Plain text rendered inside `BubbleContent`. Ignored if `contentCard` is set. */
  text?: string;

  /**
   * Pihanga card reference rendered inside `BubbleContent` instead of `text`.
   *
   * Use this for "large" pieces of content — a `markdown-viewer` card, a
   * `shad/data-table`, an image, or any other rich card. Combine with
   * `variant: "ghost"` so the content is not framed and can use the full
   * available width.
   */
  contentCard?: PiCardRef;

  /**
   * Visual style variant.
   * @default "default"
   */
  variant?: BubbleVariant;

  /**
   * Inline alignment of the bubble within its row.
   * @default "start"
   */
  align?: "start" | "end";

  /**
   * When set, `BubbleContent` renders as an anchor pointing at this URL
   * instead of a plain `<div>`.
   */
  href?: string;
  target?: string;

  /**
   * When true (and `href` is not set), `BubbleContent` renders as a
   * `<button>` and clicking it fires `onClicked`.
   */
  clickable?: boolean;

  /**
   * Reactions row — a short list of emoji / short strings rendered
   * overlapping the bottom (or top) edge of the bubble.
   * For interactive reactions, use `reactionsCard` instead.
   */
  reactions?: string[];

  /**
   * Pihanga card reference rendered inside `BubbleReactions` instead of
   * `reactions` — use for interactive reaction buttons.
   */
  reactionsCard?: PiCardRef;

  /** Accessible label for the reactions row (e.g. "Reactions: thumbs up, fire, and 2 more"). */
  reactionsAriaLabel?: string;

  /**
   * Side of the bubble the reactions row anchors to.
   * @default "bottom"
   */
  reactionsSide?: "top" | "bottom";

  /**
   * Inline alignment of the reactions row.
   * @default "end"
   */
  reactionsAlign?: "start" | "end";

  /** Additional Tailwind classes applied to the root `Bubble` element. */
  className?: string;
  /** Additional Tailwind classes applied to `BubbleContent`. */
  contentClassName?: string;
  /** Additional Tailwind classes applied to `BubbleReactions`. */
  reactionsClassName?: string;

  /** Inline styles applied to the root `Bubble` element. */
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// shad/bubble-group — group consecutive bubbles from the same sender.
// ---------------------------------------------------------------------------

export const BUBBLE_GROUP_CARD = "shad/bubble-group";

export const BubbleGroup =
  createCardDeclaration<BubbleGroupProps>(BUBBLE_GROUP_CARD);

export type BubbleGroupProps = {
  /** Ordered list of `shad/bubble` card refs to stack. */
  content: PiCardRef[];
  /** Additional Tailwind classes applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
};
