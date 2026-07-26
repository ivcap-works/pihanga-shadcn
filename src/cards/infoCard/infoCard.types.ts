import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";
import type React from "react";

export const INFO_CARD = "shad/info-card";

export type InfoCardProps = {
  /**
   * Text rendered inside `CardTitle`.
   * Leave unset to omit the title element entirely.
   */
  title?: string;

  /**
   * Text rendered inside `CardDescription`.
   * Leave unset to omit the description element entirely.
   */
  description?: string;

  /**
   * Pihanga card reference rendered inside the `CardAction` slot.
   * Positioned at the top-right of the header (e.g. a button, badge, or icon).
   */
  actionCard?: PiCardRef;

  /**
   * Pihanga card reference rendered inside `CardContent`.
   * Main body of the card — use any layout or display card.
   */
  contentCard?: PiCardRef;

  /**
   * Pihanga card reference rendered inside `CardFooter`.
   * Typically a row of actions or a status line.
   */
  footerCard?: PiCardRef;

  // ── Per-element className overrides ────────────────────────────────────────

  /** Extra CSS classes applied to the root `<div data-slot="card">`. */
  className?: string;

  /** Extra CSS classes applied to `<div data-slot="card-header">`. */
  headerClassName?: string;

  /** Extra CSS classes applied to `<div data-slot="card-title">`. */
  titleClassName?: string;

  /** Extra CSS classes applied to `<div data-slot="card-description">`. */
  descriptionClassName?: string;

  /** Extra CSS classes applied to `<div data-slot="card-action">`. */
  actionClassName?: string;

  /** Extra CSS classes applied to `<div data-slot="card-content">`. */
  contentClassName?: string;

  /** Extra CSS classes applied to `<div data-slot="card-footer">`. */
  footerClassName?: string;

  /** Inline styles applied to the root card element. */
  style?: React.CSSProperties;
};

/**
 * Factory function for declaring a `shad/info-card` instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {InfoCard} from "@/cards/infoCard";
 * import {Typography} from "@/cards/typography";
 * import {Button} from "@/cards/button";
 *
 * registerCard("myApp/userCard", InfoCard({
 *   title: "John Doe",
 *   description: "Software Engineer",
 *   actionCard: "myApp/editButton",
 *   contentCard: "myApp/userDetails",
 *   footerCard: "myApp/userActions",
 * }));
 * ```
 */
export const InfoCard = createCardDeclaration<InfoCardProps>(INFO_CARD);
