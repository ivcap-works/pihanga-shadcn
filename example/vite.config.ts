import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // @/lib  →  src/lib  (shared utilities)
      {find: "@/lib", replacement: path.resolve(__dirname, "./src/lib")},
      // @/registry  →  src/components  (shadcn UI primitives used by cards)
      {
        find: "@/registry",
        replacement: path.resolve(__dirname, "./src/components"),
      },
      // @/components  →  src/components
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "./src/components"),
      },
      // @/cards  →  src/cards  (card-to-card imports, if any local cards)
      {find: "@/cards", replacement: path.resolve(__dirname, "./src/cards")},
      // @  →  src  (catch-all)
      {find: "@", replacement: path.resolve(__dirname, "./src")},
    ],
    // Ensure React and Redux are not duplicated across packages.
    dedupe: ["react", "react-dom", "react-redux"],
  },
  optimizeDeps: {
    // Exclude @pihanga2/core AND @pihanga2/shadcn from Vite's esbuild
    // pre-bundler.  Both packages use a shared module-level card registry
    // (pendingRegistrations / registerF / cardTypes in register_cards.js).
    // If either package is pre-bundled by esbuild, @pihanga2/core may be
    // inlined into a separate chunk, creating two registry instances and
    // causing "Unknown card 'app/main'" errors at runtime.
    //
    // By excluding both, Vite serves them as raw ES modules.  The browser's
    // module cache deduplicates by URL, so all imports share one instance.
    //
    // CJS packages used transitively by @pihanga2/core must be listed in
    // `include` so Vite can still convert them to ESM for the browser.
    exclude: ["@pihanga2/core", "@pihanga2/shadcn"],
    include: [
      "deep-equal",
      "stacktrace-js",
      "react-dom/client",
      "lucide-react",
    ],
  },
});
