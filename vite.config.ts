import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { spaDocumentFallback } from "./vite.spa-fallback";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Explicit SPA mode so Vite dev + `vite preview` rewrite unknown paths
  // (e.g. /jobs/:id) to index.html instead of treating them as server routes.
  appType: "spa",
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "::",
    port: 8080,
  },
  // Pre-middleware rewrite + dist/404.html copy. Must stay first so a host
  // that injects prerender/SSR plugins cannot evaluate /jobs/:id first.
  plugins: [spaDocumentFallback(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
