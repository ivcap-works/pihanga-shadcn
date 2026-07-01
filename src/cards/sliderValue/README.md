A read-only companion to the interactive `shad/slider` card.

Renders the same track + filled-range visual as the slider but without a thumb
and without any user interaction.  The fill width is proportional to `value`
within the `[min, max]` range, so both cards look visually consistent side by
side or in alternating read/edit contexts.

Use `shad/slider-value` in summary panels, data tables, or anywhere you want
to display a bounded numeric value at a glance without allowing edits.
