# `shad/swimlane` — design notes

How the real-time swimlane card is built and where to change it. For usage,
see `README.md` and the playground note in `swimlane.example.ts`.

## 1. Files

| File | Role | React? |
|---|---|---|
| `swimlane.types.ts` | Card id, props, emitted events, data actions, stream-event and model types | no |
| `swimlane.model.ts` | Pure model logic: `createSwimlaneModel`, `ingestSwimlaneEvents`, `clearSwimlaneRows`, `projectPending`, `rowTouches`, `describeSwimlaneTarget`, `registerSwimlaneModel` | no |
| `swimlane.component.tsx` | Rendering and pointer interaction | yes |
| `swimlane.css` | All colours and strokes (theme tokens) | — |
| `swimlane.demo.ts` | Deterministic event script used by the playground and tests | no |
| `index.ts` | `registerCardComponent` and re-exports | no |
| `*.test.ts(x)` | Model tests and component tests | — |

All domain logic sits in `swimlane.model.ts` and can be tested without a DOM.
The component only turns a model into SVG and pointer events into card events.

## 2. Data flow

```
stream (WS/SSE/poll)
   │  SwimlaneEvent[]   (batch, e.g. once per animation frame)
   ▼
dispatchSwimlaneEvents(dispatch, {modelId, events})
   │  action SWIMLANE_DATA_ACTION.EVENTS_RECEIVED
   ▼
reducer (Immer draft)  ── registerSwimlaneModel(r, modelId, s => s.swimlane)
   │  ingestSwimlaneEvents(draft.swimlane, events)     ← mutates the draft
   ▼
state.swimlane : SwimlaneModel     (plain JSON)
   │  card prop  model: (s) => s.swimlane
   ▼
SwimlaneComponent  ──► onHoverChanged / onItemClicked  ──► app reducers
```

The card never stores domain data itself. It renders whatever `model` it is
given, so everything visible (lanes, rows, run states, activities,
outstanding messages) comes from props.

## 2a. Time, steps, state labels, outcome states, lane clicks, `meta`, row ids, lane seeding and per-lane activity colour

These address feedback #1–#5, #7, #8, #9 and #10 from §8a (plus one
ad-hoc request, per-lane activity colour, noted at the end) without
changing the row model's shape (`SwimlaneRow` still holds exactly one
event; see §3.2):

