import {describe, expect, it, vi} from "vitest";

// @pihanga2/core's dist uses extension-less ESM imports that Vitest cannot
// resolve, so stub the few runtime helpers called at import time.
vi.mock("@pihanga2/core", () => ({
  createCardDeclaration: (type: string) => (props: object) => ({...props, cardType: type}),
  registerActions: (ns: string, actions: readonly string[]) =>
    Object.fromEntries(actions.map((a) => [a.toUpperCase(), `${ns}/${a}`])),
  actionTypesToEvents: () => ({}),
  createOnAction: () => () => undefined,
  createOnDispatch: () => () => undefined,
  registerCardComponent: () => undefined,
}));

import {fireEvent, render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {SwimlaneComponent} from "./swimlane.component";
import {buildDemoModel} from "./swimlane.demo";
import type {SwimlaneEvents, SwimlaneProps} from "./swimlane.types";

function renderSwimlane(props: Partial<SwimlaneProps> = {}) {
  const onHoverChanged = vi.fn();
  const onItemClicked = vi.fn();
  const full = {
    cardName: "test/swimlane",
    model: buildDemoModel({t0: 0}),
    autoFollow: false,
    onHoverChanged,
    onItemClicked,
    _cls: (n: string) => n,
    ...props,
  } as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>;
  const r = render(<SwimlaneComponent {...full} />);
  return {...r, onHoverChanged, onItemClicked};
}

describe("shad/swimlane component", () => {
  it("attaches data-pihanga and renders one svg per row plus now + ghost rows", () => {
    const {container} = renderSwimlane();
    expect(container.querySelector("[data-pihanga='test/swimlane']")).not.toBeNull();
    const model = buildDemoModel({t0: 0});
    expect(container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)")).toHaveLength(model.rows.length);
    expect(container.querySelectorAll("svg.swl-ghost")).toHaveLength(model.pending.length);
    expect(container.querySelectorAll("svg.swl-now")).toHaveLength(1);
  });

  it("renders vertical lane names in the header", () => {
    const {container} = renderSwimlane();
    const names = [...container.querySelectorAll(".swl-lane-name")];
    expect(names.map((n) => n.textContent)).toContain("api-gateway");
    expect(names[0].getAttribute("transform")).toMatch(/^rotate\(-90/);
  });

  it("hides the outstanding zone when showPending=false", () => {
    const {container} = renderSwimlane({showPending: false});
    expect(container.querySelectorAll("svg.swl-ghost, svg.swl-now")).toHaveLength(0);
  });

  it("emits hover enter once per target and leave on exit; highlights the chain", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const hits = container.querySelectorAll("[data-kind='activity'][data-id='c3']");
    expect(hits.length).toBeGreaterThan(1);
    fireEvent.pointerOver(hits[0]);
    // moving to the same activity in the next row is not a change
    fireEvent.pointerOut(hits[0], {relatedTarget: hits[1]});
    fireEvent.pointerOver(hits[1]);
    expect(onHoverChanged).toHaveBeenCalledTimes(1);
    expect(onHoverChanged.mock.calls[0][0]).toMatchObject({
      target: {kind: "activity", id: "c3", lane: "orders"},
      previous: null,
      span: {from: "gateway", to: "orders", label: "createOrder"},
    });
    expect(container.querySelectorAll(".swl-ar.swl-hl").length).toBeGreaterThan(0);
    fireEvent.pointerOut(hits[1], {relatedTarget: container});
    expect(onHoverChanged).toHaveBeenCalledTimes(2);
    expect(onHoverChanged.mock.calls[1][0]).toMatchObject({target: null, previous: {id: "c3"}});
  });

  it("emits item clicked with pending details for ghost rows", () => {
    const {container, onItemClicked} = renderSwimlane();
    const ghost = container.querySelector("[data-kind='pending'][data-id='x1']")!;
    fireEvent.click(ghost);
    expect(onItemClicked).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({kind: "pending", id: "x1"}),
        pending: expect.objectContaining({from: "notifier", to: "orders", type: "expect"}),
      }),
    );
  });

  it("applies external highlightId", () => {
    const {container} = renderSwimlane({highlightId: "c6"});
    expect(container.querySelectorAll(".swl-ar.swl-hl")).toHaveLength(2); // call + error reply
  });
});
