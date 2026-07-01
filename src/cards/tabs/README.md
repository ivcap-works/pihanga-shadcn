Renders a horizontal (or vertical) tab strip backed by shadcn/ui's Tabs component.

**Modes:**

| Mode | `selfManaged` | Who controls the active tab? |
|---|---|---|
| Self-managed | `true` | Component internally — no reducer needed |
| Controlled | `false` (default) | Host app via `value` prop + reducer |

In **both** modes the `onTabChanged` event is dispatched whenever a tab is selected,
so external reducers can observe or override the active tab even in self-managed mode.

Each tab entry requires an `id`, a `title`, and a `contentCard` (`PiCardRef`).

**Overflow → drop-down:** set `maxTabs` to an integer. When the number of tabs
exceeds that limit the tab strip is automatically replaced by a `<Select>`
drop-down so the UI stays compact even with many tabs.
