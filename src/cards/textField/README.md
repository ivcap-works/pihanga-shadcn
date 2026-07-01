A minimal single-line text input rendered as a shadcn `<Input>`.

Use it inside a `pi/form` card (with `name`) to bind it to form state, or
standalone (with `value`) for directly controlled string inputs.

Set `type` to `"email"`, `"password"`, `"number"`, etc. for semantic HTML
input types.  Set `disabled` to make the field non-interactive.

> For a richer, self-contained input with a built-in label and description,
> prefer the `pi/input` card.  Use `pi/text-field` when you need a bare
> control that a `pi/field` wrapper will label externally.
