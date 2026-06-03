/**
 * Playground definition for the `pageWithNavbar` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  PageWithNavbar,
  onPageWithNavbarNavigateTo,
  type PageWithNavbarProps,
} from "./index";

export default definePlayground<PageWithNavbarProps>({
  cardId: "pageWithNavbar",
  title: "Page With Navbar",

  introduction: `
The primary full-page shell card.

Renders a responsive header with a logo/title, optional navigation links
(collapsed into a hamburger on small screens), left and right header action
slots, and a scrollable main content area.  An optional footer row can be
shown below the main content.

Use this as the outermost card for most app pages.  Pair it with
\`ModeToggle\` in \`headerRightCard\` for a theme switcher, and with
\`NavbarSearch\` in \`headerLeftCard\` for a global search bar.

The \`navLinks\` array drives the navigation; clicking a link emits
\`onNavigateTo\` with the link's \`id\`.
  `.trim(),

  preview: (props) => PageWithNavbar(props),

  defaultProps: {
    title: "My Application",
    main: "pi/empty",
    navLinks: [
      {id: "home", title: "Home"},
      {id: "docs", title: "Docs"},
      {id: "settings", title: "Settings"},
    ],
  },

  facets: [
    {
      id: "minimal",
      title: "Minimal",
      description:
        "Title and main content only — no nav links or action slots.",
      props: {
        title: "My App",
        main: "pi/empty",
      },
    },
    {
      id: "with-nav-links",
      title: "With nav links",
      description:
        "Navigation links in the header — collapsed to a hamburger on small screens.",
      props: {
        title: "My App",
        main: "pi/empty",
        navLinks: [
          {id: "home", title: "Home"},
          {id: "about", title: "About"},
          {id: "contact", title: "Contact"},
        ],
      },
    },
    {
      id: "with-header-actions",
      title: "With header actions",
      description: "Optional cards in the left and right header action slots.",
      props: {
        title: "Dashboard",
        main: "pi/empty",
        navLinks: [
          {id: "home", title: "Home"},
          {id: "reports", title: "Reports"},
        ],
        headerRightCard: "pi/empty",
        headerLeftCard: "pi/empty",
      },
    },
    {
      id: "with-footer",
      title: "With footer",
      description: "Optional footer card rendered below the main content area.",
      props: {
        title: "My App",
        main: "pi/empty",
        footer: "pi/empty",
      },
    },
  ],

  controls: [
    {prop: "title", type: "text", label: "Title", placeholder: "App name…"},
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. max-w-screen-xl",
    },
  ],

  registerEvents: (r, logEvent) => {
    onPageWithNavbarNavigateTo(r, (state, ev) => {
      logEvent(state, "onPageWithNavbarNavigateTo", {id: ev.id});
    });
  },

  note: `
Wire the page shell with navigation and header actions:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {PageWithNavbar, onPageWithNavbarNavigateTo} from "@/cards/pageWithNavbar";
import {ModeToggle} from "@/cards/modeToggle";
import {NavbarSearch} from "@/cards/navbarSearch";
import {Toast} from "@/cards/toast";
import type {AppState} from "@/app.state";

register((r) => {
  onPageWithNavbarNavigateTo(r, (state, {id}) => {
    state.currentPage = id;
  });
});

registerCard("myApp/modeToggle",  ModeToggle({variant: "outline"}));
registerCard("myApp/searchBar",   NavbarSearch({placeholder: "Search…"}));
registerCard("myApp/toast",       Toast({variant: "default", duration: 4000}));

registerCard("myApp/page", PageWithNavbar({
  title:           "My App",
  main:            memo((s: AppState) => \`myApp/page/\${s.currentPage}\`),
  headerRightCard: "myApp/modeToggle",
  headerLeftCard:  "myApp/searchBar",
  navLinks: [
    {id: "home",     title: "Home"},
    {id: "reports",  title: "Reports"},
    {id: "settings", title: "Settings"},
  ],
}));
\`\`\`
  `.trim(),
});
