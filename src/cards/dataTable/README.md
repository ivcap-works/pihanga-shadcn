A Tailwind-styled data table with sorting, expandable rows, pagination, and
multiple column types.

**Supported column types:**

| Type | Rendering |
|---|---|
| `text` (default) | Plain string value |
| `number` | Right-aligned; optional `format` function |
| `date` | Formatted date string |
| `badge` | `ShadBadge` with per-value variant mapping via `variants` |
| `boolean` | Checkmark / dash |
| `card` | Full `PiCardRef` — any Pihanga card as a cell |

**Expandable rows:** set `detailCard` on a row to show a full-width panel below it.

**Pagination:** add `pageSize` to enable client-side pagination.
