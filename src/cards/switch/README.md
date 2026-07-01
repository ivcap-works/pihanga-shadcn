A toggle control for binary on/off states — the shadcn `<Switch>` rendered as a
Pihanga card.

Use it for settings that take immediate effect (e.g. "Enable notifications",
"Dark mode") where a checkbox would feel too form-like.  When placed inside a
`pi/form` card and given a `name` prop, it reads and writes through the shared
form state automatically.

Provide an optional `label` to display descriptive text beside the toggle.
Set `disabled` to make the switch non-interactive.
