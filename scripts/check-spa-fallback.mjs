#!/usr/bin/env node
/**
 * Regression: `vite preview` must serve the SPA shell (not 404/500) for
 * client routes, especially /jobs/:id.
 *
 * Usage: node scripts/check-spa-fallback.mjs
 * Expects `npm run build` to have already produced dist/.
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const PORT = process.env.SPA_CHECK_PORT || "4174";
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;

const PATHS = [
  "/",
  "/dashboard",
  "/jobs",
  "/jobs/new",
  "/jobs/test-id",
  "/jobs/42fbd9f3-78a6-4be0-badb-26b23f3a2ead",
  "/settings",
];

function fail(msg) {
  console.error(`spa-fallback: FAIL ${msg}`);
  process.exit(1);
}

if (!existsSync("dist/index.html")) {
  fail("dist/index.html missing — run `npm run build` first");
}
if (!existsSync("dist/404.html")) {
  fail("dist/404.html missing — spaDocumentFallback closeBundle did not copy index.html");
}

const index = readFileSync("dist/index.html", "utf8");
if (!index.includes('id="root"') && !index.includes("id='root'")) {
  fail("dist/index.html has no #root");
}

const child = spawn(
  "npx",
  ["vite", "preview", "--host", HOST, "--port", PORT, "--strictPort"],
  { stdio: ["ignore", "pipe", "pipe"], detached: true },
);

const stopPreview = () => {
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      /* already gone */
    }
  }
};

let ready = false;
const onData = (buf) => {
  const s = buf.toString();
  if (s.includes("Local:") || s.includes(`http://${HOST}:${PORT}`)) ready = true;
};
child.stdout.on("data", onData);
child.stderr.on("data", onData);

const deadline = Date.now() + 20_000;
while (!ready && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 150));
}
if (!ready) {
  stopPreview();
  fail("vite preview did not start");
}

try {
  for (const p of PATHS) {
    const res = await fetch(`${BASE}${p}`, {
      headers: { Accept: "text/html" },
      redirect: "manual",
    });
    const body = await res.text();
    if (res.status !== 200) {
      fail(`${p} → HTTP ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) {
      fail(`${p} → content-type ${ct}`);
    }
    if (!body.includes('id="root"') && !body.includes("id='root'")) {
      fail(`${p} → HTML missing #root`);
    }
    if (/^Internal Server Error\s*$/i.test(body.trim())) {
      fail(`${p} → plain-text Internal Server Error`);
    }
    console.log(`spa-fallback: OK  ${res.status}  ${p}`);
  }
} finally {
  stopPreview();
}

console.log("spa-fallback: all paths served the SPA shell");
