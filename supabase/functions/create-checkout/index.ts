import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

// Stripe price for the one-time AUD $29 job report unlock
// Product: prod_VDLx0wqEkXzbT9 ("FloodEx Job Report Unlock")
const JOB_REPORT_UNLOCK_PRICE_ID = "price_1UCvF69KBgTtt8xbvUIJYR5b";

// Stripe price for the AUD $250/month unlimited plan
// Product: prod_VDMNn9v8d3QEAP ("FloodEx Unlimited")
const UNLIMITED_PRICE_ID = "price_1UCvet9KBgTtt8xbsLiYMtU2";
const UNLIMITED_PRODUCT_LOOKUP_KEY = "floodex_unlimited";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  opts: { email?: string; userId?: string; tenantId: string; tenantName?: string },
): Promise<string> {
  if (opts.userId && !/^[a-zA-Z0-9_-]+$/.test(opts.userId)) throw new Error("Invalid userId");
  if (opts.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${opts.userId}'`,
      limit: 1,
    });
    if (found.data?.length) return found.data[0].id;
  }
  if (opts.email) {
    const existing = await stripe.customers.list({ email: opts.email, limit: 1 });
    if (existing.data?.length) {
      const c = existing.data[0];
      if (opts.userId && c.metadata?.userId !== opts.userId) {
        await stripe.customers.update(c.id, {
          metadata: { ...(c.metadata || {}), userId: opts.userId, tenantId: opts.tenantId },
        });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(opts.email && { email: opts.email }),
    ...(opts.tenantName && { name: opts.tenantName }),
    metadata: {
      ...(opts.userId && { userId: opts.userId }),
      tenantId: opts.tenantId,
    },
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { jobId, returnUrl, environment, purpose: rawPurpose } = await req.json();
    if (!returnUrl || typeof returnUrl !== "string") {
      return json({ error: "Invalid returnUrl" }, 400);
    }
    const purpose: "job_report_unlock" | "subscription" =
      rawPurpose === "subscription" ? "subscription" : "job_report_unlock";
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    if (purpose === "job_report_unlock" && (typeof jobId !== "string" || !UUID_RE.test(jobId))) {
      return json({ error: "Invalid jobId" }, 400);
    }

    // Tenant context
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return json({ error: "No tenant" }, 400);

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, contact_email")
      .eq("id", profile.tenant_id)
      .single();

    const stripe = createStripeClient(env);

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: tenant?.contact_email || user.email,
      userId: user.id,
      tenantId: profile.tenant_id,
      tenantName: tenant?.name,
    });

    // ---------- Unlimited subscription ----------
    if (purpose === "subscription") {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, status, stripe_subscription_id")
        .eq("tenant_id", profile.tenant_id)
        .eq("product_lookup_key", UNLIMITED_PRODUCT_LOOKUP_KEY)
        .in("status", ["active", "trialing"])
        .maybeSingle();
      if (existing) {
        return json({ error: "This company already has the Unlimited plan" }, 409);
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: UNLIMITED_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: returnUrl,
        customer: customerId,
        subscription_data: {
          metadata: {
            userId: user.id,
            tenantId: profile.tenant_id,
            purpose: "unlimited_subscription",
            productLookupKey: UNLIMITED_PRODUCT_LOOKUP_KEY,
          },
        },
        metadata: {
          userId: user.id,
          tenantId: profile.tenant_id,
          purpose: "unlimited_subscription",
        },
      });

      return json({ clientSecret: session.client_secret });
    }

    // ---------- One-off job report unlock ----------
    const { data: job } = await supabase
      .from("jobs")
      .select("id, tenant_id, customer_name, address, city, state, zip_code, report_unlocked_at")
      .eq("id", jobId)
      .eq("tenant_id", profile.tenant_id)
      .maybeSingle();
    if (!job) return json({ error: "Job not found" }, 404);
    if (job.report_unlocked_at) return json({ error: "This job is already unlocked" }, 409);

    const { data: unlimited } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .eq("product_lookup_key", UNLIMITED_PRODUCT_LOOKUP_KEY)
      .in("status", ["active", "trialing"])
      .maybeSingle();
    if (unlimited) {
      return json(
        { error: "Your Unlimited plan covers this report — no payment needed" },
        400,
      );
    }

    const location = [job.address, job.city, job.state, job.zip_code]
      .filter((part) => typeof part === "string" && part.trim())
      .join(", ");
    const description = [job.customer_name, location].filter(Boolean).join(" \u2014 ").slice(0, 500);

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: JOB_REPORT_UNLOCK_PRICE_ID, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer: customerId,
      payment_intent_data: {
        description: description
          ? `Job report unlock — ${description}`
          : "One-time unlock to download PDFs for this job",
        metadata: {
          userId: user.id,
          tenantId: profile.tenant_id,
          jobId: job.id,
          purpose: "job_report_unlock",
        },
      },
      metadata: {
        userId: user.id,
        tenantId: profile.tenant_id,
        jobId: job.id,
        purpose: "job_report_unlock",
      },
    });

    return json({ clientSecret: session.client_secret });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-checkout error:", message);
    return json({ error: message }, 500);
  }
});
