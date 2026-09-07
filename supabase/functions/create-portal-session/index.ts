import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

// Live customer portal configuration: card updates, invoice history,
// billing details, and cancel-at-period-end.
const LIVE_PORTAL_CONFIGURATION_ID = "bpc_1UCw6t9KBgTtt8xb9iMwlI0A";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    const { returnUrl, environment } = await req.json().catch(() => ({}));
    if (!returnUrl || typeof returnUrl !== "string") {
      return json({ error: "Invalid returnUrl" }, 400);
    }
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return json({ error: "No tenant" }, 400);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("tenant_id", profile.tenant_id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id ?? null;

    if (!customerId) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("stripe_customer_id")
        .eq("id", profile.tenant_id)
        .maybeSingle();
      customerId = tenant?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      return json({ error: "No billing account yet — make a payment first" }, 404);
    }

    const stripe = createStripeClient(env);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      ...(env === "live" ? { configuration: LIVE_PORTAL_CONFIGURATION_ID } : {}),
    });

    return json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-portal-session error:", message);
    return json({ error: message }, 500);
  }
});
