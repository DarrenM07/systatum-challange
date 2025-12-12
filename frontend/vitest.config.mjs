import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
    coverage: {
      reporter: ["text", "html"],
      lines: 100,
      statements: 100,
      branches: 100,
      functions: 100,
    },
  },
});
