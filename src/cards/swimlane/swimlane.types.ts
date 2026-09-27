import {
  createCardDeclaration,
  createOnAction,
  createOnDispatch,
  registerActions,
} from "@pihanga2/core";

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

/** Run state of a service, drawn on its lifeline. */
export type SwimlaneRunState =
  | "created"
  | "starting"
  | "running"
  | "degraded"
  | "stopped";

/**
 * How a message travels between lanes.
 * - `sync`  – request that expects a reply; opens an activity on the target
 *             and automatically creates an *outstanding reply*.
 * - `async` – message that opens an activity on the target, closed by `done`.
 * - `event` – fire-and-forget; no activity.
 */
export type SwimlaneCallKind = "sync" | "async" | "event";

type SwimlaneEventBase = {
  /** Epoch ms. Defaults to `Date.now()` at ingest time. */
  ts?: number;
  /** Id of an `expect` event that this real event resolves. */
  fulfils?: string;
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
  id: number;
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
};

export type SwimlaneModel = {
  /** Lane ids in display (arrival) order. */
  laneOrder: string[];
  /** Optional display names. */
  laneLabels: Record<string, string>;
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

  className?: string;
};

/** What the pointer is over. */
export type SwimlaneTargetKind = "transition" | "activity" | "state" | "pending";

export type SwimlaneTarget = {
  kind: SwimlaneTargetKind;
  /** Call id (transition/activity/pending) or `state-<rowId>` (state). */
  id: string;
  lane?: string;
  rowId?: number;
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
  clientX?: number;
  clientY?: number;
};

export type SwimlaneItemClickedEvent = {
  target: SwimlaneTarget;
  span?: SwimlaneSpan;
  pending?: SwimlanePending;
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
