import {definePlayground} from "@/playground/definePlayground";
import {
  PageWithNavbarMeta,
  onPageWithNavbarMetaNavigateTo,
  type PageWithNavbarMetaProps,
} from "./index";

export default definePlayground<PageWithNavbarMetaProps>({
  cardId: "pi/pageWithNavbarMeta",
  title: "Page With Navbar (Meta)",

  preview: (props) => PageWithNavbarMeta(props),

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
        "Navigation links in the header — collapsed to a hamburger drawer on small screens.",
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
      id: "with-icon",
      title: "With icon",
      description:
        "An icon registered via `registerIcon` is shown next to the title.",
      props: {
        title: "Pihanga shadcn",
        iconName: "mountain-snow",
        main: "pi/empty",
        navLinks: [
          {id: "home", title: "Home"},
          {id: "playground", title: "Playground"},
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
    onPageWithNavbarMetaNavigateTo(r, (state, ev) => {
      logEvent(state, "onPageWithNavbarMetaNavigateTo", {id: ev.id});
    });
  },

  note: `
Wire the meta page shell with navigation and header actions:

\`\`\`ts
import {registerCard, register, memo} from "@pihanga2/core";
import {
  PageWithNavbarMeta,
  onPageWithNavbarMetaNavigateTo,
} from "@pihanga2/shadcn";
import {ModeToggle} from "@pihanga2/shadcn";
import type {AppState} from "@/app.state";

register((r) => {
  onPageWithNavbarMetaNavigateTo(r, (state, {id}) => {
    state.currentPage = id;
  });
});

registerCard("myApp/modeToggle", ModeToggle({variant: "outline"}));

registerCard("myApp/page", PageWithNavbarMeta({
  title:           "My App",
  iconName:        "mountain-snow",
  main:            memo((s: AppState) => \`myApp/page/\${s.currentPage}\`),
  headerRightCard: "myApp/modeToggle",
  navLinks: [
    {id: "home",     title: "Home"},
    {id: "reports",  title: "Reports"},
    {id: "settings", title: "Settings"},
  ],
}));
\`\`\`
  `.trim(),
});
