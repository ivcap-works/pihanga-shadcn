import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {MessageComponent} from "./message.component";
import {MessageGroupComponent} from "./messageGroup.component";
import type {MessageGroupProps, MessageProps} from "./message.types";

function renderMessage(
  props: Partial<MessageProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/message",
    contentCard: "app/bubble",
    ...props,
  } as unknown as PiCardProps<MessageProps>;
  return render(<MessageComponent {...full} />);
}

describe("shad/message", () => {
  it("renders the contentCard", () => {
    const {container} = renderMessage({contentCard: "app/bubble"});
    expect(container.querySelector("[data-child='app/bubble']")).not.toBeNull();
  });

  it("renders avatarCard inside MessageAvatar when provided", () => {
    const {container} = renderMessage({avatarCard: "app/avatar"});
    expect(container.querySelector("[data-slot='message-avatar']")).not.toBeNull();
    expect(container.querySelector("[data-child='app/avatar']")).not.toBeNull();
  });

  it("omits MessageAvatar when avatarCard is not set", () => {
    const {container} = renderMessage();
    expect(container.querySelector("[data-slot='message-avatar']")).toBeNull();
  });

  it("renders headerCard and footerCard when provided", () => {
    const {container} = renderMessage({
      headerCard: "app/header",
      footerCard: "app/footer",
    });
    expect(container.querySelector("[data-slot='message-header']")).not.toBeNull();
    expect(container.querySelector("[data-slot='message-footer']")).not.toBeNull();
  });

  it("defaults align to start", () => {
    const {container} = renderMessage();
    const root = container.querySelector("[data-slot='message']") as HTMLElement;
    expect(root.getAttribute("data-align")).toBe("start");
  });

  it("data-pihanga is set", () => {
    const {container} = renderMessage({cardName: "app/msg"});
    expect(container.querySelector("[data-pihanga='app/msg']")).not.toBeNull();
  });
});

describe("shad/message-group", () => {
  function renderGroup(props: Partial<MessageGroupProps> = {}) {
    const full = {
      cardName: "test/group",
      content: ["app/m1", "app/m2"],
      ...props,
    } as unknown as PiCardProps<MessageGroupProps>;
    return render(<MessageGroupComponent {...full} />);
  }

  it("renders every card in content", () => {
    const {container} = renderGroup({content: ["app/m1", "app/m2"]});
    expect(container.querySelector("[data-child='app/m1']")).not.toBeNull();
    expect(container.querySelector("[data-child='app/m2']")).not.toBeNull();
  });
});
