/**
 * Swimlane model helpers — pure TypeScript, no React.
 *
 * The model is plain JSON that lives in the app's Redux state.
 * `ingestSwimlaneEvents` MUTATES the model it is given, which is exactly what
 * a Pihanga (Immer) reducer wants:
 *
 *   onSwimlaneEventsReceived<AppState>(r, (state, {events}) => {
 *     ingestSwimlaneEvents(state.swimlane, events);
 *   });
 *
 * or simply `registerSwimlaneModel(r, "main", (s) => s.swimlane)`.
 *
 * Every row stores its own plain copies of the lane snapshots, so no object is
 * ever referenced from two places in the state tree (Immer-safe, serialisable).
 */
import type {PiRegister, ReduxState} from "@pihanga2/core";

import {
  DEF_MAX_ROWS,
  onSwimlaneEventsReceived,
  onSwimlaneRowsCleared,
  type SwimlaneEvent,
  type SwimlaneGhostRow,
  type SwimlaneLanesSnapshot,
  type SwimlaneModel,
  type SwimlanePending,
  type SwimlaneRow,
  type SwimlaneRowEvent,
  type SwimlaneTarget,
} from "./swimlane.types";

export function createSwimlaneModel(
  opts: {maxRows?: number} = {},
): SwimlaneModel {
  return {
    laneOrder: [],
    laneLabels: {},
    current: {},
    rows: [],
    pending: [],
    spans: {},
    seq: 0,
    maxRows: opts.maxRows ?? DEF_MAX_ROWS,
  };
}

function copySnapshot(s: SwimlaneLanesSnapshot): SwimlaneLanesSnapshot {
  const out: SwimlaneLanesSnapshot = {};
  for (const k of Object.keys(s)) {
    out[k] = {state: s[k].state, acts: [...s[k].acts]};
  }
  return out;
}

/** Lanes an event refers to (used to add lanes implicitly). */
function referencedLanes(m: SwimlaneModel, ev: SwimlaneEvent): string[] {
  switch (ev.type) {
    case "state":
      return [ev.lane];
    case "call":
      return ev.from === ev.to ? [ev.from] : [ev.from, ev.to];
    case "expect":
      return ev.from === ev.to ? [ev.from] : [ev.from, ev.to];
    case "reply":
    case "done": {
      const s = m.spans[ev.id];
      return s ? [s.to, s.from] : [];
    }
    default:
      return [];
  }
}

/**
 * Apply a batch of stream events to the model (mutating it).
 * Safe to call on an Immer draft or on a plain object.
 */
export function ingestSwimlaneEvents(
  m: SwimlaneModel,
  events: SwimlaneEvent[],
  now: number = Date.now(),
): void {
  for (const raw of events) {
    const ts = raw.ts ?? now;
    // lanes referenced before they were announced get an implicit lane row
    for (const lane of referencedLanes(m, raw)) {
      if (!m.current[lane]) applyOne(m, {type: "lane", lane}, ts);
    }
    applyOne(m, raw, ts);
  }
  trim(m);
}

function applyOne(m: SwimlaneModel, ev: SwimlaneEvent, ts: number): void {
  const cur = m.current;

  if (ev.type === "expect") {
    m.pending.push({
      id: ev.id,
      type: "expect",
      from: ev.from,
      to: ev.to,
      label: ev.label,
      since: ts,
      timeoutMs: ev.timeoutMs,
    });
    return;
  }

  const pre = copySnapshot(cur);
  let route: SwimlaneRow["route"];

  switch (ev.type) {
    case "lane":
      if (ev.label) m.laneLabels[ev.lane] = ev.label;
      if (cur[ev.lane]) return; // already known → only a label update
      cur[ev.lane] = {state: "created", acts: []};
      m.laneOrder.push(ev.lane);
      break;
    case "state":
      cur[ev.lane].state = ev.state;
      break;
    case "call":
      m.spans[ev.id] = {
        id: ev.id,
        kind: ev.kind,
        from: ev.from,
        to: ev.to,
        label: ev.label,
        start: ts,
        end: ev.kind === "event" ? ts : undefined,
        status: ev.kind === "event" ? "done" : "open",
      };
      if (ev.kind !== "event") cur[ev.to].acts.push(ev.id);
      break;
    case "reply":
    case "done": {
      const s = m.spans[ev.id];
      if (!s) return; // unknown call → nothing sensible to draw
      s.end = ts;
      s.status = ev.type === "done" ? "done" : ev.ok ? "ok" : "error";
      if (ev.type === "reply") s.result = ev.label;
      const lane = cur[s.to];
      if (lane) {
        const i = lane.acts.indexOf(ev.id);
        if (i >= 0) lane.acts.splice(i, 1);
      }
      route = {from: s.from, to: s.to, label: s.label};
      break;
    }
  }

  // does this real event replace an outstanding one?
  let fulfilled: string | undefined;
  const pid = ev.type === "reply" ? ev.id : ev.fulfils;
  if (pid) {
    const i = m.pending.findIndex((p) => p.id === pid);
    if (i >= 0) {
      m.pending.splice(i, 1);
      fulfilled = pid;
    }
  }
  // a sync call means we KNOW a reply will come back
  if (ev.type === "call" && ev.kind === "sync") {
    m.pending.push({
      id: ev.id,
      type: "reply",
      from: ev.to,
      to: ev.from,
      label: `reply: ${ev.label}`,
      since: ts,
      timeoutMs: ev.timeoutMs,
    });
  }

  const row: SwimlaneRow = {
    id: ++m.seq,
    event: {...ev, ts} as SwimlaneRowEvent,
    pre,
    post: copySnapshot(cur),
  };
  if (fulfilled) row.fulfilled = fulfilled;
  if (route) row.route = route;
  m.rows.push(row);
}

