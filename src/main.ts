import "./index.css";
import {isPlain} from "@reduxjs/toolkit";
import {start, DEFAULT_REDUX_STATE} from "@pihanga2/core";

import type {AppState} from "@/app.state";
import {RootComponent} from "@/app.root";
import {appPiInit} from "./app.pihanga";
// // import Tracker from "@openreplay/tracker"

const inits = [appPiInit];

// if (import.meta.env.DEV) {
//   const { debugInit } = await import("./app.debug")
//   inits.push(debugInit)

//   //const Tracker = await import("@openreplay/tracker")
//   // const tracker = new Tracker({
//   //   projectID: 9581,
//   //   projectKey: "mSSyHB0sxh2i1rSBn4ca",
//   //   // ingestPoint: "http://localhost:5173/ingest",
//   //   capturePerformance: true,
//   //   //__DISABLE_SECURE_MODE: true, // for local testing
//   // })
//   // inits.push(() => tracker.start())
// }

const initState: AppState = {
  ...DEFAULT_REDUX_STATE,
};

start(initState, inits, {
  disableSerializableStateCheck: true,
  isSerializable: (v) => isPlain(v) || v instanceof Date,
  rootComponent: RootComponent,
});
