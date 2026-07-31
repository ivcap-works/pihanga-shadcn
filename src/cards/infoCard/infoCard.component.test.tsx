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

import {InfoCardComponent} from "./infoCard.component";
import type {InfoCardProps} from "./infoCard.types";

function renderIC(props: Partial<InfoCardProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/ic",
    ...props,
  } as unknown as PiCardProps<InfoCardProps>;
  return render(<InfoCardComponent {...full} />);
}

describe("shad/info-card", () => {
  it("renders title + description", () => {
    const {getByText} = renderIC({title: "Users", description: "Active users"});
    expect(getByText("Users")).toBeInTheDocument();
    expect(getByText("Active users")).toBeInTheDocument();
  });

  it("omits header when neither title/description/action given", () => {
    const {container} = renderIC({});
    expect(container.querySelector("[data-slot='card-header']")).toBeNull();
  });

  it("renders action / content / footer child cards", () => {
    const {container} = renderIC({
      title: "T",
      actionCard: "app/action",
      contentCard: "app/content",
      footerCard: "app/footer",
    });
    expect(container.querySelector("[data-child='app/action']")).not.toBeNull();
    expect(
      container.querySelector("[data-child='app/content']"),
    ).not.toBeNull();
    expect(container.querySelector("[data-child='app/footer']")).not.toBeNull();
  });

  it("attaches data-pihanga", () => {
    const {container} = renderIC({cardName: "app/ic", title: "T"});
    expect(container.querySelector("[data-pihanga='app/ic']")).not.toBeNull();
  });
});
