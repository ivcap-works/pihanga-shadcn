import {
  createCardDeclaration,
  createOnAction,
  createOnDispatch,
  registerActions,
} from "@pihanga2/core";
import type React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Card identity
// ─────────────────────────────────────────────────────────────────────────────

export const SWIMLANE_CARD = "shad/swimlane";

export const Swimlane = createCardDeclaration<SwimlaneProps, SwimlaneEvents>(
  SWIMLANE_CARD,
);

// ─────────────────────────────────────────────────────────────────────────────
// Actions EMITTED by the card (user interaction)
// ─────────────────────────────────────────────────────────────────────────────

export const SWIMLANE_ACTION = registerActions(SWIMLANE_CARD, [
  "hover_changed",
  "item_clicked",
]);

export const onSwimlaneHoverChanged = createOnAction<SwimlaneHoverChangedEvent>(
  SWIMLANE_ACTION.HOVER_CHANGED,
);

export const onSwimlaneItemClicked = createOnAction<SwimlaneItemClickedEvent>(
  SWIMLANE_ACTION.ITEM_CLICKED,
);

// ─────────────────────────────────────────────────────────────────────────────
// Actions CONSUMED by the app (feeding the model).
//
// These are not emitted by the card. They are a convenience so that stream
// adapters (WebSocket, SSE, polling …) can push events with a typed dispatcher
// and apps can wire the model with a single `registerSwimlaneModel()` call
// (see swimlane.model.ts).
// ─────────────────────────────────────────────────────────────────────────────

export const SWIMLANE_DATA_ACTION = registerActions(`${SWIMLANE_CARD}/data`, [
  "events_received",
  "rows_cleared",
]);

export const dispatchSwimlaneEvents =
  createOnDispatch<SwimlaneEventsReceivedEvent>(
    SWIMLANE_DATA_ACTION.EVENTS_RECEIVED,
  );
export const dispatchSwimlaneRowsCleared =
  createOnDispatch<SwimlaneRowsClearedEvent>(SWIMLANE_DATA_ACTION.ROWS_CLEARED);

export const onSwimlaneEventsReceived =
  createOnAction<SwimlaneEventsReceivedEvent>(
    SWIMLANE_DATA_ACTION.EVENTS_RECEIVED,
  );
export const onSwimlaneRowsCleared = createOnAction<SwimlaneRowsClearedEvent>(
  SWIMLANE_DATA_ACTION.ROWS_CLEARED,
);

// ─────────────────────────────────────────────────────────────────────────────
// Incoming stream events (what a monitored deployment reports)
// All timestamps are epoch milliseconds; `ts` is filled in on ingest if absent.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run state of a service, drawn on its lifeline.
 *
 * `created` … `stopped` describe a long-running service's lifecycle.
 * `in_progress` / `succeeded` / `failed` are first-class outcome states for
 * one-shot work (e.g. a tool call or task) that does not fit that lifecycle —
 * use these instead of borrowing `running` / `stopped` / `degraded`.
 */
export type SwimlaneRunState =
  | "created"
  | "starting"
  | "running"
  | "degraded"
  | "stopped"
  | "in_progress"
  | "succeeded"
  | "failed";

/**
 * How a message travels between lanes.
 * - `sync`  – request that expects a reply; opens an activity on the target
 *             and automatically creates an *outstanding reply*.
 * - `async` – message that opens an activity on the target, closed by `done`.
 * - `event` – fire-and-forget; no activity.
 */
export type SwimlaneCallKind = "sync" | "async" | "event";

/** Row id: either an internal counter value, or a caller-supplied value (see `rowId`). */
export type SwimlaneRowId = string | number;

