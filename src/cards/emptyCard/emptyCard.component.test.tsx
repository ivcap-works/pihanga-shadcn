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

import {registerIcon} from "@/cards/icons";
import {EmptyCardComponent} from "./emptyCard.component";
import type {EmptyCardProps} from "./emptyCard.types";

const ICON = "test-empty-icon";
try {
  registerIcon(ICON, () => <svg data-testid="empty-icon" />);
} catch {
  // may already be registered from prior test run
}

function renderE(props: Partial<EmptyCardProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/empty",
    ...props,
  } as unknown as PiCardProps<EmptyCardProps>;
  return render(<EmptyCardComponent {...full} />);
}

describe("shad/empty card", () => {
  it("renders bare when no icon/content", () => {
    const {container} = renderE();
    expect(
      container.querySelector("[data-pihanga='test/empty']"),
    ).not.toBeNull();
    expect(container.querySelector("[data-testid='empty-icon']")).toBeNull();
    expect(container.querySelector("[data-child]")).toBeNull();
  });

  it("renders icon when provided", () => {
    const {getByTestId} = renderE({icon: ICON});
    expect(getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders content card when provided", () => {
    const {container} = renderE({content: "cta/button"});
    expect(container.querySelector("[data-child='cta/button']")).not.toBeNull();
  });

  it("applies className", () => {
    const {container} = renderE({className: "p-8"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("p-8");
  });
});
