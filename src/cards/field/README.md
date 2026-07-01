A labelled form-field wrapper that pairs any input card with a visible
`<label>`, optional description text, and an inline error message.

Use it to wrap bare input controls (`pi/text-field`, `pi/select`,
`pi/checkbox`, etc.) when you need consistent label / error presentation
across a form, without each control needing to manage its own label markup.

When the `name` prop is provided and the field is inside a `pi/form` card,
the error is driven automatically by the form's validation state.  Outside
a form, use the `error` prop to show a static error message.
