import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    setupFiles: [],
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
