A step-indicator / wizard progress component backed by shadcn/ui styling.

**Modes:**

| Mode | `selfManaged` | Who controls the active step? |
|---|---|---|
| Self-managed | `true` | Component internally — no reducer needed |
| Controlled | `false` (default) | Host app via `activeStep` prop + reducer |

In **both** modes `onStepClicked` is dispatched on every click, so external
reducers can observe or override the active step even in self-managed mode.

Steps may include an optional `description` sub-label and can be marked
`optional` to show a secondary indicator.