/** Ring buffer with amortised span garbage collection. */
function trim(m: SwimlaneModel): void {
  const slack = Math.max(50, Math.floor(m.maxRows / 10));
  if (m.rows.length <= m.maxRows + slack) return;
  m.rows.splice(0, m.rows.length - m.maxRows);
  const keep = new Set<string>();
  for (const r of m.rows) {
    if ("id" in r.event) keep.add(r.event.id);
  }
  for (const l of Object.values(m.current)) l.acts.forEach((a) => keep.add(a));
  m.pending.forEach((p) => keep.add(p.id));
  for (const id of Object.keys(m.spans)) {
    if (!keep.has(id)) delete m.spans[id];
  }
}

/** Remove all rows but keep lanes, open activities and outstanding messages. */
export function clearSwimlaneRows(m: SwimlaneModel): void {
  m.rows.splice(0, m.rows.length);
}

/**
 * Project outstanding messages below the "now" line (pure).
 * Expected replies are replayed onto the current snapshot so that open
 * activities visibly run down to the ghost reply that will close them.
 * Newest first ≈ innermost call replies first.
 */
export function projectPending(
  current: SwimlaneLanesSnapshot,
  pending: SwimlanePending[],
): SwimlaneGhostRow[] {
  let snap = current;
  const out: SwimlaneGhostRow[] = [];
  for (let i = pending.length - 1; i >= 0; i--) {
    const p = pending[i];
    const pre = snap;
    const lane = snap[p.from];
    if (p.type === "reply" && lane?.acts.includes(p.id)) {
      snap = {...snap, [p.from]: {...lane, acts: lane.acts.filter((a) => a !== p.id)}};
    }
    out.push({id: `g-${p.id}`, pending: p, pre, post: snap});
  }
  return out;
}

/** Does a row (or ghost row) involve the call chain `id`? */
export function rowTouches(
  r: {pre: SwimlaneLanesSnapshot; post: SwimlaneLanesSnapshot},
  eventId: string | undefined,
  id: string,
): boolean {
  if (eventId === id) return true;
  for (const l of Object.values(r.pre)) if (l.acts.includes(id)) return true;
  for (const l of Object.values(r.post)) if (l.acts.includes(id)) return true;
  return false;
}

export function formatTs(t: number): string {
  const d = new Date(t);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

/** Human-readable description of a hover target (used by the tooltip). */
export function describeSwimlaneTarget(
  m: SwimlaneModel,
  t: SwimlaneTarget,
  now: number = Date.now(),
): string {
  if (t.kind === "state") {
    const r = m.rows.find((x) => x.id === t.rowId);
    if (!r || r.event.type !== "state") return t.id;
    return `${t.lane} → ${r.event.state} at ${formatTs(r.event.ts)}`;
  }
  if (t.kind === "pending") {
    const p = m.pending.find((x) => x.id === t.id);
    if (!p) return "already fulfilled";
    const w = now - p.since;
    const what = p.type === "reply" ? "reply" : "message";
    const to = p.timeoutMs
      ? ` / timeout ${p.timeoutMs} ms${w > p.timeoutMs ? " · OVERDUE" : ""}`
      : "";
    return `expected ${what} ${p.from} → ${p.to}: "${p.label}" · waiting ${w} ms${to}`;
  }
  const s = m.spans[t.id];
  if (!s) return t.id;
  const dur = s.end != null ? `${s.end - s.start} ms` : `running ${now - s.start} ms`;
  const res = s.result ? ` (${s.result})` : "";
  if (t.kind === "activity") {
    return `${s.to} handling "${s.label}" from ${s.from} · started ${formatTs(s.start)} · ${dur}${res}`;
  }
  return `${s.kind.toUpperCase()} ${s.from} → ${s.to}: "${s.label}" · ${s.status}${res} · ${dur}`;
}

/**
 * Wire the data actions for one model:
 *
 *   register((r) => registerSwimlaneModel<AppState>(r, "main", (s) => s.swimlane));
 *   // …later, from a stream adapter:
 *   dispatchSwimlaneEvents(dispatch, {modelId: "main", events});
 */
export function registerSwimlaneModel<S extends ReduxState>(
  r: PiRegister,
  modelId: string,
  select: (state: S) => SwimlaneModel,
): void {
  onSwimlaneEventsReceived<S>(r, (state, a) => {
    if (a.modelId === modelId) ingestSwimlaneEvents(select(state), a.events);
  });
  onSwimlaneRowsCleared<S>(r, (state, a) => {
    if (a.modelId === modelId) clearSwimlaneRows(select(state));
  });
}
