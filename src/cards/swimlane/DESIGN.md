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

The related set is memoised on `[hid, model.spans]` and sent in
`onHoverChanged` as `related`. All other rows keep `hl = null` and
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
  override.
- `swimlane.component.test.tsx`: row counts, vertical names, the pending
  toggle, hover enter/leave deduplication and highlighting, click payloads,
  `highlightId`, related-transition highlighting, horizontal growth when a
  lane is added, and the `now` prop.

Vitest cannot load `@pihanga2/core`'s dist (it uses extension-less ESM
imports), so both test files `vi.mock` the few runtime helpers called at
import time.
