import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = __dirname;
const ragRoot = path.join(projectRoot, "rag-chat");

/** 로컬 dev에서 `/assets/data/graph-data.json` 요청을 리포지터리 파일로 연결 */
function graphDataDevPlugin(): Plugin {
  return {
    name: "serve-graph-data-json",
    configureServer(server) {
      server.middlewares.use("/assets/data/graph-data.json", (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        try {
          const filePath = path.join(projectRoot, "assets/data/graph-data.json");
          const body = fs.readFileSync(filePath);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.statusCode = 200;
          res.end(body);
        } catch {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ nodes: [], links: [] }));
        }
      });
    },
  };
}

export default defineConfig({
  root: ragRoot,
  plugins: [react(), graphDataDevPlugin()],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  optimizeDeps: {
    exclude: ["@xenova/transformers"],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: path.join(projectRoot, "assets/js/rag"),
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      input: path.join(ragRoot, "main.tsx"),
      output: {
        entryFileNames: "embed.js",
        assetFileNames: "rag-chat.[ext]",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
});
