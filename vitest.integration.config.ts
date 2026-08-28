import { defineConfig } from "vitest/config";

/**
 * Integration tests run against a real `wrangler pages dev` with a local D1, so they
 * need a node environment, no jsdom, generous timeouts, and a single worker - the
 * tests share one server and one database.
 *
 * Kept separate from vitest.config.ts so `pnpm test` stays fast.
 */
export default defineConfig({
  test: {
    include: ["test/**/*.integration.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 150_000,
    fileParallelism: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
