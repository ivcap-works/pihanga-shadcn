/**
 * Playground definition for the `navbarSearch` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  NavbarSearch,
  onNavbarSearchSubmit,
  onNavbarSearchItems,
  onNavbarSearchFocus,
  type NavbarSearchProps,
} from "./index";

export default definePlayground<NavbarSearchProps>({
  cardId: "navbarSearch",
  title: "Navbar Search",

  introduction: `
A search input designed to live in an app navbar.

Supports type-ahead suggestions via \`searchItems\` (an array of strings shown
as dropdown options as the user types).  The card emits three events:

- \`onSearchSubmit\` — fired when the user presses Enter or selects a suggestion.
- \`onSearchItems\` — fired on every keystroke with the current input value,
  allowing the host app to update \`searchItems\` dynamically.
- \`onSearchFocus\` — fired when the input receives keyboard focus.

Place it inside \`PageWithNavbar\`'s \`headerLeftCard\` or \`headerRightCard\`.
  `.trim(),

  preview: (props) => NavbarSearch(props),

  defaultProps: {
    placeholder: "Search…",
    searchItems: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Search input with no suggestions — submit on Enter.",
      props: {placeholder: "Search…"},
    },
    {
      id: "with-suggestions",
      title: "With suggestions",
      description:
        "Autocomplete dropdown — `searchItems` is pre-populated with options.",
      props: {
        placeholder: "Search fruits…",
        searchItems: ["Apple", "Apricot", "Avocado", "Banana", "Blueberry"],
      },
    },
    {
      id: "custom-placeholder",
      title: "Custom placeholder",
      description:
        "Descriptive placeholder text guides the user on what to search.",
      props: {
        placeholder: "Search by name or ID…",
        searchItems: [],
      },
    },
  ],

  controls: [
    {
      prop: "placeholder",
      type: "text",
      label: "Placeholder",
      placeholder: "Search…",
    },
  ],

  registerEvents: (r, logEvent) => {
    onNavbarSearchSubmit(r, (state, ev) => {
      logEvent(state, "onNavbarSearchSubmit", {search: ev.search});
    });
    onNavbarSearchItems(r, (state, ev) => {
      logEvent(state, "onNavbarSearchItems", {search: ev.search});
    });
    onNavbarSearchFocus(r, (state) => {
      logEvent(state, "onNavbarSearchFocus", {});
    });
  },

  note: `
Place the search bar in the header via \`PageWithNavbar\`:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {NavbarSearch, onNavbarSearchSubmit, onNavbarSearchItems} from "@/cards/navbarSearch";
import {PageWithNavbar} from "@/cards/pageWithNavbar";
import type {AppState} from "@/app.state";

register((r) => {
  // Update autocomplete suggestions as the user types
  onNavbarSearchItems(r, (state, {search}) => {
    state.searchQuery = search;
    state.searchSuggestions = state.allItems
      .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      .map((i) => i.name)
      .slice(0, 8);
  });

  // Navigate on submit
  onNavbarSearchSubmit(r, (state, {search}) => {
    state.currentSearch = search;
  });
});

registerCard("myApp/search", NavbarSearch({
  placeholder:  "Search…",
  searchItems:  memo((s: AppState) => s.searchSuggestions),
}));

registerCard("myApp/page", PageWithNavbar({
  title:          "My App",
  main:           "myApp/content",
  headerLeftCard: "myApp/search",
}));
\`\`\`
  `.trim(),
});
