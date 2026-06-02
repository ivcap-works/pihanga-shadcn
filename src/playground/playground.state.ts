/**
 * Playground slice of application state.
 *
 * Add `PlaygroundState` to your `AppState` union:
 *
 * ```ts
 * // src/app.state.ts
 * import type {PlaygroundState} from "@/playground/playground.state";
 *
 * export type AppState = ReduxState & PlaygroundState & {
 *   // ...existing fields
 * };
 * ```
 */

import type {PlaygroundEventRecord} from "./playground.types";

export type PlaygroundState = {
  /**
   * The `cardId` of the card currently shown in the playground detail view
   * (e.g. `"shad/badge"`).  `undefined` when no card is selected (shows a
   * "select a card" empty state).
   */
  playgroundSelectedCardId?: string;

  /**
   * The `id` of the facet currently selected for the active card.
   * Defaults to the first facet when a new card is selected.
   * `undefined` when the card has no facets.
   */
  playgroundSelectedFacetId?: string;

  /**
   * The live prop object driving the preview render and the JSON view.
   *
   * Lifecycle:
   * 1. Initialised from `PlaygroundDef.defaultProps` when a card is selected.
   * 2. Overwritten (merge of defaultProps + facet.props) when a facet is picked.
   * 3. Patched one key at a time as the user interacts with controls.
   * 4. Will be directly editable via the JSON editor card in Phase 2.
   *
   * **Must always be JSON-serialisable** — the JSON viewer card reads this
   * directly from state and pretty-prints it.
   */
  playgroundCurrentProps?: Record<string, unknown>;

  /**
   * Captured events from the live example preview, displayed in the "Events"
   * panel beside the facet props JSON viewer.
   *
   * Cleared automatically when the user selects a different card or switches
   * to a different facet tab.  Populated by `PlaygroundDef.registerEvents`
   * handlers via `makeEventLogger` in `playground.pihanga.ts`.
   */
  playgroundEventLog?: PlaygroundEventRecord[];
};
