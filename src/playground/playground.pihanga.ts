/**
 * playground.pihanga.ts
 *
 * Registers the Playground page and all its child cards.
 * Swap the framework page to `PlaygroundCard.Page` in your app bootstrap
 * to activate the playground (see main.ts / app.pihanga.ts).
 *
 * Layout:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │  PageWithNavbar — "Playground"                   │
 *   │  ┌──────────────┬───────────────────────────┐   │
 *   │  │  List        │  Stack (detail)            │   │
 *   │  │  • Badge     │  h2  Badge                 │   │
 *   │  │  • Input  ◀  │  MarkdownViewer intro      │   │
 *   │  │  …           │  h4  Examples              │   │
 *   │  │              │  SdTabs [Default|Secondary…│   │
 *   │  │              │    └─ JsonViewer props      │   │
 *   │  │              │  h4  Controls              │   │
 *   │  │              │  Stack (live preview box)  │   │
 *   │  │              │  PlaygroundControls panel  │   │
 *   │  │              │  h4  Real-app usage        │   │
 *   │  │              │  MarkdownViewer note       │   │
 *   │  └──────────────┴───────────────────────────┘   │
 *   └──────────────────────────────────────────────────┘
 *
 * ── Card status ─────────────────────────────────────────────────────────────
 *
 *  ✅  pi/markdown  (markdown-viewer)
 *        MarkdownViewer card renders `introduction` and `note` as styled markdown.
 *        GFM + math (KaTeX) supported.
 *
 *  ✅  facet JSON display  (json-viewer)
 *        JsonViewer card replaces the old Typography "code" inline fallback.
 *        Props are shown as a collapsible interactive tree.
 *
 *  ✅  playground/preview
 *        Inline card preview rendered above the JSON viewer for each facet.
 *        Example files opt-in by adding `preview: (props) => CardFactory(props)`.
 *        Cards without a `preview` factory gracefully skip the preview box.
 *
 *  ✅  playground/controls
 *        Interactive prop widgets (token-pill, select, text, boolean toggle)
 *        derived from PlaygroundDef.controls[].
 *        Live preview updates as controls are changed.
 *        Dispatches onPlaygroundPropChanged → patches state.playgroundCurrentProps.
 */

import {memo, register, registerCard, registerFramework} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";
import {SdFramework} from "@/cards/framework";
import {PageWithNavbar} from "@/cards/pageWithNavbar";
import {FlexGrid} from "@/cards/flexGrid";
import {List, onListItemClicked} from "@/cards/list";
import {Stack} from "@/cards/stack";
import {Typography} from "@/cards/typography";
import {SdTabs, onTabsTabChanged} from "@/cards/tabs";
import {MarkdownViewer} from "@/cards/markdownViewer";
import {JsonViewer} from "@/cards/jsonViewer";
import {Select, onPiSelectChanged} from "@/cards/select";
import {PiInput, onPiInputCommitted} from "@/cards/input";
import {Switch, onPiSwitchChanged} from "@/cards/switch";
import {ToggleGroup, onPiToggleGroupChanged} from "@/cards/toggleGroup";

import type {AppState} from "@/app.state";
import type {
  PlaygroundDef,
  PlaygroundControl,
  PlaygroundEventRecord,
} from "./playground.types";
import {PLAYGROUND_EXAMPLES} from "./playground.examples.gen";

// ============================================================================
// Card IDs
// ============================================================================

export const PlaygroundCard = {
  Page: "playground/page",
  List: "playground/list",
  Detail: "playground/detail",
} as const;

// ============================================================================
// Content builders (pure functions — no Pihanga side-effects)
// ============================================================================

/**
 * Build the tab list for a card's facets section.
 * Returns an empty array when the def has no facets.
 *
 * When the card declares `registerEvents`, the bottom of each facet tab is
 * split into two columns mirroring the Controls layout:
 *   - Left:  props JSON viewer (shows the facet's prop overrides).
 *   - Right: scrollable event log panel (one JsonViewer per captured event,
 *            newest first, with a fixed min-height so it aligns visually with
 *            the JSON viewer on the left).
 *
 * Cards without `registerEvents` fall back to the original single-column
 * JSON viewer.
 *
 * @param def            The playground definition for the current card.
 * @param activeFacetId  The currently-selected facet id (from state).
 *                       Defaults to the first facet when undefined.
 * @param eventLog       Captured events from the playground engine (from state).
 */
