A dropdown select input backed by Radix UI's `<Select>` primitive.

Use it inside a `pi/form` card (with `name`) to bind it to form state, or
standalone (with `value`) for directly controlled single-selection.

Set `selfManaged: true` to have the component update its own display immediately
on selection without waiting for the host app to update `value` via a reducer.

Provide `placeholder` text to show when no option is selected.
