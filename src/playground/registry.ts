/**
 * Playground definition registry.
 *
 * A module-level `Map` that stores one `PlaygroundDef` per card, keyed by
 * `cardId`.  Populated at app startup — each card that wants to appear in
 * the playground calls `registerPlaygroundDef(def)` (typically from its
 * `index.ts` or a dedicated `index.playground.ts` side-file).
 *
 * The playground pihanga wiring then reads the registry to:
 *   - Build the card list (left-hand navigation).
 *   - Load the `PlaygroundDef` when a card is selected.
 *   - Provide `defaultProps` / `controls` / `facets` to the detail view.
 *
 * @example
 * ```ts
 * // src/cards/badge/index.ts  (or index.playground.ts)
 * import badgeDef from "./badge.example";
 * import {registerPlaygroundDef} from "@/playground/registry";
 *
 * registerPlaygroundDef(badgeDef);
 * ```
 */

import type {PlaygroundDef} from "./playground.types";

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

const _registry = new Map<string, PlaygroundDef>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a playground definition.
 *
 * Typically called once at module-init time from a card's `index.ts`.
 * Re-registering the same `cardId` overwrites the previous entry (useful
 * during hot-module-replacement in development).
 */
export function registerPlaygroundDef(def: PlaygroundDef): void {
  _registry.set(def.cardId, def);
}

/**
 * Look up the playground definition for a specific card.
 *
 * Returns `undefined` when the card has not registered a playground definition.
 */
export function getPlaygroundDef(cardId: string): PlaygroundDef | undefined {
  return _registry.get(cardId);
}

/**
 * Return all registered playground definitions in insertion order.
 *
 * Used by the playground list card to build the navigation index.
 */
export function getAllPlaygroundDefs(): PlaygroundDef[] {
  return [..._registry.values()];
}

/**
 * Return the sorted card IDs of all registered playground definitions.
 *
 * Convenience helper for building the navigation list.
 */
export function getPlaygroundCardIds(): string[] {
  return [..._registry.keys()].sort();
}
