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

import {Component as StackComponent} from "./stack.component";
import type {StackProps} from "./stack.types";

function renderStack(props: Partial<StackProps> = {}) {
  const full = {
    cardName: "test/stack",
    ...props,
  } as unknown as PiCardProps<StackProps>;
  return render(<StackComponent {...full} />);
}

function root(container: HTMLElement) {
  return container.querySelector("[data-pihanga]") as HTMLElement;
}

describe("shad/stack component", () => {
  it("always has flex class", () => {
    const {container} = renderStack();
    expect(root(container).className).toContain("flex");
  });

  it.each([
    ["row", "flex-row"],
    ["row-reverse", "flex-row-reverse"],
    ["column", "flex-col"],
    ["column-reverse", "flex-col-reverse"],
  ] as const)("maps direction %s to %s", (direction, cls) => {
    const {container} = renderStack({direction});
    expect(root(container).className).toContain(cls);
  });

  it.each([
    ["flex-start", "justify-start"],
    ["center", "justify-center"],
    ["flex-end", "justify-end"],
    ["space-between", "justify-between"],
    ["space-around", "justify-around"],
    ["space-evenly", "justify-evenly"],
  ] as const)("maps justifyContent %s to %s", (jc, cls) => {
    const {container} = renderStack({justifyContent: jc});
    expect(root(container).className).toContain(cls);
  });

  it.each([
    ["flex-start", "items-start"],
    ["center", "items-center"],
    ["stretch", "items-stretch"],
    ["flex-end", "items-end"],
    ["baseline", "items-baseline"],
  ] as const)("maps alignItems %s to %s", (ai, cls) => {
    const {container} = renderStack({alignItems: ai});
    expect(root(container).className).toContain(cls);
  });

  it("applies gap-<n> for spacing", () => {
    const {container} = renderStack({spacing: 4});
    expect(root(container).className).toContain("gap-4");
  });

  it("does not apply gap for spacing 0", () => {
    const {container} = renderStack({spacing: 0});
    expect(root(container).className).not.toMatch(/gap-\d/);
  });

  it("renders child cards from content[]", () => {
    const {container} = renderStack({content: ["a", "b"]});
    const kids = container.querySelectorAll("[data-child]");
    expect(kids).toHaveLength(2);
  });

  it("interleaves divider between children (n-1 dividers)", () => {
    const {container} = renderStack({content: ["a", "b", "c"], divider: "div"});
    const kids = Array.from(container.querySelectorAll("[data-child]"));
    // 3 items + 2 dividers = 5
    expect(kids).toHaveLength(5);
    const names = kids.map((k) => k.getAttribute("data-child"));
    expect(names).toEqual(["a", "div", "b", "div", "c"]);
  });

  it("emits data-* attributes from the `data` prop", () => {
    const {container} = renderStack({data: {region: "toolbar"}});
    expect(root(container).getAttribute("data-region")).toBe("toolbar");
  });
});