type SwimlaneEventBase = {
  /** Epoch ms. Defaults to `Date.now()` at ingest time. */
  ts?: number;
  /** Id of an `expect` event that this real event resolves. */
  fulfils?: string;
  /**
   * Use this as the resulting row's id instead of the model's internal
   * counter. Lets a caller that rebuilds the whole model from scratch on
   * every refresh (e.g. to replay a run, or after a rollback to an earlier
   * point) keep row ids stable across rebuilds, instead of them being
   * renumbered each time.
   *
   * Contract: must be unique among the model's current rows (an id freed by
   * ring-buffer trimming may be reused). If it collides with an existing
   * row, the card falls back to an internal id for that row rather than
   * producing two rows with the same id — check `SwimlaneRow.id` if you
   * need to confirm which id was actually used.
   *
   * Distinct from a `call`/`reply`/`done` event's own `id` (the call id,
   * shared between its call and reply rows) — `rowId` identifies one row.
   */
  rowId?: SwimlaneRowId;
  /**
   * Groups events that belong to one logical step (for example several
   * calls and a state change produced by a single engine tick). Rows are
   * grouped only when adjacent in `rows` (ingest order): the card draws the
   * timestamp for the first row of a run of same-`step` rows and replaces
   * it with a connecting mark on the rest, joining them into one block.
   * Comparison is `===`; omit it to draw every row on its own line as before.
   */
  step?: string | number;
  /**
   * Arbitrary caller data, opaque to the card. Carried onto the row (and,
   * for `call`/`expect` events, the resulting span/pending message) and
   * echoed back verbatim in `onHoverChanged` / `onItemClicked` for that
   * target — so the caller does not need a side table to recover context
   * (e.g. which domain object a row/span id stands for) on every hover or
   * click. Not interpreted or serialised specially by the card.
   */
  meta?: unknown;
};

/** A service became known. Lanes referenced by calls are also added implicitly. */
export type SwimlaneLaneEvent = SwimlaneEventBase & {
  type: "lane";
  lane: string;
  /** Display name (defaults to `lane`). */
  label?: string;
};

/** A service changed its run state. */
export type SwimlaneStateEvent = SwimlaneEventBase & {
  type: "state";
  lane: string;
  state: SwimlaneRunState;
  /** Draw the "→ state" text beside the dot. Default `true`. */
  showLabel?: boolean;
};

/** A message between two lanes (or a lane and itself). */
export type SwimlaneCallEvent = SwimlaneEventBase & {
  type: "call";
  /** Unique id; replies / `done` refer to it. */
  id: string;
  kind: SwimlaneCallKind;
  from: string;
  to: string;
  label: string;
  /** For `sync`: when the expected reply becomes overdue (ms after `ts`). */
  timeoutMs?: number;
  /**
   * Id of the call whose processing caused this call (like a trace's parent
   * span id). When omitted it is inferred at ingest time as the innermost
   * activity open on the `from` lane — exact for sequential processing, a
   * best guess when one service handles several requests concurrently.
   */
  parentId?: string;
};

/** Reply to an earlier `sync` call (drawn from callee back to caller). */
export type SwimlaneReplyEvent = SwimlaneEventBase & {
  type: "reply";
  /** Id of the originating call. */
  id: string;
  ok: boolean;
  label: string;
};

/** Processing of an earlier `async` call finished (closes the activity). */
export type SwimlaneDoneEvent = SwimlaneEventBase & {
  type: "done";
  id: string;
};

/**
 * Announces a message that is KNOWN to arrive later (from → to).
 * Shown as an outstanding ghost row until a real event with `fulfils: id`
 * arrives. Does not create a row itself.
 */
export type SwimlaneExpectEvent = SwimlaneEventBase & {
  type: "expect";
  id: string;
  from: string;
  to: string;
  label: string;
  timeoutMs?: number;
};

export type SwimlaneEvent =
  | SwimlaneLaneEvent
  | SwimlaneStateEvent
  | SwimlaneCallEvent
  | SwimlaneReplyEvent
  | SwimlaneDoneEvent
  | SwimlaneExpectEvent;

// ─────────────────────────────────────────────────────────────────────────────
// Model (lives in the app's Redux state; plain JSON)
// ─────────────────────────────────────────────────────────────────────────────

export type SwimlaneLaneSnapshot = {
  state: SwimlaneRunState;
  /** Ids of calls currently being handled by this lane (stack order). */
  acts: string[];
};

