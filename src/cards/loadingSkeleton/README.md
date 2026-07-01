Wraps an async-loaded content card with animated shimmer rows while data is
being fetched.

Set `loading: true` to show placeholder rows; set `loading: false` to
transparently render the `content` card (or nothing when `content` is
omitted).  No extra DOM wrapper is added in the loaded state.

| Prop | Default | Purpose |
|---|---|---|
| `loading` | — | Boolean gate; drive with `memo()` for reactive updates |
| `rows` | `3` | Number of placeholder rows |
| `rowSize` | `"md"` | Row height preset: `"xs"` `"sm"` `"md"` `"lg"` `"xl"` |
| `spacing` | `"md"` | Gap between rows: `"sm"` `"md"` `"lg"` |
| `rowClassName` | — | Raw Tailwind override for rows (takes precedence over `rowSize`) |
| `className` | — | Raw Tailwind override for wrapper (takes precedence over `spacing`) |
| `content` | — | Card to render when `loading` is `false` |

Use the **preset** props (`rowSize` / `spacing`) when no Tailwind knowledge is
needed.  Use the raw **override** props for non-standard layouts (e.g. grid).
