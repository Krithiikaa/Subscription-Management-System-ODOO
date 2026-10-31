import { defineConfig } from "vitest/config";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.spec.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
