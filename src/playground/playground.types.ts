/**
 * Core type definitions for the Pihanga card Playground.
 *
 * A `PlaygroundDef` is authored once per card in that card's `<card>.example.ts`
 * file and consumed by the playground engine at runtime to build the interactive
 * documentation page.
 */

import type {PiCardRef} from "@pihanga2/core";

// ---------------------------------------------------------------------------
// Event log types
// ---------------------------------------------------------------------------

/**
 * A single captured event entry appended to the playground event log when
 * the user interacts with a live preview.
 *
 * Populated by `PlaygroundDef.registerEvents` handlers and displayed in the
 * "Events" panel beside the facet props JSON viewer.
 */
export type PlaygroundEventRecord = {
  /** Human-readable event name shown in the panel (e.g. `"onPiButtonClicked"`). */
  label: string;
  /** Serialisable event payload displayed as a collapsible JSON tree. */
  data: Record<string, unknown>;
  /**
   * Sequential index (0-based, assigned at push time).
   * Used as a stable rendering key and for newest-first ordering.
   */
  index: number;
};

/**
 * Logger function provided by the playground engine to `PlaygroundDef.registerEvents`.
 *
 * Call it from inside a pihanga event handler to append an entry to the
 * on-screen event log.  The playground engine automatically guards the call:
 * if the playground is not currently displaying the matching card, it is a
 * no-op so these handlers are safe to leave registered permanently.
 *
 * @param state - The Immer state draft from the enclosing pihanga event handler.
 * @param label - Human-readable event name shown in the "Events" viewer panel.
 * @param data  - Serialisable payload to display as JSON.
 */
export type PlaygroundLogEventFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any,
  label: string,
  data: Record<string, unknown>,
) => void;

// ---------------------------------------------------------------------------
// Primary definition type
// ---------------------------------------------------------------------------

/**
 * A complete playground definition for one card.
 *
 * @template P - The card's Props type (must extend `Record<string, unknown>`
 *   so that `defaultProps` stays serialisable and JSON-safe).
 */
export type PlaygroundDef<
  P extends Record<string, unknown> = Record<string, unknown>,
> = {
  /**
   * Must match the card's `CARD_ID` constant (e.g. `"shad/badge"`).
   *
   * The playground engine uses this string to:
   * 1. Identify the entry in the card list.
   * 2. Call `registerCard(cardId, CardFactory(currentProps))` when rendering
   *    the live preview.
   */
  cardId: string;

  /** Human-readable title shown in the card list and as the page heading. */
  title: string;

  /**
   * Introduction text rendered above the live preview.
   *
   * Plain text or lightweight markdown (paragraph breaks only — no custom
   * renderer is required for the initial phase).  Keep it short: two or
   * three paragraphs explaining what the card is and when to use it.
   */
  introduction: string;

  /**
   * Starting props for the live preview.
   *
   * **Must be fully serialisable** — no `memo()` wrappers, no functions, no
   * class instances.  The playground engine stores this object in Redux state
   * and serialises it to display in the JSON viewer / editor.
   *
   * Real app usage patterns (e.g. `memo((s: AppState) => s.foo)`) belong in
   * `app.pihanga.ts`, not here.  Example files show the *data* shape only.
   */
  defaultProps: P;

  /**
   * Optional live-preview factory.
   *
   * When provided, the playground engine renders a live preview of the card
   * in a centred container above the JSON props viewer for each facet.
   * The engine calls `preview({ ...defaultProps, ...facet.props })` and
   * renders the returned `PiCardRef` inline.
   *
   * @example
   * ```ts
   * import {ShadBadge} from "./index";
   * // ...
   * preview: (props) => ShadBadge(props),
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview?: (props: any) => PiCardRef;

  /**
   * Named usage scenarios ("facets") shown as a selector or tab row above the
   * live preview.
   *
   * Selecting a facet deep-merges `facet.props` on top of `defaultProps` and
   * stores the result as `playgroundCurrentProps` in state, causing the preview
   * and JSON view to update immediately.
   */
  facets?: PlaygroundFacet<Partial<P>>[];

  /**
   * Declarative controls rendered in the "Controls" panel.
   *
   * Each control maps to exactly one prop key and renders the appropriate
   * interactive widget (token-pills, select, text input, or toggle).
   * Changing a control dispatches `onPlaygroundPropChanged` which updates
   * `playgroundCurrentProps` in state.
   */
  controls?: PlaygroundControl[];

  /**
   * Optional hook for registering event listeners in the playground engine.
   *
   * When provided, the playground engine calls this function once during
   * `register()` (i.e. at application boot).  Use it to register pihanga
   * event handlers that call `logEvent` to append captured events to the
   * on-screen "Events" panel shown beside the facet props JSON viewer.
   *
   * The event panel is shown automatically for any card that declares this
   * field, mirroring the same side-by-side split layout used by the Controls
   * section (controls left, JSON right → props JSON left, events right).
   *
   * The `logEvent` function is a no-op when the playground is not currently
   * showing this card, so these handlers are safe to leave registered
   * permanently without interfering with other cards.
   *
   * The event log is cleared automatically whenever the user selects a
   * different card or switches to a different facet tab.
   *
   * @example
   * ```ts
   * import {onPiButtonClicked} from "./index";
   *
   * registerEvents: (r, logEvent) => {
   *   onPiButtonClicked(r, (state, ev) => {
   *     logEvent(state, "onPiButtonClicked", { id: ev.id });
   *   });
   * },
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerEvents?: (r: any, logEvent: PlaygroundLogEventFn) => void;

  /**
   * Real-app usage note rendered below the playground (not part of the live demo).
   *
   * Plain markdown.  Use it to show how the card is wired in a real
   * `app.pihanga.ts` — e.g. `memo()` selectors, `register()` calls, and
   * event handlers that belong in application code rather than in the
   * data-only `defaultProps`.
   *
   * The playground engine renders this section under a "Real-app usage" heading
   * so readers can quickly copy the wiring pattern.
   */
  note?: string;
};

