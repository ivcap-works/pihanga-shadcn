import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";
import type {SizeMap} from "@/cards/types";

export const PAGE_WITH_NAVBAR_CARD = "pageWithNavbar";
export const PageWithNavbar = createCardDeclaration<
  PageWithNavbarProps,
  PageWithNavbarEvents
>(PAGE_WITH_NAVBAR_CARD);

export const PAGE_WITH_NAVBAR_ACTION = registerActions(PAGE_WITH_NAVBAR_CARD, [
  "navigate_to",
]);

export const onPageWithNavbarNavigateTo =
  createOnAction<PageWithNavbarNavigateToEvent>(
    PAGE_WITH_NAVBAR_ACTION.NAVIGATE_TO,
  );

/**
 * A card reference that can optionally vary by screen size.
 *
 * Pass a plain `PiCardRef` string to always show the same card, or a
 * {@link SizeMap} to show different cards (or none) at each breakpoint.
 *
 * @example
 * // Always show the same card
 * headerRightCard: "myAccountCard"
 *
 * // Show on md and above only
 * headerRightCard: { [ScreenSize.MD]: "myAccountCard" }
 *
 * // Different card per breakpoint
 * headerLeftCard: {
 *   [ScreenSize.XS]: "mobileSearchCard",
 *   [ScreenSize.MD]: "desktopSearchCard",
 * }
 */
export type ResponsiveCardRef = PiCardRef | SizeMap<PiCardRef>;

export type PageWithNavbarProps<S = unknown> = {
  /** Page title displayed in the header. */
  title: string;

  /**
   * Name of an icon registered via {@link registerIcon} in `icons.ts`.
   * When provided, the icon is rendered next to the title in the header.
   */
  iconName?: string;

  /** The main content card. */
  main: PiCardRef;

  /**
   * Optional footer card.
   * When omitted the footer row is not rendered.
   */
  footer?: PiCardRef;

  /**
   * Navigation links rendered in the header nav bar.
   * On small screens they are collapsed behind a hamburger menu.
   */
  navLinks?: NavLink[];

  /**
   * When this value changes the main content area scrolls back to the top.
   * Set it to any string that is unique per logical "page load" — typically
   * the URL or ID of the currently loaded resource (e.g. "foo.xml").
   */
  scrollResetKey?: string;

  /**
   * Optional card shown on the left side of the header actions area.
   * Supports size-dependent rendering via {@link ResponsiveCardRef}.
   */
  headerLeftCard?: ResponsiveCardRef;

  /**
   * Optional card shown on the right side of the header actions area.
   * Supports size-dependent rendering via {@link ResponsiveCardRef}.
   */
  headerRightCard?: ResponsiveCardRef;

  /** Additional style overrides passed through to the component. */
  style?: S;

  /** Additional CSS class names applied to the outermost wrapper. */
  className?: string;
};

export type NavLink = {
  id: string;
  title?: string;
};

export type PageWithNavbarNavigateToEvent = {id: string};

export type PageWithNavbarEvents = {
  onNavigateTo: PageWithNavbarNavigateToEvent;
};
