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
import {produce} from "immer";

import {buildDemoModel} from "./swimlane.demo";
import {ingestSwimlaneEvents} from "./swimlane.model";
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

  it("hovering a process also highlights the transitions it creates and receives", () => {
    const {container, onHoverChanged} = renderSwimlane();
    const hit = container.querySelector("[data-kind='activity'][data-id='c3']")!;
    fireEvent.pointerOver(hit);
    const rel = (id: string) =>
      [...container.querySelectorAll(`[data-kind='transition'][data-id='${id}'], [data-kind='pending'][data-id='${id}']`)]
        .map((h) => h.closest("svg")!.querySelector(".swl-ar")!.getAttribute("class")!);
    // own chain: call createOrder (c3) + its outstanding reply → primary highlight
    expect(rel("c3").every((c) => c.includes("swl-hl") && !c.includes("swl-hl-rel"))).toBe(true);
    // children: validate (self), reserve, charge ×2 (incl. error reply), order.created, audit.log
    for (const id of ["c4", "c5", "c6", "c7", "c8", "c9"]) {
      const cls = rel(id);
      expect(cls.length, id).toBeGreaterThan(0);
      expect(cls.every((c) => c.includes("swl-hl-rel")), id).toBe(true);
    }
    // sync children highlight both directions (call + reply)
    expect(rel("c6")).toHaveLength(2);
    // unrelated: verify token belongs to the gateway's handling of c1
    expect(rel("c2").some((c) => /swl-hl/.test(c))).toBe(false);
    expect(onHoverChanged.mock.calls[0][0].related).toEqual(["c4", "c5", "c6", "c7", "c8", "c9"]);
  });

  it("hovering a reply also highlights the receiving process — and only that activity", () => {
    const {container, onHoverChanged} = renderSwimlane();
    // c5 = orders → inventory "reserve items"; its reply is received by orders' createOrder activity (c3)
    const replyHit = [...container.querySelectorAll("[data-kind='transition'][data-id='c5']")].find(
      (h) => h.closest("svg")!.querySelector(".swl-ar-reply"),
    )!;
    fireEvent.pointerOver(replyHit);
    const proc = [...container.querySelectorAll(".swl-act.swl-hl-proc")];
    expect(proc.length).toBeGreaterThan(1);
    const c3Hits = container.querySelectorAll("[data-kind='activity'][data-id='c3']").length;
    // every segment of c3 (the "now" row draws two more, without hit zones), nothing else
    expect(proc).toHaveLength(c3Hits + 2);
    // all highlighted segments sit on the orders lifeline, at c3's stack position
    const xs = new Set(proc.map((g) => g.querySelector("rect")!.getAttribute("x")));
    expect(xs.size).toBe(1);
    // none of the receiving process's other transitions are highlighted
    for (const id of ["c4", "c6", "c7", "c8", "c9"]) {
      const arrows = [...container.querySelectorAll(`[data-kind='transition'][data-id='${id}']`)]
        .map((h) => h.closest("svg")!.querySelector(".swl-ar")!.getAttribute("class")!);
      expect(arrows.some((c) => /swl-hl/.test(c)), id).toBe(false);
    }
    // the hovered call itself stays primary (call + reply)
    expect(container.querySelectorAll(".swl-ar.swl-hl")).toHaveLength(2);
    expect(onHoverChanged.mock.calls[0][0]).toMatchObject({process: "c3"});
  });

  it("hovering an activity does not mark a caller process", () => {
    const {container} = renderSwimlane();
    fireEvent.pointerOver(container.querySelector("[data-kind='activity'][data-id='c3']")!);
    expect(container.querySelectorAll(".swl-hl-proc")).toHaveLength(0);
  });

  it("applies external highlightId", () => {
    const {container} = renderSwimlane({highlightId: "c6"});
    expect(container.querySelectorAll(".swl-ar.swl-hl")).toHaveLength(2); // call + error reply
  });
});

describe("shad/swimlane is driven entirely by props", () => {
  const base = produce({m: buildDemoModel({t0: 0})}, () => undefined).m;
  const widths = (c: HTMLElement) =>
    [...c.querySelectorAll("svg[width]")].map((s) => Number(s.getAttribute("width"))).filter((w) => w > 0);

  it("a new lane in the model extends header and every row horizontally", () => {
    const {container, rerender} = renderSwimlane({model: base});
    const before = widths(container);
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d, [
        {type: "lane", lane: "billing", label: "billing-svc", ts: 99_000},
        {type: "call", kind: "event", id: "b1", from: "orders", to: "billing", label: "invoice", ts: 99_100},
      ]);
    });
    rerender(
      <SwimlaneComponent
        {...({cardName: "test/swimlane", model: next, autoFollow: false, now: 0,
          onHoverChanged: () => undefined, onItemClicked: () => undefined} as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>)}
      />,
    );
    const after = widths(container);
    // every svg (header + all rows) grew by exactly one lane width
    expect(new Set(before)).toEqual(new Set([before[0]]));
    expect(new Set(after)).toEqual(new Set([before[0] + 104]));
    expect([...container.querySelectorAll(".swl-lane-name")].map((n) => n.textContent)).toContain("billing-svc");
    // two new rows were appended; existing rows are kept
    const rows = container.querySelectorAll("svg.swl-row:not(.swl-ghost):not(.swl-now)");
    expect(rows).toHaveLength(base.rows.length + 2);
  });

  it("uses the `now` prop for waiting timers and overdue state", () => {
    const x1 = base.pending.find((p) => p.id === "x1")!;
    const {container, rerender, onHoverChanged, onItemClicked} = renderSwimlane({model: base, now: x1.since + 1000});
    const label = () => container.querySelector("[data-id='x1']")!.closest("svg")!.querySelector(".swl-ts")!;
    expect(label().textContent).toBe("waiting 1.0s");
    expect(label().classList.contains("swl-overdue")).toBe(false);
    rerender(
      <SwimlaneComponent
        {...({cardName: "test/swimlane", model: base, autoFollow: false, now: x1.since + 9000,
          onHoverChanged, onItemClicked} as unknown as PiCardProps<SwimlaneProps, SwimlaneEvents>)}
      />,
    );
    expect(label().textContent).toBe("waiting 9.0s");
    expect(label().classList.contains("swl-overdue")).toBe(true);
  });
});
