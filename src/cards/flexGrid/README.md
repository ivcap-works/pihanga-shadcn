A CSS Grid layout card that maps named child cards onto grid template areas.

Define named areas in `template.area` (a 2-D array of card keys) and list
the corresponding `PiCardRef` values in the `cards` map.  The grid fills the
available space using `template.rows` and `template.columns` sizing.

Use `FlexGrid` for two-dimensional layouts — dashboard panels, page
shells with header/sidebar/main/footer — where `Stack` (one-dimensional)
is not enough.

Named areas make the layout intent explicit and easy to rearrange by editing
the `template.area` array.
