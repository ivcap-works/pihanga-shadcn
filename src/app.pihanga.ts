/**
 * app.pihanga.ts
 *
 * Top-level app configuration.
 *
 * Layout:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  PageWithNavbar — "Pihanga shadcn"                   │
 *   │  nav: [Introduction] [Playground]                    │
 *   │  ┌────────────────────────────────────────────────┐  │
 *   │  │  Introduction                                  │  │
 *   │  │  MarkdownViewer  ← /AGENTS.md                 │  │
 *   │  │                                                │  │
 *   │  │  ── or (when nav = "playground") ──            │  │
 *   │  │                                                │  │
 *   │  │  Playground (two-column)                       │  │
 *   │  │  ┌──────────────┬───────────────────────────┐  │  │
 *   │  │  │  Card list   │  Detail panel             │  │  │
 *   │  │  └──────────────┴───────────────────────────┘  │  │
 *   │  └────────────────────────────────────────────────┘  │
 *   └──────────────────────────────────────────────────────┘
 *
 * Navigation is handled via PageWithNavbar's `navLinks` + `onPageWithNavbarNavigateTo`.
 * The active page id is stored in `state.currentPage` and `main` resolves the card
 * name dynamically via `memo`.
 *
 * Note: AGENTS.md must be available at /AGENTS.md for the MarkdownViewer to fetch it.
 * The rootFilePlugin in vite.config.ts handles this automatically in dev and build.
 */

import {memo, register, registerCard, registerFramework} from "@pihanga2/core";
import {SdFramework} from "./cards/framework";
import {
  PageWithNavbar,
  onPageWithNavbarNavigateTo,
} from "./cards/pageWithNavbar";
import {MarkdownViewer} from "./cards/markdownViewer";
import {FlexGrid} from "./cards/flexGrid";

import type {AppState} from "./app.state";
import {
  playgroundPiInit,
  PlaygroundCard,
} from "./playground/playground.pihanga";

// ============================================================================
// Card IDs
// ============================================================================

export const AppCard = {
  Main: "app/main",
  IntroductionPage: "app/page/introduction",
  PlaygroundPage: "app/page/playground",
} as const;

// ============================================================================
// Init
// ============================================================================

export function appPiInit(): void {
  // ── Playground cards (list + detail + event handlers) ───────────────────────
  // playgroundPiInit() no longer registers a framework or page shell — it only
  // registers PlaygroundCard.List, PlaygroundCard.Detail, and their event wiring.
  playgroundPiInit();

  // ── Framework root ─────────────────────────────────────────────────────────
  registerFramework(
    SdFramework({
      page: AppCard.Main,
      theme: "light",
    }),
  );

  // ── Navigation handler ─────────────────────────────────────────────────────
  // Store the clicked nav link id in state so the memo below can switch pages.
  register((r) => {
    onPageWithNavbarNavigateTo(r, (state: AppState, {id}) => {
      state.currentPage = id;
    });
  });

  // ── Main shell ─────────────────────────────────────────────────────────────
  // `main` resolves to `app/page/<currentPage>` which switches between the
  // Introduction and Playground cards below.
  registerCard(
    AppCard.Main,
    PageWithNavbar({
      title: "Pihanga shadcn",
      iconName: "mountain-snow",
      navLinks: [
        {id: "introduction", title: "Introduction"},
        {id: "playground", title: "Playground"},
      ],
      main: memo(
        (s: AppState) => s.currentPage ?? "introduction",
        (page) => `app/page/${page}`,
      ),
    }),
  );

  // ── Introduction page ──────────────────────────────────────────────────────
  // MarkdownViewer fetches AGENTS.md via HTTP — served by rootFilePlugin in
  // vite.config.ts (dev) and emitted to dist/ during production build.
  registerCard(
    AppCard.IntroductionPage,
    MarkdownViewer({
      path: "/AGENTS.md",
      className: "p-4 max-w-4xl mx-auto",
    }),
  );

  // ── Playground page — two-column FlexGrid ──────────────────────────────────
  // PlaygroundCard.List and PlaygroundCard.Detail are registered by
  // playgroundPiInit() above.  We assemble them into the same two-column
  // layout that playground.pihanga.ts previously embedded inside its own
  // PageWithNavbar shell.
  registerCard(
    AppCard.PlaygroundPage,
    FlexGrid({
      cards: {
        list: PlaygroundCard.List,
        detail: PlaygroundCard.Detail,
      },
      template: {
        area: [["list", "detail"]],
        columns: ["260px", "1fr"],
        gap: "16px",
      },
      overflow: "auto",
    }),
  );
}
