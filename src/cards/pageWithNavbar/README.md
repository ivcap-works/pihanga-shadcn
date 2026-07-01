The primary full-page shell card.

Renders a responsive header with a logo/title, optional navigation links
(collapsed into a hamburger on small screens), left and right header action
slots, and a scrollable main content area.  An optional footer row can be
shown below the main content.

Use this as the outermost card for most app pages.  Pair it with
`ModeToggle` in `headerRightCard` for a theme switcher, and with
`NavbarSearch` in `headerLeftCard` for a global search bar.

The `navLinks` array drives the navigation; clicking a link emits
`onNavigateTo` with the link's `id`.
