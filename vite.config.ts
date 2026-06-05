import path from "path";
import {readFileSync} from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, type Plugin} from "vitest/config";

// ---------------------------------------------------------------------------
// Inline plugin: serve project-root files in dev + emit them during build.
//
// Usage: add rootFilePlugin(["AGENTS.md", "other.txt"]) to the plugins array.
//
// - Dev server: intercepts GET /<filename> and reads the file from the
//   project root (avoiding a stale copy in public/).
// - Build: uses Rollup's `emitFile` to copy the file to dist/.
// ---------------------------------------------------------------------------
function rootFilePlugin(filenames: string[]): Plugin {
  return {
    name: "root-file-serve",

    // Dev server — serve each file directly from the project root.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = filenames.find((f) => req.url === `/${f}`);
        if (name) {
          const content = readFileSync(path.resolve(__dirname, name), "utf-8");
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(content);
          return;
        }
        next();
      });
    },

    // Production build — emit each file as a static asset into dist/.
    generateBundle() {
      for (const name of filenames) {
        const source = readFileSync(path.resolve(__dirname, name), "utf-8");
        this.emitFile({type: "asset", fileName: name, source});
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), rootFilePlugin(["AGENTS.md"])],
  resolve: {
    alias: [
      {find: "@/lib", replacement: path.resolve(__dirname, "./src/lib")},
      {
        find: "@/registry",
        replacement: path.resolve(__dirname, "./src/components"),
      },
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
