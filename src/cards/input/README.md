The Input card wraps the shadcn `<Input>` primitive and layers on
Pihanga-idiomatic features: an optional `label`, a helper `description`
line, and transparent integration with the `pi/form` card via
`FormContext`.

When used inside a `pi/form` card and given a `name` prop, the input
reads its value from and writes changes back to the form's shared state
automatically — no reducer required.  Outside a form it operates as a
standalone controlled input and dispatches `onChanged` events.

## Auto-focus on first show

Set `autoFocus` to have the input grab keyboard focus the first time it is
mounted — e.g. when a dialog or drawer containing it opens. It only fires
once, on mount; it will not re-focus on subsequent re-renders.

```ts
PiInput({name: "email", autoFocus: true});
```
