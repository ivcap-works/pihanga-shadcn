A real-time swimlane (sequence) diagram for monitoring a running multi-service
deployment. Lanes and calls stream in while the diagram is displayed.

- **Lanes** (one per service) appear as they are first seen. Names are drawn
  vertically in a sticky header together with the current run state and the
  number of open activities.
- **Run state** (`starting`, `running`, `degraded`, `stopped`) is drawn on the
  lifeline itself; state changes get their own row.
- **Call kinds:** `sync` (solid, filled head), `reply` (dashed), error reply
  (dashed red), `async` (open head), `event` fire-and-forget (dotted), and
  self-calls (loop).
- **Activities** show a service handling a call, from the request to its reply
  (`sync`) or `done` (`async`).
- **Outstanding messages** are projected below an orange “now” line: every
  `sync` call implies a reply, and an `expect` event announces any other
  message known to arrive later. When the real event arrives (a reply, or any
  event with `fulfils: <expect id>`) the ghost row is replaced and the new row
  flashes. Waiting time turns red after `timeoutMs`.
- **Hover / click:** wide invisible hit zones over arrows, activities, state
  dots and ghost rows emit `onHoverChanged` (enter/leave only, never on
  pointer move) and `onItemClicked`. Hovering highlights the whole call chain,
  plus (more lightly) the transitions that process creates and receives: its
  outgoing calls, messages and events, and their replies. Hovering a call or
  reply arrow also marks the caller-side process (activity) that sent it and
  receives the reply — only that activity. Causality comes
  from an optional `parentId` on calls, or is inferred from the caller's
  innermost open activity.

Each row is its own fixed-height SVG in normal document flow, so the page (or
the nearest scroll container) scrolls — never the diagram itself.

- **Time formatting:** the timestamp column and the outstanding "waiting …"
  timers default to local wall-clock time, but either can be overridden:
  `formatTs?: (ts: number) => string` formats the `ts` column (and the hover
  tooltip's "started" time); `formatWait?: (ms: number) => string` formats
  the pending-zone duration. Pass these to show a virtual clock, a duration
  since start, or both in one string — no need to shift `ts` values.
- **Grouping a step's events:** give several events the same `step` (string
  or number) on `SwimlaneEventBase` when they come from one logical step
  (for example a state change plus the calls it triggers). Rows for events
  that share a `step` with the row directly above them in `model.rows` draw
  a small tie mark instead of repeating the timestamp, visually joining them
  into one block. Comparison is by ingest-order adjacency, not grouping by
  value across the whole model — interleave different steps and each keeps
  its own timestamp.
- **Highlighting a step:** the timestamp column (and tie mark) is itself a
  hit zone — hovering or clicking it reports `target.kind === "step"` from
  `onHoverChanged` / `onItemClicked`, with `steps: SwimlaneRow[]` listing
  every row that belongs to it (rows sharing a `step`, or just that one row
  if it has none). Every row in the step gets the `.swl-hl-step` highlight.
- **Optional state-dot label:** a `state` event draws `→ <state>` beside its
  dot by default; set `showLabel: false` on the event to draw only the dot.
- **Outcome states:** besides the five service-lifecycle states, three
  first-class states are available for one-shot work that doesn't fit that
  lifecycle: `in_progress`, `succeeded`, `failed` (each with its own themed
  dot colour, `--swl-in-progress` / `--swl-succeeded` / `--swl-failed`).
  Their lifelines stay visually neutral (same as `created`/`running`) so
  they don't fight with the existing lifecycle styling.
- **Clicking/hovering a lane header:** the vertical lane name and its dot at
  the top of a lane are also a hit zone, reporting `target.kind === "lane"`
  (with `target.id` = the lane id) from `onHoverChanged` / `onItemClicked` —
  useful for opening a detail panel for a whole activity/tool from its
  header, not just from one of its transitions.
- **Caller `meta` on events:** any event (`lane`, `state`, `call`, `expect`)
  may carry a `meta: unknown` field — arbitrary data opaque to the card.
  It is copied onto the resulting row/span/pending message and echoed back
  verbatim as `meta` on `onHoverChanged` / `onItemClicked` for that target,
  so the caller does not need to keep a side table mapping row/span ids back
  to its own domain objects.
- **Caller-chosen row ids:** any event may carry `rowId?: string | number`,
  used as the resulting row's `id` instead of the model's internal counter.
  Useful if you rebuild the whole model from scratch on every refresh (for
  example to replay a run, or after a rollback to an earlier point) and want
  row ids to stay stable across rebuilds rather than being renumbered each
  time. If a `rowId` collides with an existing row's id, the card falls back
  to an internal id for that row — check the resulting `SwimlaneRow.id` if
  you need to know which id was actually used.
- **Declaring lanes without a "joined" row:** `createSwimlaneModel({lanes})`
  seeds `laneOrder`, `laneLabels`, `laneMeta` and the initial run state
  directly, so every seeded lane is present from the start with no `lane`
  row (no grey "joined" box). A later `lane` event for an already-seeded
  lane only updates its label/meta, same as for any other known lane. For a
  lane that only becomes known *while the stream is already running* (so it
  cannot be seeded up front), set `announce: false` on that lane's first
  `lane` event instead — it still registers the lane (label/meta/activity
  style included) but produces no row either. `announce` only matters the
  first time a lane is seen; it has no effect on a later `lane` event for an
  already-known lane, which never produces a row regardless.
- **Per-lane activity bar colour:** a `lane` event (or a `createSwimlaneModel({lanes})`
  seed) may carry `activityClassName?: string` and/or
  `activityStyle?: React.CSSProperties`, applied to that lane's activity bar
  (the rectangle drawn on the lifeline while the lane is handling a call) —
  so different lane *types* (e.g. "tool" vs. "agent" activities) can be
  told apart at a glance. Prefer `activityClassName` with your own CSS rule
  (e.g. `.swl-act-tool rect { fill: var(--my-tool-color); }`) to stay
  theme-token-friendly across light/dark mode; `activityStyle` sets inline
  `fill`/`stroke` directly for one-off colours. Both apply to every call
  handled by that lane, not to one call in particular — the per-call
  highlight classes (`swl-hl`, `swl-hl-proc`) still layer on top.

### State and actions

The data lives in your Redux state as a plain-JSON `SwimlaneModel`
(`createSwimlaneModel()`). Feed it with `ingestSwimlaneEvents(model, events)`
inside any reducer, or use the ready-made wiring:

- `registerSwimlaneModel(r, modelId, selector)` handles
  `SWIMLANE_DATA_ACTION.EVENTS_RECEIVED` / `ROWS_CLEARED` for that model.
- `dispatchSwimlaneEvents(dispatch, {modelId, events})` from a stream adapter.
  Batch events (e.g. once per animation frame) to avoid a re-render storm.

The model keeps at most `maxRows` rows (default 2000).

Everything visible — lanes (including new ones, which widen the diagram),
rows, run states, activities and outstanding messages — is derived from the
`model` prop. Pass `now` to drive the “waiting” timers from props too (e.g.
when replaying a recorded trace). See `DESIGN.md` for the implementation and
extension points.

`className` and `style` are both accepted on the card's root element, same
as any other `shad/*` card.
