/**
 * app.pihanga.ts — classic counter example
 *
 * Demonstrates two ways to handle card events:
 *
 *   ┌─────────────────────────────────────────┐
 *   │  [−]   Count: 0   [+]                   │
 *   └─────────────────────────────────────────┘
 *
 * - `registerFramework` sets the root card (wraps the app in ThemeProvider)
 * - `registerCard` declares a named card — no JSX, just a plain object
 * - [−] uses an INLINE `onClicked` reducer directly on the anonymous card
 * - [+] is a TOP-LEVEL named card; its event is handled externally in
 *       app.reducer.ts via `register()` + `onButtonClicked`
 * - `text: (s) => ...` on Typography re-renders whenever `s.count` changes
 */

import {registerCard, registerFramework} from "@pihanga2/core";
import {SdFramework} from "@pihanga2/shadcn/cards/framework";
import {Stack} from "@pihanga2/shadcn/cards/stack";
import {Button} from "@pihanga2/shadcn/cards/button";
import {Typography} from "@pihanga2/shadcn/cards/typography";

import type {AppState} from "./app.state";

export function appPiInit(): void {
  // ── Root framework card ────────────────────────────────────────────────────
  // Registers the single "_window" card that wraps the app in ThemeProvider.
  registerFramework(SdFramework({page: "counter/page", theme: "light"}));

  // ── Counter page ──────────────────────────────────────────────────────────
  // A horizontal Stack containing two Buttons and a live count display.
  //
  // Inline `onClicked` handlers are Immer reducers: mutate `state` directly.
  // The Typography `text` prop is a state-selector — it re-runs whenever the
  // Redux state changes and returns a new string.
  registerCard(
    "counter/page",
    Stack<AppState>({
      direction: "row",
      alignItems: "center",
      spacing: 4,
      className: "p-16 justify-center",
      content: [
        // Decrement button
        Button<AppState>({
          label: "−",
          opts: {size: "lg"},
          onClicked: (state) => {
            state.count -= 1;
          },
        }),

        // Live count display — re-renders on every state change
        Typography<AppState>({
          text: (s) => `Count: ${s.count}`,
          level: "h2",
          className: "min-w-[120px] text-center",
        }),

        // Increment button
        "counter/plus",
      ],
    }),
  );

  // Increment button — event handled externally in app.reducer.ts
  registerCard(
    "counter/plus",
    Button({
      label: "+",
      opts: {size: "lg"},
    }),
  );
}
