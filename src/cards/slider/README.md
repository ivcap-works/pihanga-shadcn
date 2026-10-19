An interactive range slider built on the [Radix UI Slider](https://www.radix-ui.com/primitives/docs/components/slider) primitive.

Use it to let users select a numeric value or an inclusive two-value range within fixed bounds
(e.g. volume, opacity, price, or a time range). Pass a number for one thumb or a
`[minimum, maximum]` tuple for two thumbs. `minStepsBetweenThumbs` optionally enforces separation.
When placed inside a `pi/form` card with a `name` prop, the slider reads its value from form
state and writes back via `form.handleChange`.  In standalone mode, handle changes with
`onSliderChanged`.

**Controlling event frequency**

By default `onSliderChanged` fires on every drag position.  Two props let you reduce that:

- `debounceMs` — coalesces `onChanged` events; only the last value in each quiet window is
  dispatched.  The thumb still moves immediately.
- `onSliderCommitted` — fires exactly once when the user releases the thumb
  (mouse-up / touch-end).  Use this when only the final settled value matters.

Both can be combined: `debounceMs` throttles `onChanged` during drag while `onSliderCommitted`
delivers the definitive final value.

Set `selfManaged: true` to have the slider maintain its own internal value — the thumb moves
immediately without an external state update.

An optional `label` is rendered above the track with the current value shown on the right,
keeping the layout consistent with the read-only `shad/slider-value` card.

**Tick marks**

Enable tick marks with `showTicks: true`.  All tick props are optional and compose independently.

| Prop | Default | Effect |
|---|---|---|
| `showTicks` | `false` | Show/hide the tick strip below the track |
| `tickStep` | `step` | Spacing between minor (short) tick marks. `0` = no minor ticks |
| `majorTickStep` | `(max−min)/5` rounded to `tickStep` | Spacing between major (tall, labelled) ticks. `0` = no major ticks |
| `suppressTickLabels` | `false` | Show tick marks only — suppress all labels |
| `tickLabels` | — | Custom label text keyed by value; overrides numeric default |

**Tick modes at a glance**

```
tickStep > 0, majorTickStep > 0   →  minor + major ticks, labels on major ticks
tickStep > 0, majorTickStep = 0   →  minor ticks only, label on every minor tick
tickStep = 0, majorTickStep > 0   →  major ticks only (auto-calculated from step)
tickStep = 0, majorTickStep = 0   →  nothing shown
suppressTickLabels = true         →  tick marks only, no labels regardless of other settings
```

For scalar values, ticks at or below the value are active. For tuple values, ticks between the
two values are active. Inactive ticks use `bg-primary/20` and transition smoothly as thumbs move.
