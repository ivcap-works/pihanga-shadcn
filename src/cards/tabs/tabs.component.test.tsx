import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {TabsComponent} from "./tabs.component";
import type {TabsEvents, TabsProps} from "./tabs.types";

function renderTabs(
  props: Partial<TabsProps> & {cardName?: string} = {},
  onTabChanged = vi.fn(),
) {
  const full = {
    cardName: "test/tabs",
    tabs: [],
    ...props,
    onTabChanged,
  } as unknown as PiCardProps<TabsProps, TabsEvents>;
  return {onTabChanged, ...render(<TabsComponent {...full} />)};
}

const tabs = [
  {id: "a", title: "Alpha", contentCard: "app/a"},
  {id: "b", title: "Beta", contentCard: "app/b"},
];

describe("shad/tabs", () => {
  it("renders one trigger per tab", () => {
    const {getByText} = renderTabs({tabs});
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
  });

  it("defaults to first tab when neither value nor defaultValue set", () => {
    const {container} = renderTabs({tabs});
    // active trigger has data-state=active
    const active = container.querySelector(
      "[role='tab'][data-state='active']",
    ) as HTMLElement;
    expect(active.textContent).toBe("Alpha");
  });

  it("respects controlled `value`", () => {
    const {container} = renderTabs({tabs, value: "b"});
    const active = container.querySelector(
      "[role='tab'][data-state='active']",
    ) as HTMLElement;
    expect(active.textContent).toBe("Beta");
  });

  it("clicking a tab emits onTabChanged({tabId})", () => {
    const {getByText, onTabChanged} = renderTabs({tabs, selfManaged: true});
    // Radix Tabs uses pointerDown / mousedown for activation
    fireEvent.pointerDown(getByText("Beta"), {button: 0});
    fireEvent.mouseDown(getByText("Beta"));
    fireEvent.click(getByText("Beta"));
    expect(onTabChanged).toHaveBeenCalledWith({tabId: "b"});
  });

  it("selfManaged updates active tab internally", () => {
    const {container, getByText} = renderTabs({tabs, selfManaged: true});
    fireEvent.pointerDown(getByText("Beta"), {button: 0});
    fireEvent.mouseDown(getByText("Beta"));
    fireEvent.click(getByText("Beta"));
    const active = container.querySelector(
      "[role='tab'][data-state='active']",
    ) as HTMLElement;
    expect(active.textContent).toBe("Beta");
  });

  it("uses dropdown when tabs.length > maxTabs", () => {
    const many = Array.from({length: 5}, (_, i) => ({
      id: `t${i}`,
      title: `T${i}`,
      contentCard: `app/${i}`,
    }));
    const {container} = renderTabs({tabs: many, maxTabs: 3});
    // No TabsList (role=tablist) — instead a Select combobox
    expect(container.querySelector("[role='combobox']")).not.toBeNull();
  });

  it("data-pihanga on root", () => {
    const {container} = renderTabs({tabs, cardName: "app/tabs"});
    expect(container.querySelector("[data-pihanga='app/tabs']")).not.toBeNull();
  });
});
