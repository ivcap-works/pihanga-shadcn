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

import {produce} from "immer";

import {
  clearSwimlaneRows,
  createSwimlaneModel,
  describeSwimlaneTarget,
  ingestSwimlaneEvents,
  projectPending,
} from "./swimlane.model";
import {buildDemoModel} from "./swimlane.demo";
import type {SwimlaneModel} from "./swimlane.types";

describe("swimlane model", () => {
  it("adds lanes implicitly and opens an activity + expected reply for sync calls", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [{type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1}]);
    expect(m.laneOrder).toEqual(["a", "b"]);
    expect(m.rows.map((r) => r.event.type)).toEqual(["lane", "lane", "call"]);
    expect(m.current.b.acts).toEqual(["c1"]);
    expect(m.pending).toEqual([
      expect.objectContaining({id: "c1", type: "reply", from: "b", to: "a", since: 1}),
    ]);
    const last = m.rows[2];
    expect(last.pre.b.acts).toEqual([]);
    expect(last.post.b.acts).toEqual(["c1"]);
  });

  it("a reply closes the activity, fulfils the pending reply and records the route", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1},
      {type: "reply", id: "c1", ok: false, label: "500", ts: 5},
    ]);
    const r = m.rows[m.rows.length - 1];
    expect(r.fulfilled).toBe("c1");
    expect(r.route).toEqual({from: "a", to: "b", label: "hi"});
    expect(m.pending).toHaveLength(0);
    expect(m.current.b.acts).toEqual([]);
    expect(m.spans.c1).toMatchObject({status: "error", end: 5, result: "500"});
  });

  it("expect events create no row and are fulfilled by `fulfils`", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"},
      {type: "lane", lane: "b"},
      {type: "expect", id: "x", from: "b", to: "a", label: "callback"},
    ]);
    expect(m.rows).toHaveLength(2);
    expect(m.pending[0]).toMatchObject({id: "x", type: "expect"});
    ingestSwimlaneEvents(m, [
      {type: "call", kind: "event", id: "e1", from: "b", to: "a", label: "callback", fulfils: "x"},
    ]);
    expect(m.pending).toHaveLength(0);
    expect(m.rows[2].fulfilled).toBe("x");
  });

  it("ignores replies to unknown calls and duplicate lane events", () => {
    const m = createSwimlaneModel();
    ingestSwimlaneEvents(m, [
      {type: "lane", lane: "a"},
      {type: "lane", lane: "a", label: "Alpha"},
      {type: "reply", id: "nope", ok: true, label: "?"},
    ]);
    expect(m.rows).toHaveLength(1);
    expect(m.laneLabels.a).toBe("Alpha");
  });

  it("trims to maxRows and garbage-collects spans", () => {
    const m = createSwimlaneModel({maxRows: 10});
    const evs = [];
    for (let i = 0; i < 200; i++) {
      evs.push({type: "call" as const, kind: "event" as const, id: `e${i}`, from: "a", to: "b", label: "x"});
    }
    ingestSwimlaneEvents(m, evs);
    expect(m.rows.length).toBeLessThanOrEqual(10 + 50);
    expect(Object.keys(m.spans).length).toBeLessThanOrEqual(m.rows.length);
    expect(m.rows[m.rows.length - 1].event).toMatchObject({id: "e199"});
  });

  it("works on an Immer draft and produces a serialisable, unshared tree", () => {
    const base = {swimlane: createSwimlaneModel()};
    const next = produce(base, (d) => {
      ingestSwimlaneEvents(d.swimlane, [
        {type: "call", kind: "sync", id: "c1", from: "a", to: "b", label: "hi", ts: 1},
      ]);
    });
    const m: SwimlaneModel = next.swimlane;
    expect(Object.isFrozen(m)).toBe(true);
    expect(m.rows[2].post).not.toBe(m.current);
    expect(JSON.parse(JSON.stringify(m))).toEqual(m);
    // later update must not change earlier rows
    const next2 = produce(next, (d) => {
      ingestSwimlaneEvents(d.swimlane, [{type: "reply", id: "c1", ok: true, label: "ok", ts: 2}]);
    });
    expect(next2.swimlane.rows[2]).toBe(m.rows[2]);
    expect(next2.swimlane.current.b.acts).toEqual([]);
  });

  it("projects pending replies newest first and closes activities in the projection", () => {
    const m = buildDemoModel({t0: 0});
    const ghosts = projectPending(m.current, m.pending);
    expect(ghosts.map((g) => g.pending.id)).toEqual(["c10", "x1", "c3", "c1"]);
    const c10 = ghosts[0];
    expect(c10.pre.notifier.acts).toContain("c10");
    expect(c10.post.notifier.acts).not.toContain("c10");
    // projection must not mutate the model
    expect(m.current.notifier.acts).toContain("c10");
  });

  it("completed demo leaves nothing outstanding", () => {
    const m = buildDemoModel({t0: 0, complete: true});
    expect(m.pending).toHaveLength(0);
    expect(Object.values(m.current).every((l) => l.acts.length === 0)).toBe(true);
  });

  it("clearSwimlaneRows keeps lanes and outstanding messages", () => {
    const m = buildDemoModel({t0: 0});
    clearSwimlaneRows(m);
    expect(m.rows).toHaveLength(0);
    expect(m.laneOrder.length).toBeGreaterThan(0);
    expect(m.pending.length).toBeGreaterThan(0);
  });

  it("describes targets", () => {
    const m = buildDemoModel({t0: 0});
    expect(describeSwimlaneTarget(m, {kind: "transition", id: "c6"}, 0)).toContain("402 declined");
    expect(describeSwimlaneTarget(m, {kind: "pending", id: "x1"}, 100_000)).toContain("OVERDUE");
  });
});
