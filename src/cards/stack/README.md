A Flexbox layout card that arranges its child cards in a row or column with
configurable gap, alignment, and justification.

Use `Stack` as the primary building block for one-dimensional layouts: vertical
page sections, horizontal toolbars, button groups, and card grids.

The `direction` prop switches between row and column layout.  `spacing`
controls the Tailwind gap between children (in spacing units).  `justifyContent`
and `alignItems` mirror their CSS Flexbox equivalents.

An optional `divider` card ref is rendered between consecutive children.
