import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {AvatarComponent} from "./avatar.component";
import type {AvatarCardProps} from "./avatar.types";

function renderAvatar(
  props: Partial<AvatarCardProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/avatar",
    ...props,
  } as unknown as PiCardProps<AvatarCardProps>;
  return render(<AvatarComponent {...full} />);
}

describe("shad/avatar component", () => {
  it("renders fallback text when no src is provided", () => {
    const {getByText} = renderAvatar({fallback: "JD"});
    expect(getByText("JD")).toBeInTheDocument();
  });

  it("derives fallback from first 2 chars of alt (uppercased) when fallback is missing", () => {
    const {getByText} = renderAvatar({alt: "john doe"});
    expect(getByText("JO")).toBeInTheDocument();
  });

  it("attaches data-pihanga", () => {
    const {container} = renderAvatar({cardName: "app/user"});
    expect(container.querySelector("[data-pihanga='app/user']")).not.toBeNull();
  });

  it.each([
    ["sm", "size-6"],
    ["md", "size-8"],
    ["lg", "size-12"],
    ["xl", "size-16"],
  ] as const)("size %s applies %s class", (size, cls) => {
    const {container} = renderAvatar({size, fallback: "X"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain(cls);
  });

  it("defaults to size md when size not given", () => {
    const {container} = renderAvatar({fallback: "X"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("size-8");
  });

  it("applies extra className", () => {
    const {container} = renderAvatar({fallback: "X", className: "ring-2"});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.className).toContain("ring-2");
  });
});
