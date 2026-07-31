import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {registerIcon} from "@/cards/icons";
import {IconCardComponent} from "./iconCard.component";
import type {IconCardProps} from "./iconCard.types";

// Register a fake icon exactly once at module load
const iconName = "test-star";
try {
  registerIcon(iconName, (props: {className?: string}) => (
    <svg data-testid="star-icon" {...props} />
  ));
} catch {
  // already registered — ignore in re-runs
}

function renderIcon(props: Partial<IconCardProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/icon",
    iconName,
    ...props,
  } as unknown as PiCardProps<IconCardProps>;
  return render(<IconCardComponent {...full} />);
}

describe("shad/icon component", () => {
  it("renders the registered icon", () => {
    const {getByTestId} = renderIcon();
    expect(getByTestId("star-icon")).toBeInTheDocument();
  });

  it("wraps icon in a div with data-pihanga", () => {
    const {container} = renderIcon({cardName: "app/star"});
    const wrap = container.querySelector("[data-pihanga='app/star']");
    expect(wrap?.tagName).toBe("DIV");
  });

  it("applies className to wrapper", () => {
    const {container} = renderIcon({className: "size-4"});
    const wrap = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(wrap.className).toContain("size-4");
  });

  it("renders nothing (but wrapper) for unknown icon name", () => {
    const {container} = renderIcon({iconName: "does-not-exist"});
    const wrap = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(wrap.querySelector("svg")).toBeNull();
  });
});
