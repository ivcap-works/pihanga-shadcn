A set of two-state buttons — each item can be pressed or not.  The group
supports **single** selection (like a radio group) or **multiple** selection
(like a checkbox group).

Set `type` to `"single"` or `"multiple"` to control the selection mode.
Use `variant` (`"default"` | `"outline"`) and `size` (`"sm"` | `"default"` | `"lg"`)
to adjust the visual style.  Set `spacing` to `0` for a joined pill-group look
or to a positive number for spaced individual buttons.

**Self-managed mode** (`selfManaged: true`): the component tracks its own
selection state internally so no external state wiring is required.  The
`value` prop acts as the initial selection; `onChanged` is still fired on
every change so you can observe updates without owning the state.

The component also integrates with `pi/form`: when given a `name` prop inside
a `pi/form` card it reads from and writes back to the shared form state
(form context always takes precedence over `selfManaged`).
