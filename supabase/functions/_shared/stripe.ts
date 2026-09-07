// Minimal Stripe REST client using the project's own Stripe account.
// STRIPE_SECRET_KEY is the account's real secret key — call api.stripe.com
// directly, never through the Lovable connector gateway.

export type StripeEnv = "sandbox" | "live";

const API_BASE = "https://api.stripe.com/v1";

function getKey(): string {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

// Encode params in Stripe's flat form: foo[bar][0]=baz
function encode(obj: any, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object") out.push(...encode(item, `${key}[${i}]`));
        else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      out.push(...encode(v, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

async function request(method: string, path: string, body?: any, query?: any) {
  let url = `${API_BASE}${path}`;
  if (query) {
    const qs = encode(query).join("&");
    if (qs) url += `?${qs}`;
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getKey()}`,
    "Stripe-Version": "2026-03-25.dahlia",
  };
  let payload: string | undefined;
  if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = encode(body).join("&");
  }
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`Stripe ${method} ${path} failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

export function createStripeClient(_env?: StripeEnv) {
  return {
    customers: {
      search: (q: { query: string; limit?: number }) =>
        request("GET", "/customers/search", undefined, q),
      list: (q: { email?: string; limit?: number }) =>
        request("GET", "/customers", undefined, q),
      create: (body: any) => request("POST", "/customers", body),
      update: (id: string, body: any) => request("POST", `/customers/${id}`, body),
    },
    prices: {
      list: (q: { lookup_keys?: string[]; limit?: number }) =>
        request("GET", "/prices", undefined, q),
    },
    checkout: {
      sessions: {
        create: (body: any) => request("POST", "/checkout/sessions", body),
        retrieve: (id: string) => request("GET", `/checkout/sessions/${id}`),
      },
    },
    billingPortal: {
      sessions: {
        create: (body: any) => request("POST", "/billing_portal/sessions", body),
      },
    },
    subscriptions: {
      retrieve: (id: string) => request("GET", `/subscriptions/${id}`),
      update: (id: string, body: any) => request("POST", `/subscriptions/${id}`, body),
      cancel: (id: string) => request("DELETE", `/subscriptions/${id}`),
    },
    webhooks: {
      // Stripe-style HMAC verification with replay protection.
      verify: async (
        payload: string,
        signatureHeader: string,
        secret: string,
        toleranceSeconds = 300,
      ) => {
        const parts = Object.fromEntries(
          signatureHeader.split(",").map((p) => {
            const idx = p.indexOf("=");
            return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()] as [string, string];
          }),
        );
        const t = parts.t;
        const v1 = parts.v1;
        if (!t || !v1) throw new Error("Invalid stripe-signature header");

        // Replay protection: reject signatures outside the tolerance window.
        const timestamp = Number(t);
        if (!Number.isFinite(timestamp)) throw new Error("Invalid signature timestamp");
        const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
        if (ageSeconds > toleranceSeconds) {
          throw new Error(`Webhook timestamp outside tolerance (${Math.round(ageSeconds)}s)`);
        }

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
        const expected = Array.from(new Uint8Array(sig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Constant-time comparison
        if (expected.length !== v1.length) throw new Error("Webhook signature mismatch");
        let diff = 0;
        for (let i = 0; i < expected.length; i++) {
          diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
        }
        if (diff !== 0) throw new Error("Webhook signature mismatch");
      },
    },
  };
}
