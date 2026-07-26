import {
  createCardDeclaration,
  createOnAction,
  registerActions,
  type PiCardRef,
} from "@pihanga2/core";
import type React from "react";

export const COLLAPSIBLE_CARD = "shad/collapsible";

export const COLLAPSIBLE_CARD_ACTION = registerActions(COLLAPSIBLE_CARD, [
  "openChanged",
]);

export type CollapsibleCardOpenChangedEvent = {open: boolean};

export const onCollapsibleCardOpenChanged =
  createOnAction<CollapsibleCardOpenChangedEvent>(
    COLLAPSIBLE_CARD_ACTION.OPENCHANGED,
  );

export type CollapsibleCardEvents = {
  onOpenChanged: CollapsibleCardOpenChangedEvent;
};

/**
 * Subset of shadcn/ui typography levels supported for the built-in title slot.
 */
export type CollapsibleTitleLevel =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "lead"
  | "large"
  | "small"
  | "muted";

export type CollapsibleCardProps = {
  /**
   * Plain-text title rendered in the trigger row using the built-in
   * Typography styles.  Use `titleCard` instead to supply a full Pihanga card.
   */
  title?: string;

  /**
   * Typography level applied to `title`.
   * @default "h4"
   */
  titleLevel?: CollapsibleTitleLevel;

  /**
   * Alternative to `title` — any Pihanga card reference rendered as the
   * header (e.g. a `shad/typography` or `shad/badge` card).
   * When provided, `title` and `titleLevel` are ignored.
   */
  titleCard?: PiCardRef;

  /**
   * Icon name from the Pihanga icon registry, shown inside the toggle button.
   * Falls back to the built-in `ChevronsUpDown` icon when omitted.
   *
   * @example
   * import {registerIcon} from "@/cards/icons";
   * import {ChevronDown} from "lucide-react";
   * registerIcon("chevron-down", ChevronDown);
   * CollapsibleCard({ icon: "chevron-down", ... });
   */
  icon?: string;

  /**
   * Pihanga card reference rendered inside the collapsible body.
   */
  contentCard?: PiCardRef;

  /**
   * Whether the panel is open on first render (uncontrolled mode).
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Controlled open state.  When provided, the component delegates all open
   * state management to the consumer — update this via `onOpenChanged`.
   */
  open?: boolean;

  /** CSS classes applied to the root `<div>`. */
  className?: string;

  /** CSS classes applied to the trigger row (title + toggle button). */
  headerClassName?: string;

  /** CSS classes applied to the collapsible content wrapper `<div>`. */
  contentClassName?: string;

  /** Inline styles on the root element. */
  style?: React.CSSProperties;
};

/**
 * Factory function for declaring a `shad/collapsible` card instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {CollapsibleCard} from "@/cards/collapsibleCard";
 * import {Typography} from "@/cards/typography";
 *
 * registerCard("myApp/details", CollapsibleCard({
 *   title: "Advanced options",
 *   titleLevel: "h4",
 *   contentCard: "myApp/detailsBody",
 * }));
 *
 * registerCard("myApp/detailsBody", Typography({
 *   text: "Hidden content revealed when expanded.",
 *   level: "p",
 * }));
 * ```
 */
export const CollapsibleCard = createCardDeclaration<
  CollapsibleCardProps,
  CollapsibleCardEvents
>(COLLAPSIBLE_CARD);
