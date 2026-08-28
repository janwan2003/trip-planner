import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Vendored shadcn/ui components and the entrypoint are excluded: they are
      // third-party code we do not author, and coverage of them would be noise
      // that hides how well our own logic is tested.
      include: ["src/lib/**", "src/components/**", "src/pages/**"],
      exclude: ["src/components/ui/**", "src/test/**", "src/main.tsx", "src/vite-env.d.ts"],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
