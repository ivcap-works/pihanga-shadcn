import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {find: "@/lib", replacement: path.resolve(__dirname, "./src/lib")},
      {find: "@", replacement: path.resolve(__dirname, "./src")},
    ],
    // Deduplicate React when using yarn-linked local packages (prevents
    // "multiple React instances" errors from the symlinked @pihanga2/core)
    dedupe: ["react", "react-dom", "react-redux"],
  },
  optimizeDeps: {
    // Exclude yarn-linked packages from pre-bundling so Vite detects
    // changes made in the source (after a `build:watch` in core) immediately
    exclude: ["@pihanga2/core"],
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test/**", "src/vite-env.d.ts"],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
