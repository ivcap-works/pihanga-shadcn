Renders a scrollable content area with a minimap-style annotation overlay on the scrollbar track.

Coloured markers are drawn on the track for each annotation — clicking a marker scrolls the
content to that position **and** emits `onAnnotationClicked` so parent reducers can react
(e.g. open a detail dialog).  Hovering a marker emits `onAnnotationHovered`.

The component has no built-in height — size it from outside via the `className` prop
(e.g. `className="h-96"` or `className="h-full"`) or a parent flex/grid layout.
Marker positions are derived from the scrollbar's actual DOM height at render time.

Three marker shapes are supported via `markerType`:

- `"point"` (default) — small circular dot centred on `position`.
- `"bar"` — short vertical rectangle with a fixed CSS height; useful for discrete events.
- `"range"` — vertical rectangle whose height is proportional to `extent` (content pixels),
  with a CSS `min-height` so tiny ranges remain clickable.

Each annotation's `type` is applied as a CSS class `swa-type-<type>` on the marker element,
enabling per-type colour coding without any JavaScript.  The predefined types and their default
colours are:

| `type`      | CSS class           | Default colour |
|-------------|---------------------|----------------|
| `"error"`   | `swa-type-error`    | `#e24b4a` (red)    |
| `"warning"` | `swa-type-warning`  | `#f39c12` (amber)  |
| `"todo"`    | `swa-type-todo`     | `#378add` (blue)   |
| `"comment"` | `swa-type-comment`  | `#95a5a6` (grey)   |
| `"review"`  | `swa-type-review`   | `#888780` (taupe)  |
| `"fixme"`   | `swa-type-fixme`    | `#ba7517` (orange) |

Override any colour via the corresponding CSS custom property (e.g. `--swa-color-error`).
Additional per-marker classes can be added with the optional `className` field on each annotation.

All colours, sizes, and transitions are controlled by CSS custom properties (prefixed `--swa-`)
defined in `scrollbarWithAnnotations.css` and can be overridden per-page without touching JS.

Set `reportEventsOnScroll: true` to receive hover events while the user is scrolling (defaults
to `false` to avoid flooding Redux with events during scroll).
