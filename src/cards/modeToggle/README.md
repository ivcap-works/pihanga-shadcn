A dropdown button that switches the application colour scheme between
**light**, **dark**, and **system** modes.

Place it once in your app header (e.g. inside `PageWithNavbar`'s
`headerRightCard`) to give users a global theme selector.

The button's appearance is controlled by `variant` (defaults to
`"outline"`).  The selected mode is persisted to `localStorage` under the
key `"shadcn-ui-theme"` by the `ThemeProvider` wrapper in the Framework card.
