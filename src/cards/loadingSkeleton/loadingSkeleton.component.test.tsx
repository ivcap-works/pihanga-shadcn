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

import {LoadingSkeletonComponent} from "./loading-skeleton.component";
import type {LoadingSkeletonProps} from "./loading-skeleton.types";

function renderLS(
  props: Partial<LoadingSkeletonProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/skel",
    loading: false,
    ...props,
  } as unknown as PiCardProps<LoadingSkeletonProps>;
  return render(<LoadingSkeletonComponent {...full} />);
}

describe("shad/loading-skeleton", () => {
  it("renders N shimmer rows when loading=true (default 3)", () => {
    const {container} = renderLS({loading: true});
    const rows = container.querySelectorAll(".animate-pulse");
    expect(rows).toHaveLength(3);
  });

  it("honours the `rows` prop", () => {
    const {container} = renderLS({loading: true, rows: 5});
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
  });

  it("applies rowSize height class (default md=h-10)", () => {
    const {container} = renderLS({loading: true, rows: 1});
    const row = container.querySelector(".animate-pulse") as HTMLElement;
    expect(row.className).toContain("h-10");
  });

  it("rowClassName overrides rowSize preset", () => {
    const {container} = renderLS({
      loading: true,
      rows: 1,
      rowClassName: "custom-row",
    });
    const row = container.querySelector(".animate-pulse") as HTMLElement;
    expect(row.className).toContain("custom-row");
    expect(row.className).not.toContain("h-10");
  });

  it("passes through content when not loading (no wrapper)", () => {
    const {container} = renderLS({loading: false, content: "app/data"});
    expect(container.querySelector("[data-child='app/data']")).not.toBeNull();
    expect(container.querySelector("[data-pihanga]")).toBeNull();
  });

  it("returns null when loading=false and no content", () => {
    const {container} = renderLS({loading: false});
    expect(container.firstChild).toBeNull();
  });
});
