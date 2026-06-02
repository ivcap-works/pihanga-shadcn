// ============================================================================
// AUTO-GENERATED — do not edit by hand.
//
// Regenerate with:
//   yarn gen-playground
//   node scripts/gen-playground-registry.mjs
//   make gen-playground
//
// Source: every src/cards/**/*.example.ts that contains a
//         `definePlayground()` default export.
//
// Last generated: 2026-06-02T04:39:49.302Z
// ============================================================================

import type {PlaygroundDef} from "./playground.types";
import badgeDef from "@/cards/badge/badge.example";
import buttonDef from "@/cards/button/button.example";
import dataTableDef from "@/cards/dataTable/dataTable.example";
import dialogDef from "@/cards/dialog/dialog.example";
import dropDownMenuDef from "@/cards/dropDownMenu/drop-down.example";
import formDef from "@/cards/form/form.example";
import inputDef from "@/cards/input/input.example";
import jsonViewerDef from "@/cards/jsonViewer/jsonViewer.example";
import markdownViewerDef from "@/cards/markdownViewer/markdownViewer.example";
import stepperDef from "@/cards/stepper/stepper.example";
import switchDef from "@/cards/switch/switch.example";
import tabsDef from "@/cards/tabs/tabs.example";
import toastDef from "@/cards/toast/toast.example";
import toggleGroupDef from "@/cards/toggleGroup/toggleGroup.example";

/**
 * Static list of all playground definitions discovered at code-generation time.
 *
 * Unlike the dynamic `registry.ts` (populated at runtime via
 * `registerPlaygroundDef()`), this array is resolved at build time and is
 * therefore safe for static-site generation, bundle analysis, and tree-shaking.
 *
 * The playground engine can use either this list or the dynamic registry —
 * see `src/playground/registry.ts` for the runtime alternative.
 */
export const PLAYGROUND_EXAMPLES: PlaygroundDef[] = [
  badgeDef,
  buttonDef,
  dataTableDef,
  dialogDef,
  dropDownMenuDef,
  formDef,
  inputDef,
  jsonViewerDef,
  markdownViewerDef,
  stepperDef,
  switchDef,
  tabsDef,
  toastDef,
  toggleGroupDef,
];
