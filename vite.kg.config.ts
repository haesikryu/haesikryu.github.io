import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "assets/js/kg",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "kg-graph/main.ts"),
      output: {
        entryFileNames: "kg-graph.js",
        format: "es",
      },
    },
  },
});
