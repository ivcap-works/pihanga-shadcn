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

import {BubbleComponent} from "./bubble.component";
import {BubbleGroupComponent} from "./bubbleGroup.component";
import type {
  BubbleEvents,
  BubbleGroupProps,
  BubbleProps,
} from "./bubble.types";

function renderBubble(
  props: Partial<BubbleProps> & {cardName?: string} = {},
  onClicked = vi.fn(),
) {
  const full = {
    cardName: "test/bubble",
    text: "Hello",
    ...props,
    onClicked,
  } as unknown as PiCardProps<BubbleProps, BubbleEvents>;
  return {onClicked, ...render(<BubbleComponent {...full} />)};
}

describe("shad/bubble", () => {
  it("renders plain text content", () => {
    const {getByText} = renderBubble({text: "Hi there"});
    expect(getByText("Hi there")).toBeInTheDocument();
  });

  it("renders contentCard instead of text when provided", () => {
    const {container} = renderBubble({
      text: "unused",
      contentCard: "app/markdown",
    });
    expect(
      container.querySelector("[data-child='app/markdown']"),
    ).not.toBeNull();
  });

  it("defaults to variant=default and align=start", () => {
    const {container} = renderBubble();
    const root = container.querySelector("[data-slot='bubble']") as HTMLElement;
    expect(root.getAttribute("data-variant")).toBe("default");
    expect(root.getAttribute("data-align")).toBe("start");
  });

  it("renders as an anchor when href is set", () => {
    const {container} = renderBubble({href: "https://example.com"});
    const a = container.querySelector("a");
    expect(a).not.toBeNull();
    expect(a?.getAttribute("href")).toBe("https://example.com");
  });

  it("renders as a button and fires onClicked when clickable", () => {
    const {getByText, onClicked} = renderBubble({
      id: "reply",
      text: "Reply",
      clickable: true,
    });
    fireEvent.click(getByText("Reply"));
    expect(onClicked).toHaveBeenCalledWith({id: "reply"});
  });

  it("renders reactions", () => {
    const {getByText} = renderBubble({reactions: ["👍", "🔥"]});
    expect(getByText("👍")).toBeInTheDocument();
    expect(getByText("🔥")).toBeInTheDocument();
  });

  it("data-pihanga is set", () => {
    const {container} = renderBubble({cardName: "app/bubble"});
    expect(container.querySelector("[data-pihanga='app/bubble']")).not.toBeNull();
  });
});

describe("shad/bubble-group", () => {
  function renderGroup(
    props: Partial<BubbleGroupProps> & {cardName?: string} = {},
  ) {
    const full = {
      cardName: "test/group",
      content: ["app/b1", "app/b2"],
      ...props,
    } as unknown as PiCardProps<BubbleGroupProps>;
    return render(<BubbleGroupComponent {...full} />);
  }

  it("renders every card in content", () => {
    const {container} = renderGroup({content: ["app/b1", "app/b2"]});
    expect(container.querySelector("[data-child='app/b1']")).not.toBeNull();
    expect(container.querySelector("[data-child='app/b2']")).not.toBeNull();
  });

  it("data-pihanga is set", () => {
    const {container} = renderGroup({cardName: "app/group"});
    expect(container.querySelector("[data-pihanga='app/group']")).not.toBeNull();
  });
});
