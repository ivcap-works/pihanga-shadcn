/**
 * app.reducer.ts — event handlers for named cards
 *
 * This module demonstrates the second way to handle card events in Pihanga:
 * using `register()` + card-specific `on*` helpers instead of the inline
 * `onClicked` attribute on the card declaration itself.
 *
 * Comparison:
 *
 *   Inline (anonymous/named card):
 *     Button({ label: "+", onClicked: (state) => { state.count += 1 } })
 *
 *   External reducer (named card only):
 *     registerCard("counter/plus", Button({ label: "+" }))   ← in app.pihanga.ts
 *     onButtonClicked(r, (state, {cardID}) => {              ← here
 *       if (cardID === "counter/plus") state.count += 1
 *     })
 *
 * The `register()` callback is called once during app boot (inside `start()`).
 * `onButtonClicked` wires a Redux reducer that runs on every button-click
 * action; the `cardID` filter ensures we only react to the "+" button.
 */

import {register} from "@pihanga2/core";
import {onButtonClicked} from "@pihanga2/shadcn/cards/button";
import type {AppState} from "./app.state";

register((r) => {
  // Handle the named "counter/plus" button click.
  // `cardID` matches the card name passed to registerCard() in app.pihanga.ts.
  onButtonClicked<AppState>(r, (state, {cardID}) => {
    if (cardID === "counter/plus") {
      state.count += 1;
    }
  });
});
