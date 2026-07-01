import type {ReduxAction, ReplyAction} from "@pihanga2/core";

type WindowWithBuildInfo = Window & {buildInfo?: BuildInfoT};
export const BUILD_INFO: BuildInfoT = (window as WindowWithBuildInfo)
  .buildInfo || {
  version: "???",
  commit: "...",
};

export type BuildInfoT = {
  version: string;
  commit: string;
  buildTime?: string; // ISO
};

export type ErrorEvent = {
  message: string;
  source: string;
  cause: unknown;
  requestAction: ReduxAction;
};

export type ErrorAction = ReplyAction & ErrorEvent;
