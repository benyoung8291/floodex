import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

// Stripe price for the one-time AUD $29 job report unlock
// Product: prod_VDLx0wqEkXzbT9 ("FloodEx Job Report Unlock")
const JOB_REPORT_UNLOCK_PRICE_ID = "price_1UCvF69KBgTtt8xbvUIJYR5b";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const { jobId, returnUrl, environment } = await req.json();
    if (!returnUrl || typeof returnUrl !== "string") {
      return new Response(JSON.stringify({ error: "Invalid returnUrl" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";
    const isValidJobId =
      typeof jobId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    if (!isValidJobId) {
      return new Response(JSON.stringify({ error: "Invalid jobId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get tenant info
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: "No tenant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, contact_email, billing_exempt")
      .eq("id", profile.tenant_id)
      .single();

    const stripe = createStripeClient(env);

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: tenant?.contact_email || user.email,
      userId: user.id,
      tenantId: profile.tenant_id,
      tenantName: tenant?.name,
    });

    const { data: job } = await supabase
      .from("jobs")
      .select("id, tenant_id, customer_name, address, city, state, zip_code, report_unlocked_at")
      .eq("id", jobId)
      .eq("tenant_id", profile.tenant_id)
      .maybeSingle();
    if (!job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (job.report_unlocked_at) {
      return new Response(JSON.stringify({ error: "This job is already unlocked" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tenant?.billing_exempt) {
      return new Response(
        JSON.stringify({ error: "This company can unlock reports without payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const location = [job.address, job.city, job.state, job.zip_code]
      .filter((part) => typeof part === "string" && part.trim())
      .join(", ");
    const description = [job.customer_name, location].filter(Boolean).join(" \u2014 ").slice(0, 500);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: JOB_REPORT_UNLOCK_PRICE_ID,
          quantity: 1,
        },
      ],
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


    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
