import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const NAVBAR_SEARCH_CARD = "navbarSearch";
export const NavbarSearch = createCardDeclaration<
  NavbarSearchProps,
  NavbarSearchEvents
>(NAVBAR_SEARCH_CARD);

export const NAVBAR_SEARCH_ACTION = registerActions(NAVBAR_SEARCH_CARD, [
  "search_submit",
  "search_items",
  "search_focus",
]);

export const onNavbarSearchSubmit =
  createOnAction<NavbarSearchEvent>(NAVBAR_SEARCH_ACTION.SEARCH_SUBMIT);
export const onNavbarSearchItems = createOnAction<NavbarSearchInputEvent>(
  NAVBAR_SEARCH_ACTION.SEARCH_ITEMS,
);
export const onNavbarSearchFocus = createOnAction<NavbarSearchFocusEvent>(
  NAVBAR_SEARCH_ACTION.SEARCH_FOCUS,
);

export type NavbarSearchProps = {
  searchItems?: string[];
  placeholder?: string;
};

export type NavbarSearchEvent = {search: string};
export type NavbarSearchInputEvent = {search: string};
export type NavbarSearchFocusEvent = Record<string, never>;

export type NavbarSearchEvents = {
  onSearchSubmit: NavbarSearchEvent;
  onSearchItems?: NavbarSearchInputEvent;
  onSearchFocus?: NavbarSearchFocusEvent;
};
