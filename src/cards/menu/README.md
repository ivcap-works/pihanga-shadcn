A dropdown menu triggered by a configurable button.

The trigger button is defined via `menuButton` (label, tooltip, variant, etc.).
Items are declared as an array of `{id, title}` objects; insert `null` between
items to render a visual separator.

Use it for action menus on rows in a table, "more options" (⋯) buttons in
toolbars, or any context where a compact set of actions should be hidden until
needed.

The card emits `onClicked` with the `itemID` of the item the user selected.