function buildFacetSection(
  def: PlaygroundDef,
  activeFacetId: string | undefined,
  eventLog: PlaygroundEventRecord[],
): PiCardRef[] {
  if (!def.facets?.length) return [];

  const value = activeFacetId ?? def.facets[0].id;
  const hasEvents = Boolean(def.registerEvents);

  return [
    Typography({level: "h4", text: "Examples"}),
    SdTabs({
      selfManaged: false,
      value,
      tabs: def.facets.map((f) => ({
        id: f.id,
        title: f.title,
        contentCard: Stack({
          direction: "column",
          spacing: 2,
          content: [
            // ── Live card preview ───────────────────────────────────────────
            // When the example file provides a `preview` factory, render the
            // actual card with the merged (defaultProps + facet.props) values
            // inside a centred preview container.
            ...(def.preview
              ? [
                  Stack({
                    direction: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    className:
                      "rounded-lg border bg-muted/20 py-8 px-4 min-h-20",
                    content: [def.preview({...def.defaultProps, ...f.props})],
                  }),
                ]
              : []),
            // Facet description (optional)
            ...(f.description
              ? [Typography({level: "muted", text: f.description})]
              : []),
            // ── Props JSON  +  Event log ────────────────────────────────────
            // When the card declares `registerEvents`, split this row into two
            // columns: props JSON on the left and the event viewer on the right.
            // Same flex-wrap / flex-1 / min-w pattern as the Controls section so
            // both columns collapse gracefully on narrow panels.
            // Cards without events show the original single-column JSON viewer.
            ...(hasEvents
              ? [
                  Stack({
                    direction: "row",
                    alignItems: "flex-start",
                    spacing: 4,
                    className: "flex-wrap",
                    content: [
                      // Left: facet props as a collapsible JSON tree
                      JsonViewer({
                        source: f.props,
                        collapsed: false,
                        copyToClipboard: true,
                        className: "flex-1 min-w-[280px] self-start p-3",
                      }),
                      // Right: event viewer — scrollable stack of JSON viewers,
                      // one per captured event, newest first.
                      // Fixed min-height so it visually aligns with the JSON viewer.
                      Stack({
                        direction: "column",
                        spacing: 0,
                        className:
                          "flex-1 min-w-[280px] self-start rounded-lg border",
                        content: [
                          // Panel header
                          Typography({
                            level: "small",
                            text: "Events",
                            className:
                              "block px-3 py-2 border-b text-muted-foreground font-medium",
                          }),
                          // Scrollable list of event entries (newest first)
                          Stack({
                            direction: "column",
                            spacing: 2,
                            className:
                              "overflow-y-auto min-h-[120px] max-h-[360px] p-3",
                            content:
                              eventLog.length > 0
                                ? [...eventLog].reverse().map((ev) =>
                                    Stack({
                                      direction: "column",
                                      spacing: 1,
                                      className:
                                        "rounded border bg-muted/30 p-2",
                                      content: [
                                        Typography({
                                          level: "small",
                                          text: ev.label,
                                          className:
                                            "font-mono text-xs text-muted-foreground",
                                        }),
                                        JsonViewer({
                                          source: ev.data,
                                          collapsed: false,
                                          copyToClipboard: false,
                                          className: "text-xs",
                                        }),
                                      ],
                                    }),
                                  )
                                : [
                                    Typography({
                                      level: "muted",
                                      text: "No events yet — interact with the preview above.",
                                    }),
                                  ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ]
              : [
                  // No events declared: original single-column JSON viewer
                  JsonViewer({
                    source: f.props,
                    collapsed: false,
                    copyToClipboard: true,
                    className: "w-fit self-start p-3",
                  }),
                ]),
          ],
        }),
      })),
    }),
  ];
}

/**
 * Build the interactive "Controls" section.
 *
 * Shown only when `def.controls` is non-empty.  Includes:
 * 1. An optional live-preview box driven by `currentProps` (when `def.preview`
 *    is provided) — updates immediately as controls are changed.
 * 2. The `PlaygroundControls` panel with one widget per control.
 *
 * @param def          The playground definition for the current card.
 * @param currentProps Live prop values from `state.playgroundCurrentProps`.
 */
function buildControlsSection(
  def: PlaygroundDef,
  currentProps: Record<string, unknown>,
): PiCardRef[] {
  if (!def.controls?.length) return [];

  const items: PiCardRef[] = [Typography({level: "h4", text: "Controls"})];

  // Live preview box — driven by currentProps (interactive)
  if (def.preview) {
    items.push(
      Stack({
        direction: "row",
        justifyContent: "center",
        alignItems: "center",
        className: "rounded-lg border bg-muted/20 py-8 px-4 min-h-20",
        content: [def.preview(currentProps)],
      }),
    );
  }

  // Controls + live JSON side-by-side (stacked when narrow via flex-wrap).
  // Each child has `flex-1 min-w-[280px]` so they share space equally when
  // there is room, and each wraps to its own line when the panel is narrower
  // than ~600 px (2 × min-width + gap).
  items.push(
    Stack({
      direction: "row",
      alignItems: "flex-start",
      spacing: 4,
      className: "flex-wrap",
      content: [
        // ── Left: control widgets ──────────────────────────────────────────
        Stack({
          direction: "column",
          spacing: 3,
          className: "flex-1 min-w-[280px] rounded-lg border p-4",
          content: def.controls.map((ctrl) =>
            Stack({
              direction: "row",
              alignItems: "center",
              spacing: 4,
              content: [
                Typography({
                  level: "small",
                  text: ctrl.label ?? ctrl.prop,
                  className: "w-24 shrink-0 text-muted-foreground",
                }),
                buildControlWidget(ctrl, currentProps),
              ],
            }),
          ),
        }),
        // ── Right: live JSON representation of current prop values ─────────
        JsonViewer({
          source: currentProps,
          collapsed: false,
          copyToClipboard: true,
          className: "flex-1 min-w-[280px] self-start p-3",
        }),
      ],
    }),
  );

  return items;
}

/**
 * Build the appropriate widget card for a single PlaygroundControl.
 *
 * Each widget receives `name: ctrl.prop` so its dispatched action carries the
 * prop key.  The global handlers registered in `playgroundPiInit()` intercept
 * those actions and patch `state.playgroundCurrentProps[name]`.
 *
 * | Control type | Widget card | Event caught globally               |
 * |--------------|-------------|-------------------------------------|
 * | token        | ToggleGroup | onPiToggleGroupChanged  (single)    |
 * | select       | Select      | onPiSelectChanged                   |
 * | text         | PiInput     | onPiInputCommitted (blur/Enter)     |
 * | boolean      | Switch      | onPiSwitchChanged                   |
 */
function buildControlWidget(
  ctrl: PlaygroundControl,
  currentProps: Record<string, unknown>,
): PiCardRef {
  // Use getNestedProp so dot-notation paths like "opts.variant" resolve correctly.
  const current = getNestedProp(currentProps, ctrl.prop);

  if (ctrl.type === "token") {
    // ToggleGroup single-select.  `name` carries the prop key so the global
    // onPiToggleGroupChanged handler knows which prop to patch.
    return ToggleGroup({
      name: ctrl.prop,
      type: "single",
      items: ctrl.options.map((opt: string) => ({value: opt, label: opt})),
      value: current != null ? String(current) : undefined,
      variant: "outline",
      size: "sm",
      spacing: 0,
    });
  }

  if (ctrl.type === "select") {
    return Select({
      name: ctrl.prop,
      options: ctrl.options.map((o: string) => ({value: o, label: o})),
      value: current != null ? String(current) : undefined,
      selfManaged: false,
    });
  }

  if (ctrl.type === "text") {
    // PiInput fires onCommitted on blur/Enter so the detail panel rebuilds
    // only when the user finishes typing — not on every keystroke.
    return PiInput({
      name: ctrl.prop,
      value: current != null ? String(current) : "",
      placeholder: ctrl.placeholder,
    });
  }

  if (ctrl.type === "boolean") {
    return Switch({
      name: ctrl.prop,
      checked: Boolean(current),
    });
  }

  return Typography({
    level: "muted",
    text: `Unknown control type: ${(ctrl as {type: string}).type}`,
  });
}

/**
 * Build the full content array for the detail panel.
 *
 * @param cardId       The `cardId` stored in `state.playgroundSelectedCardId`.
 * @param facetId      The active facet id (from state), or undefined → first facet.
 * @param currentProps Live prop values from `state.playgroundCurrentProps`.
 * @param eventLog     Captured events from `state.playgroundEventLog`.
 */
function buildDetailContent(
  cardId: string | undefined,
  facetId: string | undefined,
  currentProps: Record<string, unknown> | undefined,
  eventLog: PlaygroundEventRecord[],
): PiCardRef[] {
  // ── Empty state ────────────────────────────────────────────────────────────
  if (!cardId) {
    return [
      Typography({
        level: "muted",
        text: "← Select a card from the list to explore its playground.",
      }),
    ];
  }

  const def = PLAYGROUND_EXAMPLES.find((d) => d.cardId === cardId);

  if (!def) {
    // Should not happen unless the gen file is stale.
    return [
      Typography({
        level: "muted",
        text: `No playground definition found for "${cardId}". Re-run yarn gen-playground.`,
      }),
    ];
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  const items: PiCardRef[] = [Typography({level: "h2", text: def.title})];

  // ── Introduction ───────────────────────────────────────────────────────────
  // MarkdownViewer renders markdown syntax correctly — GFM, inline code,
  // fenced code blocks, and math expressions all work.
  items.push(MarkdownViewer({source: def.introduction}));

  // ── Facets as tabs ─────────────────────────────────────────────────────────
  items.push(...buildFacetSection(def, facetId, eventLog));

  // ── Interactive controls + live preview ────────────────────────────────────
  // Shown when PlaygroundDef.controls[] is non-empty.
  // currentProps falls back to defaultProps on first render (before a card
  // has been selected and the reducer has fired).
  const liveProps = currentProps ?? def.defaultProps;
  items.push(...buildControlsSection(def, liveProps));

  // ── Real-app usage note ────────────────────────────────────────────────────
  // MarkdownViewer renders the note with full markdown support — code fences
  // and inline code display correctly (replaces the old Typography fallback).
  if (def.note) {
    items.push(
      Typography({level: "h4", text: "Real-app usage"}),
      MarkdownViewer({source: def.note}),
    );
  }

  return items;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Read a value from a (possibly dot-notation) path inside a nested object.
 *
 * `getNestedProp(obj, "opts.variant")` returns `obj.opts.variant`.
 * `getNestedProp(obj, "label")` returns `obj.label`.
 */
function getNestedProp(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/**
 * Write a value to a (possibly dot-notation) path inside a nested object.
 * Intermediate objects are created if missing.
 *
 * `setNestedProp(obj, "opts.variant", "outline")` sets `obj.opts.variant = "outline"`.
 * Works correctly with immer-produced drafts (mutates in place).
 */
function setNestedProp(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (cur[part] == null || typeof cur[part] !== "object") {
      cur[part] = {};
    }
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * Patch a single (possibly nested) prop in `state.playgroundCurrentProps`.
 *
 * Guards:
 * - We must be in playground mode (`playgroundCurrentProps` is defined).
 * - `name` must be a declared control prop of the currently selected card.
 *
 * Supports dot-notation paths such as `"opts.variant"` used by the Button
 * example.  `setNestedProp` drills into the nested object rather than
 * creating a literal key with dots in the name.
 */
function patchPgProp(
  state: AppState,
  name: string | undefined,
  value: unknown,
): void {
  if (name == null || state.playgroundCurrentProps == null) return;
  const def = PLAYGROUND_EXAMPLES.find(
    (d) => d.cardId === state.playgroundSelectedCardId,
  );
  if (def?.controls?.some((c) => c.prop === name)) {
    setNestedProp(state.playgroundCurrentProps, name, value);
  }
}

// ============================================================================
// Event logger factory
// ============================================================================

/**
 * Create a `PlaygroundLogEventFn` scoped to a specific card.
 *
 * The returned function appends an event entry to `state.playgroundEventLog`
 * **only** when the playground is currently displaying `cardId`.  It is safe
 * to register handlers that call this logger permanently — they are no-ops
 * for all other cards.
 *
 * @param cardId  The `PlaygroundDef.cardId` this logger is bound to.
 */
function makeEventLogger(cardId: string) {
  return (
    state: AppState,
    label: string,
    data: Record<string, unknown>,
  ): void => {
    if (state.playgroundSelectedCardId !== cardId) return;
    if (!state.playgroundEventLog) {
      state.playgroundEventLog = [];
    }
    state.playgroundEventLog.push({
      label,
      data,
      index: state.playgroundEventLog.length,
    });
  };
}

// ============================================================================
// Init
// ============================================================================

export function playgroundPiInit(): void {
  // ── Framework root ─────────────────────────────────────────────────────────
  registerFramework(
    SdFramework({
      page: PlaygroundCard.Page,
      theme: "light",
    }),
  );

  // ── Event handlers ─────────────────────────────────────────────────────────
  register((r) => {
    // Store the clicked card's `cardId` in state and reset facet + currentProps.
    onListItemClicked(r, (state: AppState, action) => {
      if (action.cardID === PlaygroundCard.List) {
        const cardId = String(action.itemID);
        state.playgroundSelectedCardId = cardId;
        const def = PLAYGROUND_EXAMPLES.find((d) => d.cardId === cardId);
        state.playgroundSelectedFacetId = def?.facets?.[0]?.id;
        // Initialise live props from defaultProps when a card is selected.
        state.playgroundCurrentProps = def ? {...def.defaultProps} : undefined;
        // Clear the event log when switching to a new card.
        state.playgroundEventLog = [];
      }
    });

    // ── Playground control widgets ──────────────────────────────────────────
    // Each control widget carries `name: ctrl.prop` so the dispatched event
    // payload includes the prop key.  We intercept the four card-level events
    // here and delegate to patchPgProp which guards against stale / foreign
    // events and writes directly into state.playgroundCurrentProps (immer).
    onPiToggleGroupChanged(r, (state: AppState, {name, value}) => {
      patchPgProp(state, name, value);
    });

    onPiSwitchChanged(r, (state: AppState, {name, checked}) => {
      patchPgProp(state, name, checked);
    });

    onPiSelectChanged(r, (state: AppState, {name, value}) => {
      patchPgProp(state, name, value);
    });

    onPiInputCommitted(r, (state: AppState, {name, value}) => {
      patchPgProp(state, name, value);
    });

    // When a playground facet tab is clicked, update selected facet in state
    // and merge defaultProps + facet.props into currentProps.
    // Only respond when the clicked tabId matches a facet of the current card
    // (prevents preview-internal SdTabs from hijacking the facet selection).
    onTabsTabChanged(r, (state: AppState, {tabId}) => {
      const def = PLAYGROUND_EXAMPLES.find(
        (d) => d.cardId === state.playgroundSelectedCardId,
      );
      if (def?.facets?.some((f) => f.id === tabId)) {
        const facet = def.facets.find((f) => f.id === tabId);
        state.playgroundSelectedFacetId = tabId;
        if (facet) {
          // Deep-merge: defaultProps is the base; facet.props overrides specific keys.
          state.playgroundCurrentProps = {...def.defaultProps, ...facet.props};
        }
        // Clear the event log when switching facet tabs so each tab starts fresh.
        state.playgroundEventLog = [];
      }
    });

    // ── Per-card event loggers ──────────────────────────────────────────────
    // Each playground example that declares `registerEvents` gets a scoped
    // logger that only appends to `playgroundEventLog` when its card is the
    // currently selected one.  These handlers are registered once at boot and
    // are silent no-ops for all other cards.
    for (const def of PLAYGROUND_EXAMPLES) {
      if (def.registerEvents) {
        def.registerEvents(r, makeEventLogger(def.cardId));
      }
    }
  });

  // ── Page ───────────────────────────────────────────────────────────────────
  registerCard(
    PlaygroundCard.Page,
    PageWithNavbar({
      title: "Pihanga Playground",
      main: FlexGrid({
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
    }),
  );

  // ── Left panel — card index ─────────────────────────────────────────────────
  // Items are derived from the static PLAYGROUND_EXAMPLES list.
  // isSelected is driven by state so the selected item is highlighted.
  registerCard(
    PlaygroundCard.List,
    List({
      items: memo(
        (s: AppState) => s.playgroundSelectedCardId,
        (selectedId) =>
          PLAYGROUND_EXAMPLES.map((def) => ({
            id: def.cardId,
            title: def.title,
            isSelected: def.cardId === selectedId,
          })),
      ),
    }),
  );

  // ── Right panel — detail view ───────────────────────────────────────────────
  // The entire content tree is rebuilt whenever the selected card, active facet,
  // or live prop values change.  The controls section is only generated when
  // PlaygroundDef.controls[] is non-empty, so cards without controls are
  // unaffected by `playgroundCurrentProps` updates.
  registerCard(
    PlaygroundCard.Detail,
    Stack({
      direction: "column",
      spacing: 4,
      className: "p-4 overflow-y-auto h-full",
      content: memo<
        [
          string | undefined,
          string | undefined,
          Record<string, unknown> | undefined,
          PlaygroundEventRecord[] | undefined,
        ],
        PiCardRef[],
        AppState
      >(
        (s: AppState) => [
          s.playgroundSelectedCardId,
          s.playgroundSelectedFacetId,
          s.playgroundCurrentProps,
          s.playgroundEventLog,
        ],
        ([cardId, facetId, currentProps, eventLog]) =>
          buildDetailContent(cardId, facetId, currentProps, eventLog ?? []),
      ),
    }),
  );
}
