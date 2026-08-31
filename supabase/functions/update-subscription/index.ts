import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const priceId = typeof body?.priceId === "string" ? body.priceId.trim() : "";
    if (!priceId || priceId.length > 200) {
      return json({ error: "A valid priceId (price lookup key) is required" }, 400);
    }
    const env: StripeEnv = body?.environment === "live" ? "live" : "sandbox";

    // Resolve tenant + require admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return json({ error: "No tenant" }, 400);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("tenant_id", profile.tenant_id)
      .in("role", ["tenant_admin", "super_admin"])
      .maybeSingle();
    if (!roleRow) return json({ error: "Only tenant admins can change the plan" }, 403);

    // The target price must belong to a tier we actually sell.
    const { data: targetTier } = await supabase
      .from("subscription_tiers")
      .select("id, name, monthly_lookup_key, yearly_lookup_key, is_active")
      .or(`monthly_lookup_key.eq.${priceId},yearly_lookup_key.eq.${priceId}`)
      .eq("is_active", true)
      .maybeSingle();
    if (!targetTier) return json({ error: "Unknown plan" }, 400);

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id, price_lookup_key, status")
      .eq("tenant_id", profile.tenant_id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Nothing to modify — the caller should run a fresh checkout instead.
    if (!sub?.stripe_subscription_id || !["active", "past_due", "trialing"].includes(sub.status)) {
      return json({ requiresCheckout: true });
    }
    if (sub.price_lookup_key === priceId) {
      return json({ error: "You are already on this plan" }, 400);
    }

    const stripe = createStripeClient(env);

    // Resolve the lookup key to a Stripe price id.
    const priceList = await stripe.prices.list({ lookup_keys: [priceId], limit: 1 });
    const price = priceList?.data?.[0];
    if (!price?.id) return json({ error: `No Stripe price found for "${priceId}"` }, 400);

    const current = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    const currentItem = current?.items?.data?.[0];
    if (!currentItem?.id) return json({ error: "Subscription has no billable item" }, 500);

    // Swap the item in place. `create_prorations` charges/credits the difference
    // for the remainder of the current period; upgrades take effect immediately.
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{ id: currentItem.id, price: price.id, quantity: 1 }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
      payment_behavior: "pending_if_incomplete",
      metadata: {
        tenant_id: profile.tenant_id,
        tier_id: targetTier.id,
        price_lookup_key: priceId,
      },
    });

    const newItem = updated.items?.data?.[0];
    const periodStart = newItem?.current_period_start ?? updated.current_period_start ?? null;
    const periodEnd = newItem?.current_period_end ?? updated.current_period_end ?? null;

    // Sync immediately so the UI is correct without waiting on the webhook,
    // which remains the authoritative reconciler.
    const { error: syncError } = await supabase
      .from("subscriptions")
      .update({
        status: updated.status,
        price_lookup_key: priceId,
        cancel_at_period_end: !!updated.cancel_at_period_end,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (syncError) console.error("update-subscription: local sync failed:", syncError.message);

    const { error: tenantError } = await supabase
      .from("tenants")
      .update({
        subscription_tier_id: targetTier.id,
        subscription_status: updated.status === "active" ? "active" : undefined,
      })
      .eq("id", profile.tenant_id);
    if (tenantError) console.error("update-subscription: tenant sync failed:", tenantError.message);

    console.log(JSON.stringify({
      fn: "update-subscription",
      tenant_id: profile.tenant_id,
      subscription: sub.stripe_subscription_id,
      from: sub.price_lookup_key,
      to: priceId,
      status: updated.status,
    }));

    return json({
      ok: true,
      status: updated.status,
      tier: targetTier.name,
      current_period_end: periodEnd,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("update-subscription error:", message);
    return json({ error: message }, 500);
  }
});
