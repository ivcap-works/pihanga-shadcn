An interactive range slider built on the [Radix UI Slider](https://www.radix-ui.com/primitives/docs/components/slider) primitive.

Use it to let users select a numeric value within a bounded range (e.g. volume, opacity, price).
When placed inside a `pi/form` card with a `name` prop, the slider reads its value from form
state and writes back via `form.handleChange`.  In standalone mode, handle changes with
`onPiSliderChanged`.

**Controlling event frequency**

By default `onPiSliderChanged` fires on every drag position.  Two props let you reduce that:

- `debounceMs` — coalesces `onChanged` events; only the last value in each quiet window is
  dispatched.  The thumb still moves immediately.
- `onCommitted` / `onPiSliderCommitted` — fires exactly once when the user releases the thumb
  (mouse-up / touch-end).  Use this when only the final settled value matters.

Both can be combined: `debounceMs` throttles `onChanged` during drag while `onPiSliderCommitted`
delivers the definitive final value.

Set `selfManaged: true` to have the slider maintain its own internal value — the thumb moves
immediately without an external state update.

An optional `label` is rendered above the track with the current value shown on the right,
keeping the layout consistent with the read-only `shad/slider-value` card.
