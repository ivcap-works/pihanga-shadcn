/**
 * Deterministic demo event scripts for the playground and tests.
 * (No randomness: every run produces the same diagram.)
 */
import {createSwimlaneModel, ingestSwimlaneEvents} from "./swimlane.model";
import type {SwimlaneEvent, SwimlaneModel} from "./swimlane.types";

/**
 * A checkout flow through a small microservice deployment, stopped while
 * several replies and one announced callback are still outstanding.
 */
export function demoEvents(t0: number, opts: {complete?: boolean} = {}): SwimlaneEvent[] {
  let t = t0;
  const at = <E extends SwimlaneEvent>(e: E, dt = 350): E => ({...e, ts: (t += dt)});
  const ev: SwimlaneEvent[] = [
    at({type: "lane", lane: "client"}),
    at({type: "lane", lane: "gateway", label: "api-gateway"}),
    at({type: "state", lane: "gateway", state: "running"}),
    at({type: "call", kind: "sync", id: "c1", from: "client", to: "gateway", label: "POST /checkout"}),
    at({type: "call", kind: "sync", id: "c2", from: "gateway", to: "auth", label: "verify token", timeoutMs: 1500}),
    at({type: "state", lane: "auth", state: "running"}),
    at({type: "reply", id: "c2", ok: true, label: "200 OK"}),
    at({type: "call", kind: "sync", id: "c3", from: "gateway", to: "orders", label: "createOrder"}),
    at({type: "state", lane: "orders", state: "running"}),
    at({type: "call", kind: "sync", id: "c4", from: "orders", to: "orders", label: "validate"}),
    at({type: "reply", id: "c4", ok: true, label: "ok"}),
    at({type: "call", kind: "sync", id: "c5", from: "orders", to: "inventory", label: "reserve items"}),
    at({type: "state", lane: "inventory", state: "degraded"}),
    at({type: "reply", id: "c5", ok: true, label: "200 OK"}),
    at({type: "state", lane: "inventory", state: "running"}),
    at({type: "call", kind: "sync", id: "c6", from: "orders", to: "payments", label: "charge card", timeoutMs: 1200}),
    at({type: "reply", id: "c6", ok: false, label: "402 declined"}),
    at({type: "call", kind: "sync", id: "c7", from: "orders", to: "payments", label: "charge card (retry)", timeoutMs: 1200}),
    at({type: "reply", id: "c7", ok: true, label: "200 OK"}),
    at({type: "call", kind: "async", id: "c8", from: "orders", to: "notifier", label: "order.created"}),
    // we KNOW notifier will call back later
    at({type: "expect", id: "x1", from: "notifier", to: "orders", label: "email.sent", timeoutMs: 8000}, 0),
    at({type: "call", kind: "event", id: "c9", from: "orders", to: "audit", label: "audit.log"}),
    at({type: "state", lane: "audit", state: "stopped"}),
    at({type: "call", kind: "sync", id: "c10", from: "notifier", to: "notifier", label: "render email"}),
  ];
  if (opts.complete) {
    ev.push(
      at({type: "reply", id: "c10", ok: true, label: "ok"}),
      at({type: "call", kind: "event", id: "c11", from: "notifier", to: "orders", label: "email.sent", fulfils: "x1"}),
      at({type: "done", id: "c8"}),
      at({type: "reply", id: "c3", ok: true, label: "200 OK"}),
      at({type: "reply", id: "c1", ok: true, label: "201 Created"}),
      at({type: "state", lane: "audit", state: "starting"}),
      at({type: "state", lane: "audit", state: "running"}),
    );
  }
  return ev;
}

export function buildDemoModel(opts: {complete?: boolean; t0?: number} = {}): SwimlaneModel {
  const events = demoEvents(opts.t0 ?? Date.now() - 12_000, opts);
  const m = createSwimlaneModel();
  ingestSwimlaneEvents(m, events);
  return m;
}
