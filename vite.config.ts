import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  optimizeDeps: {
    exclude: ["@xenova/transformers"],
  },
  build: {
    outDir: "assets/js/rag",
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      input: path.resolve(__dirname, "rag-chat/main.tsx"),
      output: {
        entryFileNames: "embed.js",
        assetFileNames: "rag-chat.[ext]",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
});