- **`formatTs?: (ts: number) => string`** replaces the default
  `formatTs` export (local `HH:MM:SS.mmm`) for the timestamp column, and is
  also used for the "started" time in the hover tooltip
  (`describeSwimlaneTarget`'s new optional 4th argument). Returning a string
  that embeds both a virtual tick and the wall-clock time avoids a second
  column or a per-event field.
- **`formatWait?: (ms: number) => string`** replaces the default
  `${(ms / 1000).toFixed(1)}s` for the "waiting …" timers in the pending
  zone (`GhostRow`).
- **`step?: string | number`** on `SwimlaneEventBase` tags events that
  belong to one logical step. `RealRow` is passed a `grouped` flag computed
  in the component (`r.event.step != null && r.event.step ===
  model.rows[i - 1]?.event.step`, i.e. adjacency in ingest order, not a
  model-wide group-by). A grouped row draws a short dashed tie line
  (`.swl-ts-tie`) instead of its timestamp and gets a `swl-grouped` class.
  The model itself is unchanged — `ingestSwimlaneEvents` still produces one
  `SwimlaneRow` per event; `step` only affects what the gutter draws.
  This is the "cheap version" from the maintainer response in §8a: it does
  not let a state dot share a row with call arrows, and does not change
  `SwimlaneRow`'s shape, GC or the ring buffer. Revisit a real multi-event
  row type only if that turns out to be needed.
- **`"step"` target kind** (#3): every real row's timestamp (and tie mark)
  is now a hit zone (`data-kind="step"`), keyed by `stepKeyOf(row)` —
  `step:<value>` when the row has a `step`, `row:<id>` otherwise, so an
  unstepped row is its own one-row "step". Hovering or clicking it emits
  `target.kind === "step"` with `target.id` set to that key, and
  `steps: SwimlaneRow[]` (every row sharing the key, via the new
  `stepRows(model, stepId)` export) in both `onHoverChanged` and
  `onItemClicked`. All matching rows get a `.swl-hl-step` class. `hid`
  (the call/activity highlight chain) deliberately ignores `"step"` hovers,
  same as it already ignores `"state"`.
- **`showLabel?: boolean` on `SwimlaneStateEvent`** (#4): defaults to `true`;
  when `false` the component skips the `→ <state>` text and draws only the
  dot. No CSS dependency on internal markup needed.
- **Three outcome states** (#5): `SwimlaneRunState` gained `"in_progress"`,
  `"succeeded"`, `"failed"` alongside the five lifecycle states, each with
  its own CSS custom property (`--swl-in-progress` / `--swl-succeeded` /
  `--swl-failed`) and `.swl-dot-<state>` class — same pattern as the
  existing states, not a caller-defined/arbitrary-colour vocabulary (see the
  maintainer response's reasoning for not going further). Their
  `.swl-ll-<state>` lifeline classes are intentionally styled identically to
  the neutral `created`/`running` lifeline, so introducing them doesn't
  change how a lane's line looks — only the dot's colour conveys the
  outcome.
- **`"lane"` target kind** (#7): the `Header` component now draws an
  additional invisible hit zone per lane (covering the vertical name and the
  state dot), `data-kind="lane"` / `data-id=<lane>`. Hovering or clicking it
  reports `target.kind === "lane"` with `target.id` set to the lane id.
  The timestamp half of #7 ("…and the timestamp column") was already
  delivered by the `"step"` target kind from #3 — an unstepped row's
  timestamp is its own one-row step, so every row's timestamp is clickable
  even without using `step` grouping.
  Implementation note: the hover/click listeners (`onPointerOver` etc.) had
  to move from the `.swl-rows` div up to the component's root div, since
  `Header` renders in a separate `.swl-header` div and delegated listeners
  only see events from their own subtree.
- **`meta?: unknown` on `SwimlaneEventBase`** (#8): present on every event
  type (`lane`, `state`, `call`, `expect`). Copied onto the model at ingest
  time — `SwimlaneRow.event.meta` (via the row's event object itself),
  `SwimlaneSpan.meta` (from `call`), `SwimlanePending.meta` (from `call`'s
  implied reply or from `expect`), and a new `SwimlaneModel.laneMeta: Record<string, unknown>` (from `lane`, most recent event per lane wins — same
  "most recent wins" rule as `laneLabels`). `onHoverChanged` /
  `onItemClicked` gained a `meta` field, resolved per target kind in the
  component's `details()`: the span's/pending's `meta` for
  `transition`/`activity`/`pending`, the `state` event's own `meta` for
  `state`, `laneMeta[lane]` for `lane`. Not interpreted by the card — purely
  passed through, so the caller doesn't need a side table to recover which
  domain object a row/span id stands for.
- **`rowId?: string | number` on `SwimlaneEventBase`** (#9): `SwimlaneRow.id`
  (previously always the internal `number` counter `m.seq`) is now
  `SwimlaneRowId = string | number`. A new `rowId()` helper in
  `swimlane.model.ts` uses the event's `rowId` as the row's id when it is
  set *and* no existing row already has that id; otherwise it falls back to
  `++m.seq`, same as before. This lets a caller that rebuilds the whole
  model from events on every refresh (§8a notes this is needed to survive a
  rollback to an earlier point) give every event a stable id up front, so
  row ids don't get renumbered on each rebuild. The collision check is
  `O(rows)` per event — acceptable at the model's existing `maxRows`/ring-
  buffer scale (§3.2), the same order of work ingest already does elsewhere
  (e.g. span GC in `trim`). `SwimlaneTarget.rowId` and the component's
  `data-row` hit-zone attribute follow the same type; since DOM `dataset`
  values are always strings, lookups compare `String(row.id)` to the
  dataset value rather than parsing it back to a number (see `targetOf` in
  `swimlane.component.tsx` and the `"state"` branch of
  `describeSwimlaneTarget`).
- **`createSwimlaneModel({lanes})`** (#10): a new `SwimlaneSeedLane[]`
  option (`{lane, label?, state?, meta?}`) seeds `laneOrder`, `current`,
  `laneLabels` and `laneMeta` directly in `createSwimlaneModel`, before any
  event is ingested. Seeded lanes behave exactly like lanes known from a
  prior `lane` event: `applyOne`'s `lane` case already returns early
  without pushing a row when `cur[ev.lane]` exists, and `referencedLanes`
  already skips the implicit-lane step when `m.current[lane]` is truthy —
  so no code changed in `ingestSwimlaneEvents` itself, seeding just
  pre-populates what those checks look at. A later `lane` event for a
  seeded lane only updates its label/meta (still no row), same as a repeat
  `lane` event for any other lane.
- **`announce?: boolean` on `SwimlaneLaneEvent`** (also #10, for lanes that
  only become known mid-stream — `lanes` seeding only covers lanes knowable
  before `createSwimlaneModel` runs): `applyOne`'s `"lane"` case computes
  `isNew = !cur[ev.lane]` *before* creating the lane, then skips the row
  push (`return` before the `m.rows.push(row)` at the end of `applyOne`)
  when `!isNew || ev.announce === false` — i.e. for an already-known lane
  (as before) or for a brand-new lane that opted out. Label/meta/activity
  style updates still run unconditionally first, so `announce: false` only
  ever changes whether a row is drawn, never whether the lane is registered
  or styled. `announce` is only consulted the moment a lane transitions
  from unknown to known; a later `lane` event for an already-known lane
  takes the `!isNew` branch regardless of its own `announce` value, so
  there is no way to retroactively force a "joined" row for a lane that is
  already known.
- **Per-lane activity bar colour** (`activityClassName`/`activityStyle` on
  `SwimlaneLaneEvent`/`SwimlaneSeedLane`): stored as `SwimlaneModel
  .laneActivityClassName`/`.laneActivityStyle` (`Record<string, …>`,
  "most recent `lane` event wins", same pattern as `laneLabels`/`laneMeta`).
  `drawLanes` in `swimlane.component.tsx` takes both maps as extra
  parameters (defaulting to `{}` so existing call sites and the `Omit<RowCommon, …>`
  shape used by `NowRow` keep working unchanged) and applies, per lane, the
  class to the activity `<g>` (alongside `swl-act`/`swl-hl`/`swl-hl-proc`)
  and the style to both the `<rect>` (fill) and `<path>` (stroke) that make
  up the bar. This was not one of the 13 requests in §8a; it was asked
  about directly ("can I colour the activity bar per lane?") and implemented
  the same way as the rest of §2a: additive, optional, defaulting to no
  change in appearance when unset.

## 3. Model

### 3.1 Stream events (`SwimlaneEvent`)

| `type` | Creates a row | Effect |
|---|---|---|
| `lane` | yes (first time only) | adds the lane to `laneOrder`; a repeat only updates `laneLabels` |
| `state` | yes | sets `current[lane].state` |
| `call` | yes | creates a span (with `parent`, see §3.5); `sync`/`async` push the id onto `current[to].acts`; `sync` also adds a pending `reply` |
| `reply` | yes | closes the span and the activity; resolves the pending reply; stores `route` |
| `done` | yes | closes an `async` activity; stores `route` |
| `expect` | **no** | adds a pending `expect` |

Any event may carry `fulfils: <expect id>` to resolve an expectation.
Lanes referenced by `state`, `call` or `expect` before any `lane` event get an
implicit `lane` row first. A `reply` or `done` for an unknown call id is
dropped, because it cannot be drawn.

### 3.2 Rows and the half-row trick

```ts
SwimlaneRow = { id, event, pre, post, fulfilled?, route? }
```

`pre` and `post` are complete lane snapshots (`lane → {state, acts[]}`) taken
before and after the event. Each row draws its **top half from `pre`** and its
**bottom half from `post`**. That single rule covers:

- a lifeline starting in the middle of the row where a lane is created;
- an activity bar opening at the arrow of a call and closing at the arrow of
  its reply;
- a run-state change switching lifeline style at the state dot;
- a stack of nested activities (self-calls, re-entrant calls), where `acts`
  index *k* is drawn offset by `5·k` px.

`route` is copied onto `reply` and `done` rows at ingest time, so these rows
stay drawable after their span has been removed by garbage collection.

### 3.3 Invariants

- `current` always equals the `post` of the last row.
- Each row owns **its own copies** of `pre` and `post`; no object appears twice
  in the state tree. This keeps Immer finalisation correct and the model
  JSON-serialisable (there is a test for this).
- Rows are append-only. Existing row objects are never modified, so Immer
  keeps their identity, which the component's `memo()` depends on (§5.4).
- `rows.length ≤ maxRows + slack`, where slack = `max(50, maxRows/10)`. When
  the buffer is trimmed, spans that are not referenced by a kept row, an open
  activity or a pending message are deleted.

### 3.4 Outstanding messages

`pending` lists messages that are known to be coming, in arrival order.
`projectPending(current, pending)` builds **ghost rows** by replaying the
pending replies onto `current`, newest first. It uses the same `pre`/`post`
representation as real rows, so open activities visibly run down to the ghost
reply that will close them. The projection is a pure function and is never
stored in the model.

Newest-first is the right order for nested synchronous calls, where the
innermost reply returns first. For concurrent or fan-out calls it is only an
estimate (see §8).

### 3.5 Causality (`span.parent`)

Every call span records the call whose processing caused it. The parent is
`ev.parentId` if the stream provides one; otherwise it is inferred at ingest
time as the **innermost open activity on the caller's lane**
(`current[from].acts.at(-1)`, read before the new call is pushed).
`relatedCallIds(model, id)` returns the direct children of `id`, ordered by
start time.

Inference is exact when a service handles one request at a time, including
nested and self-calls. When a service handles several requests concurrently,
it attributes a call to the most recently opened one. Streams that know the
real causality (for example OpenTelemetry parent span ids) should send
`parentId`.

## 4. Rendering

### 4.1 Layout

Every row, and the header, is its own fixed-height `<svg>` in normal document
flow. The page, or the nearest `overflow: auto|scroll` ancestor, does all the
scrolling; the SVGs never scroll.

```
x(lane i) = gutterWidth + i·laneWidth + laneWidth/2
y(row)    = document flow (each row is rowHeight tall); mid = rowHeight/2
width     = gutterWidth + laneOrder.length·laneWidth + 140   // 140 = label room right of last lane
```

### 4.2 Horizontal growth (new lanes)

`width` is recomputed from `model.laneOrder.length` on every render. When a
`lane` event is ingested, Immer produces a new `laneOrder` array. That changes
the `laneOrder` and `width` props of every row, so all rows (and the header)
re-render once at the new width. Older rows draw nothing for the new lane
because their `pre`/`post` do not contain it, so its lifeline starts at the
row where it joined. The root element is `width: max-content; min-width: 100%`,
so the surrounding container scrolls horizontally when needed. The component
test *"a new lane in the model extends header and every row horizontally"*
checks this.

Lane order is arrival order and never changes. Reordering or hiding lanes is
an extension point (§7).

### 4.3 Row kinds

| Component | Source | Draws |
|---|---|---|
| `Header` | `model.laneOrder`, `model.current` | vertical names (`rotate(-90)`), state dot, open-activity count; sticky at `stickyTop` |
| `RealRow` | `SwimlaneRow` | lanes/activities (half-row), plus arrow, self-loop, state dot, "joined" box or "processed" note; ✓ and a flash animation if `fulfilled` |
| `NowRow` | `current`, `pending.length` | the "now" divider with current lifelines |
| `GhostRow` | `SwimlaneGhostRow`, `now` | faded dashed arrow, "waiting Xs" label (red once `timeoutMs` has passed) |
| `Defs` | — | arrowhead `<marker>`s, defined once per card instance; ids are prefixed with `useId()` so several cards can share a page |

Drawing is split into two helpers: `drawLanes` (lifelines and activities for
both halves) and `drawArrow` (straight arrow or self-loop, label, hit zone).
Both add to a `{visuals, hits}` pair; hit zones are drawn last so they are on
top.

### 4.4 Styling

Classes carry the meaning (`swl-ar-sync`, `swl-ll-degraded`,
`swl-act swl-hl`, …); all colours live in `swimlane.css`. Structural colours
use the shadcn tokens (`--foreground`, `--muted-foreground`, `--border`,
`--popover`, `--destructive`). Colours with no shadcn equivalent use
card-local `--swl-*` tokens with `.dark` overrides, as the repo guide requires
(no `prefers-color-scheme`). Add the class `swl-debug-hits` to the root to see
the hit zones.

## 5. Interaction

### 5.1 Hit zones

Invisible shapes that are wider than what they cover, carrying `data-kind`,
`data-id`, `data-lane` and `data-row`:

| Kind | Shape | `id` |
|---|---|---|
| `transition` | 16 px stroke over the arrow (14 px for self-loops) | call id |
| `activity` | 26 px wide rect over each activity segment | call id |
| `state` | circle with r = 12 over the state dot | `state-<rowId>` |
| `pending` | 16 px stroke over the ghost arrow | pending id (= call id for replies) |

### 5.2 Event delegation

A single `pointerover`/`pointerout`/`pointermove`/`click` listener sits on the
rows container, and `targetOf()` resolves `closest(".swl-hit")`. An activity
spans many rows, so moving from one of its segments to the next fires
`out`+`over` with the same `{kind, id}`. These are deduplicated, so
`onHoverChanged` fires only when the hovered item actually changes.
`pointermove` only moves the tooltip and never dispatches.

### 5.3 Highlighting

The hovered call id (or the `highlightId` prop when nothing is hovered)
becomes `hid`. There are two levels:

| Level | Rows | Prop | Class |
|---|---|---|---|
| primary: the call itself | rows where `rowTouches(row, eventId, hid)` is true — call arrow, reply arrow, every activity segment, ghost reply | `hl = hid` | `swl-hl` (3 px) |
| related: transitions the process creates and receives | rows whose event id is a direct child of `hid` (`relatedCallIds`) — outgoing calls, async messages and events, and the replies coming back, including outstanding (ghost) replies | `rel = true` | `swl-hl-rel` (2 px) |
| process: the caller-side activity (transition / pending hover only) | rows whose `pre`/`post` contain `procId = spans[hovered.id].parent` — every segment of the activity that sent the call and receives its reply, including the "now" and ghost rows | `proc = procId` | `swl-hl-proc` on `.swl-act` (tinted fill, 2 px outline) |

The related set is memoised on `[hid, model.spans]` and sent in
`onHoverChanged` as `related`. The process level exists because
overlapping activities on one lane make it hard to see which request a reply
lands on. It marks only that activity; its other transitions are not
highlighted. The process id is sent as `process` in `onHoverChanged` and
`onItemClicked`. All other rows keep `hl = null` and
`rel = false`, so `memo()` skips them. Only direct children are included;
grandchildren (for example a notifier's own calls while processing
`order.created`) belong to the child's activity and light up when that
activity is hovered.

### 5.4 Memoisation contract

`RealRow`, `GhostRow` and `NowRow` are `memo()` components compared by props
identity. This works because the model is updated immutably (a Pihanga/Immer
reducer). **If the model is mutated in place outside Immer, rows will not
re-render.** Always update it through a reducer.

## 6. Props versus local state

Everything that describes the deployment comes from props. The component
keeps only presentation state:

| Local state | Why it is local | How to control it from props |
|---|---|---|
| hovered target | changes at pointer speed | `highlightId` adds an external highlight; `onHoverChanged` reports changes |
| tooltip text and position | pointer-driven DOM update, no re-render | `showTooltip={false}`, then render your own from `onHoverChanged` |
| auto-follow flag | follows the user's scroll position | `autoFollow` |
| wall clock for "waiting" timers | ticks 4×/s, only while something is outstanding | pass `now` (epoch ms) to drive it from props (replay, tests) |

## 7. Extension guide

**New call kind** (for example `stream`):

1. `swimlane.types.ts`: extend `SwimlaneCallKind`.
2. `swimlane.model.ts` → `applyOne` `case "call"`: decide whether it opens an
   activity and/or creates a pending entry.
3. `swimlane.component.tsx`: add `CALL_STYLE[kind] = [arrowClass, markerId]`
   and a `Defs` marker if the arrowhead is new.
4. `swimlane.css`: add `.swl-ar-<kind>` and `.swl-mk-<kind>`.

**New run state:** extend `SwimlaneRunState`, then add `.swl-ll-<state>` and
`.swl-dot-<state>` in CSS. No code changes are needed.

**New event type** (for example `log` annotations on a lane):

1. Add it to the `SwimlaneEvent` union. It becomes a `SwimlaneRowEvent`
   automatically unless you exclude it.
2. Handle it in `applyOne`, plus `referencedLanes` if it names lanes.
3. Draw it in the `switch (ev.type)` in `RealRow`, adding a hit zone with a
   new `SwimlaneTargetKind` if it should be interactive.
4. Describe it in `describeSwimlaneTarget` for the tooltip.

**Lane ordering, grouping or hiding:** keep `laneOrder` as arrival order in
the model and add a prop (for example `laneFilter: string[]` or
`laneGroups`). Derive a *view* order in the component and pass that to rows
instead of `model.laneOrder`. Rows look lanes up by id, so rendering needs no
further change. Memoise the derived array, or every row re-renders on every
update.

**Very long traces / virtualisation:** rows are uniform (`rowHeight`), so a
window virtualiser (for example `@tanstack/react-virtual`'s
`useWindowVirtualizer`) can map scroll offset to a `rows.slice(a, b)` plus
top and bottom spacers. The half-row snapshots mean each row is
self-contained, so no neighbouring rows are needed to draw a slice.

**Time-proportional y-axis:** today *y* is event order. To use time instead,
vary each row's height by `ts` delta (clamped), or render a time ruler in the
gutter. Keep the half-row split at `height/2`.

**Deeper causality highlighting:** walk `relatedCallIds` recursively
(guarding against cycles) to build the related set, and optionally add a
third class per depth.

**Different ghost ordering:** change only `projectPending` (for example sort
by `since + timeoutMs`, or by an `eta` you add to `SwimlaneExpectEvent`).

**Detail panel on click:** handle `onSwimlaneItemClicked` in the app. The
event already carries `span` / `pending`. Store the target and render any
card (Dialog, Sheet) from it; pass `highlightId` to keep the chain lit.

## 8a. Feature request backlog (consumer feedback)

Collected from a consumer application that uses `shad/swimlane` to visualise a
run where every activity and every tool is a lane, a tool call is a call
arrow, a tool result is a reply arrow, and one engine tick is one virtual
second. Each item lists what the consumer does today as a work-around and the
change that would remove it. This is a backlog, not a changelog — **#1, #2,
#3, #4, #5, #7, #8, #9 and #10 have since been implemented** (in the cheaper
shape proposed under "Maintainer response" below); the rest are still open.

Priority reflects how much work-around code a change would remove or how much
it limits the view, not implementation order.

| # | Request | Work-around today | Priority |
|---|---|---|---|
| 1 | ✅ Real time and virtual time on the timestamp column | ~~Ticks are shifted by the local time-zone offset~~ → `formatTs`/`formatWait` props (§2a) | High |
| 2 | ✅ More than one event per timestamp, drawn as one row/block | ~~One row per event, repeated timestamps~~ → `step` id + tie-mark grouping (§2a) | High |
| 3 | ✅ Highlight the whole step when hovering its timestamp | ~~Not possible~~ → `"step"` target kind + `.swl-hl-step` (§2a) | Medium |
| 4 | ✅ Optional label on the state dot | ~~CSS selector hides the text~~ → `showLabel` on the `state` event (§2a) | Medium |
| 5 | ✅ A state vocabulary the caller can define, each with its own colour | ~~Three states borrowed and recoloured in CSS~~ → `in_progress`/`succeeded`/`failed` added as first-class states (§2a) | Medium |
| 6 | Lifeline style independent of run state | `.swl-ll-<state>` always changes the lifeline style; once states are reused for outcomes this is undesirable, so all lifeline styles are overridden to one plain line in CSS | Low |
| 7 | ✅ Click events on lane headers and the timestamp column | ~~No hit zone on the lane name/header dot~~ → `"lane"` target kind (§2a); the timestamp column was already covered by `"step"` (#3) | High |
| 8 | ✅ An optional `meta` payload on events, echoed back in hover/click events | ~~Side table rebuilt on every refresh~~ → `meta` on events, echoed in `onHoverChanged`/`onItemClicked` (§2a) | High |
| 9 | ✅ Stable, caller-chosen row ids | ~~Ids renumber on every rebuild~~ → `rowId` on events (§2a) | Medium |
| 10 | ✅ Declare lanes up front with no "joined" row | ~~Seed lanes ourselves (reimplemented ingest)~~ → `createSwimlaneModel({lanes})` for lanes known up front, or `announce: false` on a `lane` event for ones that aren't (§2a) | Medium |
| 12 | Lane width that fits the container | `laneWidth` is a fixed pixel size; a server-rendered guess based on lane count under-uses the available width with few lanes | Medium |
| 13 | A distinct status for calls cut off before a reply | `SwimlaneSpan.status` is only `open`/`ok`/`error`/`done`; a call whose activity ended before it was answered is drawn as an error reply labelled "abandoned" | Low |

Suggested directions (not committed APIs):

1. A `timeFormat`/per-event display label on the model or component, plus a
   duration formatter for the pending timers, so virtual and wall-clock time
   can both be shown without shifting values.
2. A `step`/group id on `SwimlaneEvent`, or a row type that holds a list of
   events, so several events from one step render as one timestamp/block.
3. Depends on (2): once a "step" is defined, hovering the timestamp column
   can highlight every row that belongs to it.
4. A `label`/`showLabel` option on the `state` event (default `true`, to stay
   backward compatible).
5. Let the model/props name their own states, each with a colour (and
   optionally a dot/line style), instead of hard-coding the five run states.
6. A prop (or part of the state definition from request 5) to keep lifelines
   neutral regardless of state.
7. Extend hit zones (and `SwimlaneTargetKind`) to cover the lane header and
   the timestamp column, emitting `onItemClicked`/`onHoverChanged` for them.
8. An optional `meta` object on any `SwimlaneEvent`, carried through to the
   row/span/pending and returned verbatim in `onItemClicked`/`onHoverChanged`.
9. Let an event carry its own `id`, used as the row id instead of the
   internal `seq` counter, so ids survive a full model rebuild.
10. A `lanes` input (seed lanes before any event arrives), or a silent flag
    on the `lane` event that suppresses its row.
12. `laneWidth: "fit"` (with min/max bounds) as an alternative to a fixed
    pixel value, so the diagram can use the full container width.
13. A `cancelled`/`abandoned` `SwimlaneSpan` status with its own arrow style,
    instead of borrowing `error`.

Request #11 (shipping the event→model builder for other-language consumers)
is out of scope for this card and is tracked separately.

### Maintainer response

These are a user's suggestions, not accepted designs. Pushing back where a
smaller change gets the same result, or where the suggestion conflicts with
how the card is built.

- **#1 (real/virtual time)** — agreed there's a real gap, but the suggested
  fix is bigger than needed. `formatTs` is already a separate, exported pure
  function; the fix is to let the component take an optional
  `formatTs?: (ts: number) => string` (and a `formatWait?: (ms: number) => string`
  for the pending timers), not a new field on every event. No per-event
  `timeFormat`, no second column — the caller can show both times in the one
  string it returns (`formatTs: (ts) => \`${virtual(ts)} · ${wallClock(ts)}\``)
  if it wants both.
- **#2 (several events per step)** — the request is reasonable but
  underestimates the cost: one event = one row is the foundation the whole
  renderer stands on (§3.2's pre/post half-row trick, GC, the ring buffer).
  Reshaping rows to hold *lists* of events touches every drawing function.
  Before building that, try the cheap version first: give rows a `step` id
  and make the component zero out the gap between consecutive rows that
  share a `step` (CSS/row-height, not a new row shape) and skip the repeated
  timestamp in the gutter for all but the first. That alone fixes "four
  identical timestamps" without a model rewrite. If a single state dot must
  share a row with call arrows, that's a real exception to the one-event-
  per-row rule and should be scoped as its own follow-up.
- **#3 (hover a step)** — implemented. "Step" is defined by `stepKeyOf`
  (§2a): rows sharing an explicit `step`, or a single unstepped row on its
  own. No objection to the request as scoped.
- **#4 (optional state-dot label)** — implemented as proposed: `showLabel`
  on the `state` event, default `true`.
- **#5 (fully custom state vocabulary + colours)** — implemented the smaller
  fix, still pushing back on "let the
  model name its own states with a colour each". This card's colours are
  shadcn/Tailwind theme tokens (`swimlane.css`), not inline styles, on
  purpose — that's how it stays in sync with the app's theme (dark mode,
  palette changes). Accepting arbitrary caller-supplied colours means either
  inline styles (opting out of theming) or the caller shipping its own CSS
  file, which just moves today's "recolour in CSS" workaround instead of
  removing it. Smaller fix: add the three outcome states the request
  actually needs — `succeeded` / `failed` / `in_progress` (or similar) — as
  first-class `SwimlaneRunState` values with their own theme-token classes,
  same pattern as the existing five. Revisit a fully open vocabulary only if
  more consumers need states we haven't anticipated.
- **#6 (lifeline style independent of state)** — agreed; a simple
  `neutralLifelines?: boolean` prop (or tying style to the state definition
  from #5) is low risk and removes a CSS override.
- **#7 (clicks on lane headers/timestamps)** — implemented as proposed; the
  timestamp half piggy-backs on the `"step"` target from #3 rather than
  being a separate mechanism. No pushback.
- **#8 (`meta` passthrough)** — implemented as proposed: a plain
  `meta?: unknown` on every event, copied through to the row/span/pending
  and echoed on the matching hover/click target. No pushback.
- **#9 (caller-chosen row ids)** — implemented with the collision rule
  resolved in favour of "silently fall back to an internal id", documented
  on `rowId` and on `SwimlaneRow.id` — not left as undefined behaviour, and
  not a validated-unique contract that would require the model to reject or
  throw on a bad id (a model mutated on every stream batch has no good place
  to surface that failure).
- **#10 (lanes without a "joined" row)** — implemented as proposed, but as
  `lanes?: SwimlaneSeedLane[]` (not `string[]`) so a seed can also carry a
  `label`, initial `state` and `meta`, covering the same ground a `lane`
  event would. Originally judged a "silent" flag on the `lane` event
  unnecessary once seeding exists — that call needs revising: seeding only
  covers lanes knowable *before* `createSwimlaneModel` runs, not ones a live
  stream only reveals mid-run, which has no "rebuild the model" moment to
  seed into. Added `announce?: boolean` on `SwimlaneLaneEvent` for that
  case, per the follow-up request — implemented as proposed, with the
  "`applyOne` itself decides whether to push a row" refactor suggested
  there (`isNew` computed up front, one `return` guard covers both
  no-row cases) rather than a caller-side special case.
- **#12 (lane width that fits the container)** — partial pushback on the
  shape of the fix, not the goal. The report blames the server for not
  seeing the browser window, but the *component* already renders into the
  DOM — it can measure its own container with `ResizeObserver` and compute
  `laneWidth` itself when the prop is omitted, no `"fit"` sentinel string
  needed. That also avoids a `laneWidth: string | number` union. Min/max
  bounds (72–120px from the report) become internal defaults, overridable by
  still accepting a numeric `laneWidth` for callers who want to pin it.
- **#13 (cancelled/abandoned status)** — agreed; a real status is better
  than overloading `error`, and it's a small, additive enum change
  (`SwimlaneSpan.status` gains `"cancelled"`, `.swl-ar-cancelled` in CSS).

## 7a. Bug fix: the "arrived" mark no longer shows green for an error reply

`RealRow` draws a small mark (`.swl-ok`, "✓") next to the timestamp when a row
"fulfils" an outstanding message (`row.fulfilled` is set — see §3.2/§3.4).
It used to draw the green `✓` for *any* fulfilling row, including a `reply`
whose `ok` is `false` — so a declined/errored reply that happened to replace
an outstanding "waiting…" ghost row got the same green tick as a successful
one. Fixed: the mark now checks `ev.type === "reply" && ev.ok === false` and
switches to a red `✗` (`.swl-ok.swl-ok-error`, themed with `--destructive`)
in that case. Only `reply` events can be in error this way (`call`/`done`
events that fulfil a pending `expect` have no `ok` field and keep the green
tick).

## 7b. Props hygiene: `style` alongside `className`

`SwimlaneProps` had `className?: string` but no matching `style?:
React.CSSProperties` — every other `shad/*` card's props type pairs the two
(see e.g. `attachment.types.ts`, `bubble.types.ts`). Added `style` and
applied it to the card's root `<div>` alongside `className`, consistent with
the rest of the component library. Internal SVG elements (`.swl-hit`,
`.swl-ll`, per-row `<svg>`s, etc.) are implementation detail and are not
part of this public styling surface — only the root element takes `style`.

## 8. Known limitations

- Ghost order is a heuristic (newest first); it can be wrong for concurrent
  calls.
- Inferred parents (§3.5) are a best guess for services handling several
  requests at once; send `parentId` when the true causality is known.
- Nested activities are offset by stack index. If a call in the middle of the
  stack finishes first, the remaining bars shift sideways by 5 px at that row.
- Arrow labels are not collision-checked; long labels between adjacent lanes
  can overlap lifelines.
- Every row re-renders once when a lane is added (§4.2). This is fine for a
  few thousand rows; beyond that, virtualise.
- The model itself does not limit `pending` size or age. Apply a policy in
  your reducer if expectations can be lost.

## 9. Tests

- `swimlane.model.test.ts`: ingest semantics, implicit lanes, `fulfils`, ring
  buffer and span GC, Immer safety (frozen, unshared, earlier rows keep their
  identity), projection, description, parent inference and `parentId`
  override, caller-supplied `rowId` (used, falls back on collision, survives
  a full model rebuild), lane seeding (`createSwimlaneModel({lanes})`
  produces no row, a later `lane` event for a seeded lane only updates
  label/meta, a call referencing a seeded lane adds no implicit row),
  per-lane `activityClassName`/`activityStyle` (from both a `lane` event and
  a `lanes` seed, most recent wins), and `announce: false` (registers the
  lane with no row, combines with activity colour/meta on the same event,
  has no further effect once the lane is already known, and does not affect
  lanes added implicitly by a referencing call).
- `swimlane.component.test.tsx`: row counts, vertical names, the pending
  toggle, hover enter/leave deduplication and highlighting, click payloads,
  `highlightId`, related-transition highlighting, horizontal growth when a
  lane is added, the `now` prop, `formatTs`/`formatWait` overrides,
  `step`-based row grouping (tie mark, and that different/missing `step`
  values are not grouped), `showLabel` on state events, the three outcome
  states, step hover/click (highlighting, `steps` payload, and that an
  unstepped row is its own step), lane-header hover/click (`"lane"` target,
  one hit zone per lane), `meta` echoed for `transition`/`pending`/
  `state`/`lane` targets (including that it's `undefined` when absent), that
  an error reply gets the red `✗` mark while a successful one still gets the
  green `✓` (§7a), a `state` target with a string `rowId` resolving
  correctly, seeded lanes rendering in the header with no row, the `style`
  prop applying to the root element alongside `className`, a lane's
  `activityClassName`/`activityStyle` applying to (only) its own activity
  bars, and a lane announced with `announce: false` rendering in the header
  with no row.

Vitest cannot load `@pihanga2/core`'s dist (it uses extension-less ESM
imports), so both test files `vi.mock` the few runtime helpers called at
import time.
