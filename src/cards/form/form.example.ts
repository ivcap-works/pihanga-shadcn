/**
 * Usage examples for the Form card system.
 *
 * This file shows how to wire up Form, TextField, Checkbox, and FormSelect
 * cards declaratively inside an app.pihanga.ts (or any pihanga init file).
 *
 * ---
 * ## Example 1 — Login form (fields bound to form state via `name`)
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {
 *   Form, TextField, Checkbox, FormSelect, onPiFormSubmitted,
 * } from "@/cards/form";
 *
 * registerCard("myForm/email",    TextField({ name: "email",    label: "Email",    type: "email"    }));
 * registerCard("myForm/password", TextField({ name: "password", label: "Password", type: "password" }));
 * registerCard("myForm/remember", Checkbox({  name: "remember", label: "Remember me"                }));
 *
 * registerCard("myForm", Form({
 *   children:      ["myForm/email", "myForm/password", "myForm/remember"],
 *   initialValues: { email: "", password: "", remember: false },
 *   submitLabel:   "Log in",
 * }));
 *
 * // React to submission from a reducer / effect:
 * onPiFormSubmitted((state, action) => {
 *   const { formData } = action; // { email, password, remember }
 *   // …send to API, update state, etc.
 *   return state;
 * });
 * ```
 *
 * ---
 * ## Example 2 — Form with a select field
 *
 * ```ts
 * registerCard("prefForm/theme", FormSelect({
 *   name:    "theme",
 *   label:   "Theme",
 *   options: [
 *     { value: "light", label: "Light" },
 *     { value: "dark",  label: "Dark"  },
 *   ],
 *   placeholder: "Pick a theme…",
 * }));
 *
 * registerCard("prefForm", Form({
 *   children:    ["prefForm/theme"],
 *   submitLabel: "Save",
 * }));
 * ```
 *
 * ---
 * ## Example 3 — Standalone TextField (no Form wrapper)
 *
 * When used *outside* a Form card the component falls back to pure Pihanga
 * event dispatch: changes fire the `pi/form/text-field/changed` action, which
 * you can handle with `onPiTextFieldChanged`.
 *
 * ```ts
 * import {registerCard, onPiTextFieldChanged} from "@/cards/form";
 *
 * registerCard("searchBar", TextField({
 *   label:       "Search",
 *   value:       "",          // supplied from state via a selector
 *   placeholder: "Type to search…",
 * }));
 *
 * onPiTextFieldChanged((state, { value }) => ({
 *   ...state,
 *   searchQuery: value,
 * }));
 * ```
 *
 * ---
 * ## Data-flow summary
 *
 * | Scenario                        | Value source         | Change handler              |
 * |---------------------------------|----------------------|-----------------------------|
 * | `name` set + inside Form        | `form.formData[name]`| `form.handleChange(name, v)`|
 * | `name` missing OR outside Form  | `props.value`        | Pihanga `onChanged` action  |
 */

export {};
