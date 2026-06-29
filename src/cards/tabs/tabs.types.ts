import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const TABS_CARD = "shad/tabs";

export const Tabs = createCardDeclaration<TabsProps, TabsEvents>(TABS_CARD);

/** @deprecated Use {@link Tabs} instead. */
export const SdTabs = Tabs;

export const TABS_ACTION = registerActions(TABS_CARD, ["tabChanged"]);

export const onTabsTabChanged = createOnAction<TabsTabChangedEvent>(
  TABS_ACTION.TABCHANGED,
);

// ─── Tab item definition ──────────────────────────────────────────────────────

/**
 * A single tab entry in the tabs component.
 */
export type TabItem = {
  /** Unique identifier used for controlled value and events. */
  id: string;

  /**
   * The label displayed on the tab trigger.
   * Can be a plain string or a PiCardRef for custom/rich tab labels.
   */
  title: string | PiCardRef;

  /**
   * The Pihanga card rendered as the body of this tab when it is active.
   */
  contentCard: PiCardRef;

  /** When true the tab trigger is rendered as disabled. */
  disabled?: boolean;
};

// ─── Card props ───────────────────────────────────────────────────────────────

export type TabsProps = {
  /** Ordered list of tab definitions. */
  tabs: TabItem[];

  /**
   * Controlled: the currently active tab id.
   * Must be provided (or supplied via a state mapper) when selfManaged is
   * false (the default).
   */
  value?: string;

  /**
   * Uncontrolled initial active tab id.
   * Used as the initial value in self-managed mode when value is not set;
   * falls back to the first tab id if omitted.
   */
  defaultValue?: string;

  /**
   * When true, the component manages its own active tab state internally.
   * The onTabChanged event is still dispatched on every change so external
   * reducers can observe the selection.
   *
   * When false (default), value fully controls the displayed tab.
   * @default false
   */
  selfManaged?: boolean;

  /**
   * Layout orientation of the tab list.
   * Passed directly to the Radix Tabs primitive.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /** Additional Tailwind/CSS classes applied to the root Tabs element. */
  className?: string;

  /** Additional classes applied to the TabsList element. */
  listClassName?: string;

  /** Additional classes applied to each TabsContent element. */
  contentClassName?: string;

  /**
   * Maximum number of tabs to display as a standard tab strip.
   * When the number of tabs exceeds this value the tab selector is replaced
   * by a drop-down `<Select>` menu while the tab content area continues to
   * work as normal.
   *
   * When omitted (or `undefined`) the tab strip is always used regardless of
   * how many tabs there are.
   */
  maxTabs?: number;
};

// ─── Events ───────────────────────────────────────────────────────────────────

export type TabsTabChangedEvent = {
  /** The id of the newly selected tab. */
  tabId: string;
};

export type TabsEvents = {
  /** Fired whenever the user selects a different tab. */
  onTabChanged: TabsTabChangedEvent;
};
