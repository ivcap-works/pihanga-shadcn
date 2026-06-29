/**
 * Ambient CSS module declaration for the library build.
 *
 * `src/vite-env.d.ts` (which provides CSS module types via
 * `/// <reference types="vite/client" />`) is intentionally excluded from
 * the library DTS build to avoid shipping Vite-specific types.
 *
 * This file provides the minimal `declare module '*.css'` needed to satisfy
 * TypeScript's `noUncheckedSideEffectImports` for card components that use
 * CSS side-effect imports (e.g. `import "./component.css"`).
 */
declare module "*.css" {
  const stylesheet: string;
  export default stylesheet;
}
