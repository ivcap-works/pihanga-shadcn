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

import {FlexGridComponent} from "./flexGrid.component";
import type {FlexGridProps} from "./flexGrid.types";

function renderFG(props: Partial<FlexGridProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/fg",
    template: {},
    cards: {},
    _cls: () => "",
    ...props,
  } as unknown as PiCardProps<FlexGridProps>;
  return render(<FlexGridComponent {...full} />);
}

function root(container: HTMLElement) {
  return container.querySelector("[data-pihanga]") as HTMLElement;
}

describe("shad/flex-grid", () => {
  it("renders a CSS grid container", () => {
    const {container} = renderFG();
    expect(root(container).style.display).toBe("grid");
  });

  it("applies gridTemplateAreas from template.area", () => {
    const {container} = renderFG({
      template: {
        area: [
          ["a", "b"],
          ["a", "c"],
        ],
      },
    });
    const style = root(container).style;
    expect(style.gridTemplateAreas).toBe(`"a b" "a c"`);
  });

  it("applies rows / columns", () => {
    const {container} = renderFG({
      template: {rows: ["1fr", "2fr"], columns: ["100px", "1fr"]},
    });
    const style = root(container).style;
    expect(style.gridTemplateRows).toBe("1fr 2fr");
    expect(style.gridTemplateColumns).toBe("100px 1fr");
  });

  it("applies default gap 10px", () => {
    const {container} = renderFG();
    expect(root(container).style.gridGap).toBe("10px");
  });

  it("renders each entry in `cards`", () => {
    const {container} = renderFG({cards: {a: "app/a", b: "app/b"}});
    expect(container.querySelectorAll("[data-child]")).toHaveLength(2);
  });
});
