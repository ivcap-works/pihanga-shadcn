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

**Per-cell styling:** each column definition accepts `cellStyle` and `cellClassName`
in both static and function forms so you can colour-code individual cells based on
their value or the full row:

```ts
// Static — applies the same style to every cell in the column
{ key: "tier", cellStyle: { fontWeight: "bold" } }

// Dynamic — function receives (value, row) and returns CSSProperties | undefined
// Use contrastColor() from "@pihanga2/shadcn/lib/utils" (or "@/lib/utils") to
// automatically pick black or white text for WCAG AA contrast against any background.
{
  key: "label",
  cellStyle: (value) => {
    const bgMap: Record<string, string> = {
      Superior:            "#4472C4",
      Satisfactory:        "#70AD47",
      "Needs Improvement": "#FFC000",
      Unsatisfactory:      "#FF0000",
    };
    const bg = bgMap[String(value)];
    return bg ? { backgroundColor: bg, color: contrastColor(bg) } : undefined;
  },
}

// Tailwind variant via cellClassName function
{
  key: "status",
  cellClassName: (value) =>
