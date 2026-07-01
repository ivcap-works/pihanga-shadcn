/**
 * `definePlayground` — the single authoring helper used in every
 * `<card>.example.ts` file.
 *
 * It is intentionally thin: it validates the required fields at
 * module-load time and returns the definition unchanged.  All type
 * safety comes from the generic parameter `P`.
 *
 * @example
 * ```ts
 * // src/cards/badge/badge.example.ts
 * import {definePlayground} from "@/playground/definePlayground";
 * import type {BadgeCardProps} from "./badge.types";
 *
 * export default definePlayground<BadgeCardProps>({
 *   cardId: "shad/badge",
 *   title:  "Badge",
 *   defaultProps: { label: "New", variant: "default" },
 *   controls: [
 *     { prop: "variant", type: "token", options: ["default", "secondary", "destructive", "outline"] },
 *     { prop: "label",   type: "text"  },
 *   ],
 * });
 * ```
 *
 * The `introduction` field is optional: prefer placing the card description in
 * a `README.md` file next to the example file.  The code-generation step
 * (`yarn gen-playground`) will read the README and inject its content as the
 * introduction automatically.
 */

import type {PlaygroundDef} from "./playground.types";

export function definePlayground<
  P extends Record<string, unknown> = Record<string, unknown>,
>(def: PlaygroundDef<P>): PlaygroundDef<P> {
  if (!def.cardId) {
    throw new Error(
      `[definePlayground] Missing required field "cardId" in playground definition`,
    );
  }
  if (!def.title) {
    throw new Error(
      `[definePlayground] Missing required field "title" in playground definition for cardId "${def.cardId}"`,
    );
  }

  // Validate that defaultProps is serialisable (catches accidental memo/function
  // references at development time; skipped in production).
  if (import.meta.env.DEV) {
    try {
      JSON.stringify(def.defaultProps);
    } catch {
      throw new Error(
        `[definePlayground] "defaultProps" for card "${def.title}" is not JSON-serialisable. ` +
          `Remove any memo() wrappers or function values — playground props must be plain data.`,
      );
    }
  }

  return def;
}
