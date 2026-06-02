/**
 * Playground — public API barrel.
 *
 * Import from here when you need to author or consume playground definitions:
 *
 * ```ts
 * import {definePlayground, registerPlaygroundDef} from "@/playground";
 * ```
 *
 * Cards register themselves by calling `registerPlaygroundDef` from their
 * own `index.ts` (or a sibling `index.playground.ts`), passing the default
 * export of their `<card>.example.ts` file.
 *
 * The playground engine (cards under `src/playground/cards/`) reads the
 * registry at runtime to build the list and detail views.
 */

// Core authoring helper (used in every <card>.example.ts)
export {definePlayground} from "./definePlayground";

// Registry — register and look up PlaygroundDef entries
export {
  registerPlaygroundDef,
  getPlaygroundDef,
  getAllPlaygroundDefs,
  getPlaygroundCardIds,
} from "./registry";

// Types — needed when authoring PlaygroundDef objects
export type {
  PlaygroundDef,
  PlaygroundFacet,
  PlaygroundControl,
  TokenControl,
  SelectControl,
  TextControl,
  BooleanControl,
} from "./playground.types";

// State slice type — merge into AppState
export type {PlaygroundState} from "./playground.state";

// Playground page init + card-ID constants
export {playgroundPiInit, PlaygroundCard} from "./playground.pihanga";

// Static example list (generated — re-run `yarn gen-playground` after changes)
export {PLAYGROUND_EXAMPLES} from "./playground.examples.gen";