/** Lane id → snapshot. A lane missing from the record does not exist (yet). */
export type SwimlaneLanesSnapshot = Record<string, SwimlaneLaneSnapshot>;

/** A row event is any stream event except `expect` (which never makes a row). */
export type SwimlaneRowEvent = Exclude<SwimlaneEvent, SwimlaneExpectEvent> & {
  ts: number;
};

/**
 * One rendered transition. `pre` / `post` are the lane snapshots before and
 * after the event: the top half of the row is drawn from `pre`, the bottom
 * half from `post`.
 */
export type SwimlaneRow = {
  /**
   * The event's own `rowId` when it was set and did not collide with an
   * existing row; an internally assigned number otherwise. See
   * `SwimlaneEventBase.rowId`.
   */
  id: SwimlaneRowId;
  event: SwimlaneRowEvent;
  pre: SwimlaneLanesSnapshot;
  post: SwimlaneLanesSnapshot;
  /** Set when this event replaced an outstanding (expected) message. */
  fulfilled?: string;
  /**
   * For `reply` / `done` rows: the originating call, resolved at ingest time
   * so the row stays drawable after its span has been garbage-collected.
   */
  route?: {from: string; to: string; label: string};
};

/** An outstanding message projected below the "now" line. */
export type SwimlaneGhostRow = {
  id: string;
  pending: SwimlanePending;
  pre: SwimlaneLanesSnapshot;
  post: SwimlaneLanesSnapshot;
};

/** A message that is known to be coming. */
export type SwimlanePending = {
  id: string;
  /** `reply` = implied by a sync call; `expect` = announced explicitly. */
  type: "reply" | "expect";
  from: string;
  to: string;
  label: string;
  since: number;
  timeoutMs?: number;
  /** Copied from the originating `call` (implied reply) or `expect` event. */
  meta?: unknown;
};

/** Lifecycle of a call, used for tooltips and hover payloads. */
export type SwimlaneSpan = {
  id: string;
  kind: SwimlaneCallKind;
  from: string;
  to: string;
  label: string;
  start: number;
  end?: number;
  status: "open" | "ok" | "error" | "done";
  result?: string;
  /** Call whose processing caused this one (explicit `parentId` or inferred). */
  parent?: string;
  /** Copied from the originating `call` event. */
  meta?: unknown;
};

