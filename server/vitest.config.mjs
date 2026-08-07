import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 120000,
    // Integration tests share one mongoose connection to an in-memory Mongo,
    // so test files must not run in parallel workers.
    fileParallelism: false,
  },
});
