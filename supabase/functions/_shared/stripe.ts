// Minimal Stripe REST client routed through the Lovable connector gateway.
// The "API key" stored in STRIPE_*_API_KEY is a gateway connection identifier,
// NOT a real Stripe secret key — never call api.stripe.com directly.

export type StripeEnv = "sandbox" | "live";

const GATEWAY_BASE = "https://connector-gateway.lovable.dev/stripe/v1";

function getCreds(env: StripeEnv) {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  if (!lovable) throw new Error("LOVABLE_API_KEY is not configured");
  const keyName = env === "live" ? "STRIPE_LIVE_API_KEY" : "STRIPE_SANDBOX_API_KEY";
  const connKey = Deno.env.get(keyName);
  if (!connKey) throw new Error(`${keyName} is not configured`);
  return { lovable, connKey };
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

async function request(env: StripeEnv, method: string, path: string, body?: any, query?: any) {
  const { lovable, connKey } = getCreds(env);
  let url = `${GATEWAY_BASE}${path}`;
  if (query) {
    const qs = encode(query).join("&");
    if (qs) url += `?${qs}`;
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": connKey,
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

export function createStripeClient(env: StripeEnv) {
  return {
    customers: {
      search: (q: { query: string; limit?: number }) =>
        request(env, "GET", "/customers/search", undefined, q),
      list: (q: { email?: string; limit?: number }) =>
        request(env, "GET", "/customers", undefined, q),
      create: (body: any) => request(env, "POST", "/customers", body),
      update: (id: string, body: any) => request(env, "POST", `/customers/${id}`, body),
    },
    prices: {
      list: (q: { lookup_keys?: string[]; limit?: number }) =>
        request(env, "GET", "/prices", undefined, q),
    },
    checkout: {
      sessions: {
        create: (body: any) => request(env, "POST", "/checkout/sessions", body),
        retrieve: (id: string) => request(env, "GET", `/checkout/sessions/${id}`),
      },
    },
    billingPortal: {
      sessions: {
        create: (body: any) => request(env, "POST", "/billing_portal/sessions", body),
      },
    },
    subscriptions: {
      retrieve: (id: string) => request(env, "GET", `/subscriptions/${id}`),
    },
    webhooks: {
      // Stripe-style HMAC verification
      verify: async (payload: string, signatureHeader: string, secret: string) => {
        const parts = Object.fromEntries(
          signatureHeader.split(",").map((p) => p.split("=") as [string, string]),
        );
        const t = parts.t;
        const v1 = parts.v1;
        if (!t || !v1) throw new Error("Invalid stripe-signature header");
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
        if (expected !== v1) throw new Error("Webhook signature mismatch");
      },
    },
  };
}
