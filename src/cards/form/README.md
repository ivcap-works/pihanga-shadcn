A lightweight form container that provides a shared form context to its child cards.

Child cards (`TextField`, `Checkbox`, `Select`) read from — and write their
changes to — the form context when their `name` prop is set. On submit,
`onPiFormSubmitted` fires with the collected `formData` object.

**Data-flow summary:**

| Scenario | Value source | Change handler |
|---|---|---|
| `name` set + inside Form | `form.formData[name]` | Form context (auto) |
| `name` missing OR outside Form | `props.value` | Pihanga `onChanged` action |
