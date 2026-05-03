import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    env: {
      VITE_GRAPH_API_BASE: "http://localhost:3000",
      VITE_TENANT_ID: "1",
      VITE_BLUEPRINT_ID: "bp_test",
    },
  },
});
