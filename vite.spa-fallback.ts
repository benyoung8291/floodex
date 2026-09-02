import fs from "fs";
import path from "path";
import type { Connect, PreviewServer, ViteDevServer } from "vite";

/**
 * Lovable preview (and some static hosts) try to treat `/jobs/:id` as a
 * server route / prerender target. Rewrite *document* requests to index.html
 * in Vite's *pre* middleware so that happens before any SSR/prerender plugin.
 *
 * Only HTML navigations are rewritten. Vite HMR, `/src/*`, and hashed assets
 * pass through unchanged.
 */
function isHtmlDocumentRequest(req: Connect.IncomingMessage): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const accept = String(req.headers.accept ?? "");
  if (!accept.includes("text/html")) return false;

  const raw = req.url ?? "/";
  const pathname = raw.split("?")[0] ?? "/";
  if (pathname === "/" || pathname === "/index.html") return false;
  if (pathname.startsWith("/@") || pathname.startsWith("/src/") || pathname.startsWith("/node_modules/")) {
    return false;
  }
  if (pathname.startsWith("/__") || pathname.startsWith("/assets/")) return false;
  // Real files (favicon.png, robots.txt, og-image.jpg, …) must not be rewritten.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false;
  return true;
}

function rewriteToIndexHtml(): Connect.NextHandleFunction {
  return (req, _res, next) => {
    if (isHtmlDocumentRequest(req)) {
      const query = (req.url ?? "").includes("?") ? (req.url ?? "").slice((req.url ?? "").indexOf("?")) : "";
      req.url = `/index.html${query}`;
    }
    next();
  };
}

function attach(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(rewriteToIndexHtml());
}

export function spaDocumentFallback() {
  return {
    name: "spa-document-fallback",
    enforce: "pre" as const,
    configureServer(server: ViteDevServer) {
      attach(server);
    },
    configurePreviewServer(server: PreviewServer) {
      attach(server);
    },
    closeBundle() {
      const index = path.resolve(process.cwd(), "dist/index.html");
      const dest = path.resolve(process.cwd(), "dist/404.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, dest);
      }
    },
  };
}
