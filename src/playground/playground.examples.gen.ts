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
// README injection: when a card folder contains a README.md, its content is
// imported with Vite's `?raw` suffix and merged into the definition as the
// `introduction` field (overriding any inline value in the example file).
//
// Last generated: 2026-07-26T06:07:38.700Z
// ============================================================================

import type {PlaygroundDef} from "./playground.types";
import avatarDef from "@/cards/avatar/avatar.example";
import badgeDef from "@/cards/badge/badge.example";
import boxDef from "@/cards/box/box.example";
import buttonDef from "@/cards/button/button.example";
import chartDef from "@/cards/chart/chart.example";
import checkboxDef from "@/cards/checkbox/checkbox.example";
import codeMirrorDef from "@/cards/codeMirror/codeMirror.example";
import collapsibleCardDef from "@/cards/collapsibleCard/collapsibleCard.example";
import conditionalDef from "@/cards/conditional/conditional.example";
import dataTableDef from "@/cards/dataTable/dataTable.example";
import dialogDef from "@/cards/dialog/dialog.example";
import drawerDef from "@/cards/drawer/drawer.example";
import dropDownMenuDef from "@/cards/dropDownMenu/drop-down.example";
import emptyCardDef from "@/cards/emptyCard/emptyCard.example";
import fieldDef from "@/cards/field/field.example";
import fileDropDef from "@/cards/fileDrop/fileDrop.example";
import flexGridDef from "@/cards/flexGrid/flexGrid.example";
import formDef from "@/cards/form/form.example";
import graphinDef from "@/cards/graphin/graphin.example";
import infoCardDef from "@/cards/infoCard/infoCard.example";
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
import pageWithNavbarMetaDef from "@/cards/pageWithNavbarMeta/pageWithNavbarMeta.example";
import pasteTargetDef from "@/cards/pasteTarget/pasteTarget.example";
import resizableDef from "@/cards/resizable/resizable.example";
import scrollbarWithAnnotationsDef from "@/cards/scrollbarWithAnnotations/scrollbarWithAnnotations.example";
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

import avatarReadme from "@/cards/avatar/README.md?raw";
import badgeReadme from "@/cards/badge/README.md?raw";
import boxReadme from "@/cards/box/README.md?raw";
import buttonReadme from "@/cards/button/README.md?raw";
import chartReadme from "@/cards/chart/README.md?raw";
import checkboxReadme from "@/cards/checkbox/README.md?raw";
import codeMirrorReadme from "@/cards/codeMirror/README.md?raw";
import collapsibleCardReadme from "@/cards/collapsibleCard/README.md?raw";
import conditionalReadme from "@/cards/conditional/README.md?raw";
import dataTableReadme from "@/cards/dataTable/README.md?raw";
import dialogReadme from "@/cards/dialog/README.md?raw";
import drawerReadme from "@/cards/drawer/README.md?raw";
import dropDownMenuReadme from "@/cards/dropDownMenu/README.md?raw";
import emptyCardReadme from "@/cards/emptyCard/README.md?raw";
import fieldReadme from "@/cards/field/README.md?raw";
import fileDropReadme from "@/cards/fileDrop/README.md?raw";
import flexGridReadme from "@/cards/flexGrid/README.md?raw";
import formReadme from "@/cards/form/README.md?raw";
import graphinReadme from "@/cards/graphin/README.md?raw";
import infoCardReadme from "@/cards/infoCard/README.md?raw";
import inputReadme from "@/cards/input/README.md?raw";
import jsonViewerReadme from "@/cards/jsonViewer/README.md?raw";
import listReadme from "@/cards/list/README.md?raw";
import loadingOverlayReadme from "@/cards/loadingOverlay/README.md?raw";
import loadingSkeletonReadme from "@/cards/loadingSkeleton/README.md?raw";
import markdownViewerReadme from "@/cards/markdownViewer/README.md?raw";
import menuReadme from "@/cards/menu/README.md?raw";
import modeToggleReadme from "@/cards/modeToggle/README.md?raw";
import navbarSearchReadme from "@/cards/navbarSearch/README.md?raw";
import pageWithNavbarReadme from "@/cards/pageWithNavbar/README.md?raw";
import pageWithNavbarMetaReadme from "@/cards/pageWithNavbarMeta/README.md?raw";
import pasteTargetReadme from "@/cards/pasteTarget/README.md?raw";
import resizableReadme from "@/cards/resizable/README.md?raw";
import scrollbarWithAnnotationsReadme from "@/cards/scrollbarWithAnnotations/README.md?raw";
import selectReadme from "@/cards/select/README.md?raw";
import sliderReadme from "@/cards/slider/README.md?raw";
import sliderValueReadme from "@/cards/sliderValue/README.md?raw";
import stackReadme from "@/cards/stack/README.md?raw";
import stepperReadme from "@/cards/stepper/README.md?raw";
import switchReadme from "@/cards/switch/README.md?raw";
import tabsReadme from "@/cards/tabs/README.md?raw";
import textFieldReadme from "@/cards/textField/README.md?raw";
import toastReadme from "@/cards/toast/README.md?raw";
import toggleGroupReadme from "@/cards/toggleGroup/README.md?raw";
import typographyReadme from "@/cards/typography/README.md?raw";
/**
 * Static list of all playground definitions discovered at code-generation time.
 *
 * Unlike the dynamic `registry.ts` (populated at runtime via
 * `registerPlaygroundDef()`), this array is resolved at build time and is
 * therefore safe for static-site generation, bundle analysis, and tree-shaking.
 *
 * The playground engine can use either this list or the dynamic registry —
 * see `src/playground/registry.ts` for the runtime alternative.
 *
 * Cards that ship a `README.md` alongside their `*.example.ts` have their
 * README content injected automatically as the `introduction` field.
 */
