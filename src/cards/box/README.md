A generic layout container — a `<div>` wrapper with first-class support for
spacing props (`marginTop`, `paddingLeft`, etc.), fixed `width`/`height`,
and arbitrary Tailwind `className`.

Use `Box` as a spacing shim, a fixed-size region, or a named logical grouping
when CSS Flexbox / Grid utilities alone are not enough.  Nest `Box` cards
inside `Stack`, `FlexGrid`, or `Resizable` panels to build complex layouts.

The `content` array accepts an ordered list of `PiCardRef` strings to render
as direct children.