// ---------------------------------------------------------------------------
// Facets
// ---------------------------------------------------------------------------

/**
 * A named scenario demonstrating a specific card configuration.
 *
 * @template P - A partial subset of the card's Props type.
 */
export type PlaygroundFacet<P = Record<string, unknown>> = {
  /** Unique identifier within this card's facet list. */
  id: string;

  /** Short label shown in the facet selector (e.g. "Default", "Destructive"). */
  title: string;

  /** Optional one-sentence description shown beneath the facet title. */
  description?: string;

  /**
   * Props for this facet.
   *
   * Applied on top of (`Object.assign`-merged with) `PlaygroundDef.defaultProps`
   * when the facet is selected, so you only need to specify the props that
   * differ from the defaults.
   */
  props: P;
};

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

/**
 * Union of all interactive control types supported by the playground panel.
 *
 * Each variant corresponds to a different UI widget:
 *
 * | Type        | Widget                          | Best for                        |
 * |-------------|----------------------------------|---------------------------------|
 * | `"token"`   | Pill-style single-select row     | Short enumerated options (≤ 6)  |
 * | `"select"`  | `<select>` dropdown              | Long enumerated options (> 6)   |
 * | `"text"`    | Free-text `<input>`              | String props (label, placeholder)|
 * | `"boolean"` | Checkbox / toggle                | `true` / `false` props          |
 */
export type PlaygroundControl =
  | TokenControl
  | SelectControl
  | TextControl
  | BooleanControl;

/**
 * Pill-row single-select control (the "Variant", "Size", "Orientation" style
 * shown in the reference screenshot).
 */
export type TokenControl = {
  prop: string;
  type: "token";
  /** Defaults to the `prop` name capitalised if omitted. */
  label?: string;
  /** Ordered list of option values displayed as pill buttons. */
  options: string[];
};

/**
 * Dropdown `<select>` control — use when the option list is too long for pills.
 */
export type SelectControl = {
  prop: string;
  type: "select";
  label?: string;
  options: string[];
};

/**
 * Free-text input control for string props such as `label`, `placeholder`,
 * `className`, etc.
 */
export type TextControl = {
  prop: string;
  type: "text";
  label?: string;
  placeholder?: string;
};

/**
 * Boolean checkbox / toggle control for props like `disabled`, `selfManaged`,
 * `striped`, etc.
 */
export type BooleanControl = {
  prop: string;
  type: "boolean";
  label?: string;
};
