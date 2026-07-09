import {
  createCardDeclaration2,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_PAGE_WITH_NAVBAR_META_CARD = "pi/pageWithNavbarMeta";

export const PageWithNavbarMeta = createCardDeclaration2<
  PageWithNavbarMetaDynProps,
  PageWithNavbarMetaStaticProps,
  PageWithNavbarMetaEvents
>(PI_PAGE_WITH_NAVBAR_META_CARD);

export const PAGE_WITH_NAVBAR_META_ACTION = registerActions(
  PI_PAGE_WITH_NAVBAR_META_CARD,
  ["navigate_to"],
);

export const onPageWithNavbarMetaNavigateTo =
  createOnAction<PageWithNavbarMetaNavigateToEvent>(
    PAGE_WITH_NAVBAR_META_ACTION.NAVIGATE_TO,
  );

export type NavLink = {
  id: string;
  title?: string;
};

/**
 * Props that are evaluated **statically** in the mapper body.
 * Passing a `memo(...)` selector for any of these will throw at runtime.
 */
export type PageWithNavbarMetaStaticProps = {
  /**
   * Name of an icon registered via {@link registerIcon}.
   * When provided, the icon is rendered next to the title in the header.
   */
  iconName?: string;

  /**
   * Optional footer card rendered below the main content area.
   * When omitted the footer row is not rendered.
   *
   * To conditionally show/hide a footer, wrap it in a `Conditional` card.
   */
  footer?: PiCardRef;

  /**
   * Navigation links rendered in the header.
   * On small screens they are collapsed behind a hamburger drawer.
   */
  navLinks?: NavLink[];

  /**
   * Reserved — not yet implemented.
   * When `Box` gains `scrollResetKey` support, this prop will scroll
   * the main content area back to the top whenever the value changes.
   */
  scrollResetKey?: string;

  /**
   * Optional card shown on the left side of the header action area.
   * To use a reactive card ref, wrap it in a stable `registerCard` slot.
   */
  headerLeftCard?: PiCardRef;

  /**
   * Optional card shown on the right side of the header action area.
   * To use a reactive card ref, wrap it in a stable `registerCard` slot.
   */
  headerRightCard?: PiCardRef;

  /** Additional Tailwind classes applied to the outermost wrapper. */
  className?: string;
};

/**
 * Props that support **reactive** state selectors (`memo(...)`).
 * These are resolved lazily inside child card prop functions via `resolve()`.
 */
export type PageWithNavbarMetaDynProps = {
  /** Page title displayed in the header. Supports reactive selectors. */
  title: string;

  /**
   * The main content card.
   * Supports reactive selectors (e.g. `memo((s) => s.currentPage, ...)`).
   */
  main: PiCardRef;
};

/** Combined props type — intersection of static and dynamic props. */
export type PageWithNavbarMetaProps = PageWithNavbarMetaStaticProps &
  PageWithNavbarMetaDynProps;

export type PageWithNavbarMetaNavigateToEvent = {id: string};

export type PageWithNavbarMetaEvents = {
  onNavigateTo: PageWithNavbarMetaNavigateToEvent;
};
