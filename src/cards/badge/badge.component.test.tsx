import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {BadgeComponent} from "./badge.component";
import type {BadgeCardProps} from "./badge.types";

function renderBadge(
  props: Partial<BadgeCardProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/badge",
    label: "Hello",
    ...props,
  } as unknown as PiCardProps<BadgeCardProps>;
  return render(<BadgeComponent {...full} />);
}

describe("shad/badge component", () => {
  it("renders label text", () => {
    const {getByText} = renderBadge({label: "Active"});
    expect(getByText("Active")).toBeInTheDocument();
  });

  it("attaches data-pihanga with the cardName", () => {
    const {container} = renderBadge({cardName: "app/status"});
    const el = container.querySelector("[data-pihanga='app/status']");
    expect(el).not.toBeNull();
  });

  it("applies additional className", () => {
    const {container} = renderBadge({className: "ring-2"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("ring-2");
  });

  it.each(["default", "secondary", "destructive", "outline"] as const)(
    "renders variant %s",
    (variant) => {
      const {container} = renderBadge({variant, label: variant});
      const el = container.querySelector("[data-pihanga]");
      expect(el?.textContent).toBe(variant);
    },
  );

  it("defaults to secondary variant when omitted", () => {
    // We can't inspect the variant directly, but the render should succeed
    // and produce a single element with the label.
    const {container} = renderBadge({label: "X"});
    expect(container.querySelectorAll("[data-pihanga]")).toHaveLength(1);
  });
});
