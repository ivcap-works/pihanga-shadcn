A search input designed to live in an app navbar.

Supports type-ahead suggestions via `searchItems` (an array of strings shown
as dropdown options as the user types).  The card emits three events:

- `onSearchSubmit` — fired when the user presses Enter or selects a suggestion.
- `onSearchItems` — fired on every keystroke with the current input value,
  allowing the host app to update `searchItems` dynamically.
- `onSearchFocus` — fired when the input receives keyboard focus.

Place it inside `PageWithNavbar`'s `headerLeftCard` or `headerRightCard`.
