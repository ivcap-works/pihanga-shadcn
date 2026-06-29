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
// Last generated: 2026-06-28T23:30:42.806Z
// ============================================================================

import type {PlaygroundDef} from "./playground.types";
import badgeDef from "@/cards/badge/badge.example";
import boxDef from "@/cards/box/box.example";
import buttonDef from "@/cards/button/button.example";
import checkboxDef from "@/cards/checkbox/checkbox.example";
import conditionalDef from "@/cards/conditional/conditional.example";
import dataTableDef from "@/cards/dataTable/dataTable.example";
import dialogDef from "@/cards/dialog/dialog.example";
import dropDownMenuDef from "@/cards/dropDownMenu/drop-down.example";
import fieldDef from "@/cards/field/field.example";
import fileDropDef from "@/cards/fileDrop/fileDrop.example";
import flexGridDef from "@/cards/flexGrid/flexGrid.example";
import formDef from "@/cards/form/form.example";
import graphinDef from "@/cards/graphin/graphin.example";
import inputDef from "@/cards/input/input.example";
import jsonViewerDef from "@/cards/jsonViewer/jsonViewer.example";
import listDef from "@/cards/list/list.example";
import loadingOverlayDef from "@/cards/loadingOverlay/loadingOverlay.example";
import loadingSkeletonDef from "@/cards/loadingSkeleton/loading-skeleton.example";
import markdownViewerDef from "@/cards/markdownViewer/markdownViewer.example";
import menuDef from "@/cards/menu/menu.example";
import modeToggleDef from "@/cards/modeToggle/modeToggle.example";
import navbarSearchDef from "@/cards/navbarSearch/navbarSearch.example";
import pageWithNavbarDef from "@/cards/pageWithNavbar/pageWithNavbar.example";
import pasteTargetDef from "@/cards/pasteTarget/pasteTarget.example";
import resizableDef from "@/cards/resizable/resizable.example";
import selectDef from "@/cards/select/select.example";
import sliderDef from "@/cards/slider/slider.example";
import sliderValueDef from "@/cards/sliderValue/sliderValue.example";
import stackDef from "@/cards/stack/stack.example";
import stepperDef from "@/cards/stepper/stepper.example";
import switchDef from "@/cards/switch/switch.example";
import tabsDef from "@/cards/tabs/tabs.example";
import textFieldDef from "@/cards/textField/textField.example";
import toastDef from "@/cards/toast/toast.example";
import toggleGroupDef from "@/cards/toggleGroup/toggleGroup.example";
import typographyDef from "@/cards/typography/typography.example";

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
  boxDef,
  buttonDef,
  checkboxDef,
  conditionalDef,
  dataTableDef,
  dialogDef,
  dropDownMenuDef,
  fieldDef,
  fileDropDef,
  flexGridDef,
  formDef,
  graphinDef,
  inputDef,
  jsonViewerDef,
  listDef,
  loadingOverlayDef,
  loadingSkeletonDef,
  markdownViewerDef,
  menuDef,
  modeToggleDef,
  navbarSearchDef,
  pageWithNavbarDef,
  pasteTargetDef,
  resizableDef,
  selectDef,
  sliderDef,
  sliderValueDef,
  stackDef,
  stepperDef,
  switchDef,
  tabsDef,
  textFieldDef,
  toastDef,
  toggleGroupDef,
  typographyDef,
];