export type SwimlaneModel = {
  /** Lane ids in display (arrival) order. */
  laneOrder: string[];
  /** Optional display names. */
  laneLabels: Record<string, string>;
  /** Caller `meta` from each lane's `lane` event(s), most recent wins. */
  laneMeta: Record<string, unknown>;
  /** Current snapshot (== `post` of the last row). */
  current: SwimlaneLanesSnapshot;
  rows: SwimlaneRow[];
  pending: SwimlanePending[];
  spans: Record<string, SwimlaneSpan>;
  /** Last assigned row id. */
  seq: number;
  /** Ring-buffer size for `rows`. */
  maxRows: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Card props & events
// ─────────────────────────────────────────────────────────────────────────────

export type SwimlaneProps = {
  /** The model to render — usually a state selector `(s) => s.swimlane`. */
  model: SwimlaneModel;

  /** Show outstanding messages below the "now" line. Default `true`. */
  showPending?: boolean;

  /**
   * Keep the newest row in view while the user is at the bottom of the
   * scroll container. Scrolling up pauses following. Default `true`.
   */
  autoFollow?: boolean;

  /** Show the built-in hover tooltip. Default `true`. */
  showTooltip?: boolean;

  /**
   * Highlight a call chain (call, activity, reply, outstanding reply) by id,
   * in addition to whatever the pointer is hovering.
   */
  highlightId?: string;

  /** Horizontal distance between lifelines in px. Default 104. */
  laneWidth?: number;
  /** Height of each transition row in px. Default 30. */
  rowHeight?: number;
  /** Height of the header holding the vertical lane names. Default 130. */
  headerHeight?: number;
  /** Width of the left timestamp column in px. Default 92. */
  gutterWidth?: number;
  /** `top` offset for the sticky header (e.g. height of a navbar). Default 0. */
  stickyTop?: number;

  /**
   * Clock (epoch ms) used for "waiting …" timers and overdue detection of
   * outstanding messages. When omitted the card ticks its own wall clock
   * (4×/s, only while something is outstanding). Pass it to drive the card
   * entirely from props — e.g. for replaying a recorded trace or for tests.
   */
  now?: number;

  /**
   * Formats the timestamp column (`ts`, epoch ms). Defaults to `formatTs`
   * from `swimlane.model` (local wall-clock `HH:MM:SS.mmm`). Override to
   * show a different clock — e.g. a virtual time derived from `ts`, or both
   * virtual and wall-clock time in one string.
   */
  formatTs?: (ts: number) => string;

  /**
   * Formats the "waiting …" duration (ms) shown on outstanding messages
   * below the "now" line. Defaults to `${(ms / 1000).toFixed(1)}s`.
   */
  formatWait?: (ms: number) => string;

  className?: string;
  /** Inline styles for the card's root element, alongside `className`. */
  style?: React.CSSProperties;
};

/** What the pointer is over. */
export type SwimlaneTargetKind = "transition" | "activity" | "state" | "pending" | "step" | "lane";

export type SwimlaneTarget = {
  kind: SwimlaneTargetKind;
  /**
   * Call id (`transition`/`activity`/`pending`), `state-<rowId>` (`state`),
   * the row's `step` value stringified (`step`), or the lane id (`lane`).
   */
  id: string;
  lane?: string;
  rowId?: SwimlaneRowId;
};

export type SwimlaneHoverChangedEvent = {
  /** New hover target, or `null` when the pointer left all targets. */
  target: SwimlaneTarget | null;
  /** Target that was hovered before, if any. */
  previous: SwimlaneTarget | null;
  /** Span details for the new target (when it refers to a call). */
  span?: SwimlaneSpan;
  /** Outstanding message details when `target.kind === "pending"`. */
  pending?: SwimlanePending;
  /**
   * Calls made while handling the hovered call (its direct children). Their
   * call and reply transitions are highlighted as well.
   */
  related?: string[];
  /**
   * For a hovered transition: call id of the caller-side process (activity)
   * that sent the call and receives its reply. That activity is highlighted.
   */
  process?: string;
  /** For `target.kind === "step"`: every row belonging to that step. */
  steps?: SwimlaneRow[];
  /**
   * Caller `meta` for the target, if any was set on the originating event:
   * the `call`'s `meta` for `transition`/`activity`/`pending`, the `state`
   * event's `meta` for `state`, the `lane` event's `meta` for `lane`. Not
   * set for `step` (see `steps`, which carries each row's own event/meta).
   */
  meta?: unknown;
  clientX?: number;
  clientY?: number;
};

export type SwimlaneItemClickedEvent = {
  target: SwimlaneTarget;
  span?: SwimlaneSpan;
  pending?: SwimlanePending;
  related?: string[];
  process?: string;
  /** For `target.kind === "step"`: every row belonging to that step. */
  steps?: SwimlaneRow[];
  /** See `SwimlaneHoverChangedEvent.meta`. */
  meta?: unknown;
};

export type SwimlaneEvents = {
  onHoverChanged: SwimlaneHoverChangedEvent;
  onItemClicked: SwimlaneItemClickedEvent;
};

// ─────────────────────────────────────────────────────────────────────────────
// Data-action payloads
// ─────────────────────────────────────────────────────────────────────────────

export type SwimlaneEventsReceivedEvent = {
  /** Which model to update (apps may show several swimlanes). */
  modelId: string;
  events: SwimlaneEvent[];
};

export type SwimlaneRowsClearedEvent = {
  modelId: string;
};

export const DEF_LANE_WIDTH = 104;
export const DEF_ROW_HEIGHT = 30;
export const DEF_HEADER_HEIGHT = 130;
export const DEF_GUTTER_WIDTH = 92;
export const DEF_MAX_ROWS = 2000;
