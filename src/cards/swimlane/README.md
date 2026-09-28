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