export const PLAYGROUND_EXAMPLES: PlaygroundDef[] = [
  {...avatarDef, introduction: avatarReadme},
  {...badgeDef, introduction: badgeReadme},
  {...boxDef, introduction: boxReadme},
  {...buttonDef, introduction: buttonReadme},
  {...chartDef, introduction: chartReadme},
  {...checkboxDef, introduction: checkboxReadme},
  {...codeMirrorDef, introduction: codeMirrorReadme},
  {...collapsibleCardDef, introduction: collapsibleCardReadme},
  {...conditionalDef, introduction: conditionalReadme},
  {...dataTableDef, introduction: dataTableReadme},
  {...dialogDef, introduction: dialogReadme},
  {...drawerDef, introduction: drawerReadme},
  {...dropDownMenuDef, introduction: dropDownMenuReadme},
  {...emptyCardDef, introduction: emptyCardReadme},
  {...fieldDef, introduction: fieldReadme},
  {...fileDropDef, introduction: fileDropReadme},
  {...flexGridDef, introduction: flexGridReadme},
  {...formDef, introduction: formReadme},
  {...graphinDef, introduction: graphinReadme},
  {...infoCardDef, introduction: infoCardReadme},
  {...inputDef, introduction: inputReadme},
  {...jsonViewerDef, introduction: jsonViewerReadme},
  {...listDef, introduction: listReadme},
  {...loadingOverlayDef, introduction: loadingOverlayReadme},
  {...loadingSkeletonDef, introduction: loadingSkeletonReadme},
  {...markdownViewerDef, introduction: markdownViewerReadme},
  {...menuDef, introduction: menuReadme},
  {...modeToggleDef, introduction: modeToggleReadme},
  {...navbarSearchDef, introduction: navbarSearchReadme},
  {...pageWithNavbarDef, introduction: pageWithNavbarReadme},
  {...pageWithNavbarMetaDef, introduction: pageWithNavbarMetaReadme},
  {...pasteTargetDef, introduction: pasteTargetReadme},
  {...resizableDef, introduction: resizableReadme},
  {
    ...scrollbarWithAnnotationsDef,
    introduction: scrollbarWithAnnotationsReadme,
  },
  {...selectDef, introduction: selectReadme},
  {...sliderDef, introduction: sliderReadme},
  {...sliderValueDef, introduction: sliderValueReadme},
  {...stackDef, introduction: stackReadme},
  {...stepperDef, introduction: stepperReadme},
  {...switchDef, introduction: switchReadme},
  {...tabsDef, introduction: tabsReadme},
  {...textFieldDef, introduction: textFieldReadme},
  {...toastDef, introduction: toastReadme},
  {...toggleGroupDef, introduction: toggleGroupReadme},
  {...typographyDef, introduction: typographyReadme},
];
