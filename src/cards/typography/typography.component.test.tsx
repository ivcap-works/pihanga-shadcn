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

import {TypographyComponent} from "./typography.component";
import type {TypographyLevel, TypographyProps} from "./typography.types";

function renderT(props: Partial<TypographyProps> = {}) {
  const full = {
    cardName: "t",
    _cls: () => "",
    ...props,
  } as unknown as PiCardProps<TypographyProps>;
  return render(<TypographyComponent {...full} />);
}

describe("shad/typography component", () => {
  it("renders `text` as content", () => {
    const {getByText} = renderT({text: "Hello world"});
    expect(getByText("Hello world")).toBeInTheDocument();
  });

  it.each<[TypographyLevel, string]>([
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
    ["h4", "H4"],
    ["p", "P"],
    ["blockquote", "BLOCKQUOTE"],
    ["code", "CODE"],
    ["lead", "P"],
    ["large", "DIV"],
    ["small", "SMALL"],
    ["muted", "P"],
  ])("level %s renders as %s tag", (level, tag) => {
    const {container} = renderT({text: "x", level});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.tagName).toBe(tag);
  });

  it("defaults to a div when no level given", () => {
    const {container} = renderT({text: "x"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.tagName).toBe("DIV");
  });

  it("renders a nested childCard via <Card />", () => {
    const {container} = renderT({childCard: "some/card"});
    expect(container.querySelector("[data-child='some/card']")).not.toBeNull();
  });

  it("renders `paragraph` array of strings + typography items", () => {
    const {container} = renderT({
      paragraph: ["Hello ", {text: "world", level: "code"}, "!"],
    });
    const root = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(root.textContent).toContain("Hello");
    expect(root.textContent).toContain("world");
    expect(root.textContent).toContain("!");
    expect(root.querySelector("code")).not.toBeNull();
  });

  it("passes className through", () => {
    const {container} = renderT({text: "x", className: "my-cls"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("my-cls");
  });
});
