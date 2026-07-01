Badges are compact status descriptors attached to UI elements.
Use them to communicate the state of an item — its lifecycle phase,
category, or importance — at a glance.

The four built-in variants map directly to the `BadgeColumn.variants` map
in `shad/data-table`, so a badge card and a table badge column can always
be kept in sync without a translation layer.

When the badge label or variant needs to react to application state, wrap
the prop in `memo()` inside `app.pihanga.ts` — keep example files
data-only.
