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

import {CollapsibleCardComponent} from "./collapsibleCard.component";
import type {
  CollapsibleCardEvents,
  CollapsibleCardProps,
} from "./collapsibleCard.types";

function renderCC(
  props: Partial<CollapsibleCardProps> & {cardName?: string} = {},
  onOpenChanged = vi.fn(),
) {
  const full = {
    cardName: "test/cc",
    title: "Details",
    contentCard: "app/content",
    ...props,
    onOpenChanged,
  } as unknown as PiCardProps<CollapsibleCardProps, CollapsibleCardEvents>;
  return {onOpenChanged, ...render(<CollapsibleCardComponent {...full} />)};
}

describe("shad/collapsible-card", () => {
  it("renders the title text", () => {
    const {getByText} = renderCC({title: "Options"});
    expect(getByText("Options")).toBeInTheDocument();
  });

  it("starts closed by default (aria-expanded=false)", () => {
    const {container} = renderCC();
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("respects defaultOpen=true", () => {
    const {container} = renderCC({defaultOpen: true});
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("emits onOpenChanged when the trigger is clicked", () => {
    const {container, onOpenChanged} = renderCC();
    const trigger = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(onOpenChanged).toHaveBeenCalledWith({open: true});
  });

  it("controlled `open` overrides internal state", () => {
    const {container} = renderCC({open: true});
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("uses `titleCard` when provided instead of `title`", () => {
    const {container} = renderCC({title: "unused", titleCard: "app/title"});
    expect(container.querySelector("[data-child='app/title']")).not.toBeNull();
  });

  it("data-pihanga is set", () => {
    const {container} = renderCC({cardName: "app/cc"});
    expect(container.querySelector("[data-pihanga='app/cc']")).not.toBeNull();
  });
});
