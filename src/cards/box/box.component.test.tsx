import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// Mock the nested <Card /> to avoid needing a redux store.
vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {BoxComponent} from "./box.component";
import type {BoxProps} from "./box.types";

function renderBox(props: Partial<BoxProps> = {}) {
  const full = {
    cardName: "test/box",
    ...props,
  } as unknown as PiCardProps<BoxProps>;
  return render(<BoxComponent {...full} />);
}

describe("shad/box component", () => {
  it("renders a div with data-pihanga", () => {
    const {container} = renderBox();
    const el = container.querySelector("[data-pihanga='test/box']");
    expect(el?.tagName).toBe("DIV");
  });

  it("applies className", () => {
    const {container} = renderBox({className: "my-class"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("my-class");
  });

  it("applies fixed width/height in px", () => {
    const {container} = renderBox({width: 100, height: 200});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("200px");
  });

  it("applies all margin/padding spacing props", () => {
    const {container} = renderBox({
      marginTop: 1,
      marginBottom: 2,
      marginLeft: 3,
      marginRight: 4,
      paddingTop: 5,
      paddingBottom: 6,
      paddingLeft: 7,
      paddingRight: 8,
    });
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.style.marginTop).toBe("1px");
    expect(el.style.marginBottom).toBe("2px");
    expect(el.style.marginLeft).toBe("3px");
    expect(el.style.marginRight).toBe("4px");
    expect(el.style.paddingTop).toBe("5px");
    expect(el.style.paddingBottom).toBe("6px");
    expect(el.style.paddingLeft).toBe("7px");
    expect(el.style.paddingRight).toBe("8px");
  });

  it("renders children from content[]", () => {
    const {container} = renderBox({content: ["a", "b", "c"]});
    const children = container.querySelectorAll("[data-child]");
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveAttribute("data-child", "a");
    expect(children[2]).toHaveAttribute("data-child", "c");
  });

  it("renders singleContent when provided (and takes precedence over content)", () => {
    const {container} = renderBox({
      singleContent: "only",
      content: ["ignored"],
    });
    const children = container.querySelectorAll("[data-child]");
    expect(children).toHaveLength(1);
    expect(children[0]).toHaveAttribute("data-child", "only");
  });

  it("emits data-* attributes from the `data` prop", () => {
    const {container} = renderBox({data: {foo: "bar", role: "region"}});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.getAttribute("data-foo")).toBe("bar");
    expect(el.getAttribute("data-role")).toBe("region");
  });
});
