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

/**
 * Swaps the price on an existing Stripe subscription (true upgrade/downgrade)
 * instead of creating a second parallel subscription via Checkout.
 *
 * - Upgrades   -> prorated and invoiced immediately (`always_invoice`).
 * - Downgrades -> prorated as a credit applied to the next invoice
 *                 (`create_prorations`), so no refund is issued.
 *
 * Pass `preview: true` to get the resulting change described without applying it.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const { priceId, environment, preview } = body ?? {};
    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return json({ error: "Invalid priceId" }, 400);
    }
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    // Resolve tenant
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return json({ error: "No tenant" }, 400);

    // Only tenant admins may change the plan
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("tenant_id", profile.tenant_id)
      .in("role", ["tenant_admin", "super_admin"])
      .maybeSingle();
    if (!roleRow) return json({ error: "Only tenant admins can change the plan" }, 403);

    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id, price_lookup_key")
      .eq("tenant_id", profile.tenant_id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subRow?.stripe_subscription_id) {
      // No subscription to modify — the caller should run Checkout instead.
      return json({ error: "No existing subscription", requiresCheckout: true }, 409);
    }

    const stripe = createStripeClient(env);

    // Resolve the target price by lookup key
    const prices = await stripe.prices.list({ lookup_keys: [priceId], limit: 1 });
    if (!prices.data?.length) return json({ error: "Price not found" }, 404);
    const targetPrice = prices.data[0];

    const current = await stripe.subscriptions.retrieve(subRow.stripe_subscription_id);
    if (current.status === "canceled") {
      return json({ error: "Subscription is cancelled", requiresCheckout: true }, 409);
    }

    const currentItem = current.items?.data?.[0];
    if (!currentItem?.id) return json({ error: "Subscription has no billable item" }, 400);

    if (currentItem.price?.id === targetPrice.id) {
      return json({ error: "Already on this plan" }, 400);
    }

    // Compare in a common unit (per-month) so monthly<->yearly switches are judged fairly.
    const perMonth = (p: any) => {
      const amount = Number(p?.unit_amount ?? 0);
      const interval = p?.recurring?.interval;
      const count = Number(p?.recurring?.interval_count ?? 1) || 1;
      if (interval === "year") return amount / (12 * count);
      if (interval === "week") return (amount * 52) / (12 * count);
      if (interval === "day") return (amount * 365) / (12 * count);
      return amount / count;
    };
    const isUpgrade = perMonth(targetPrice) > perMonth(currentItem.price);

    if (preview) {
      return json({
        ok: true,
        preview: true,
        isUpgrade,
        currentLookupKey: currentItem.price?.lookup_key ?? subRow.price_lookup_key ?? null,
        targetLookupKey: targetPrice.lookup_key ?? priceId,
        prorationBehavior: isUpgrade ? "always_invoice" : "create_prorations",
      });
    }

    const updated = await stripe.subscriptions.update(subRow.stripe_subscription_id, {
      items: [{ id: currentItem.id, price: targetPrice.id, quantity: 1 }],
      proration_behavior: isUpgrade ? "always_invoice" : "create_prorations",
      cancel_at_period_end: false,
      payment_behavior: "pending_if_incomplete",
      metadata: {
        ...(current.metadata || {}),
        userId: user.id,
        tenantId: profile.tenant_id,
        priceLookupKey: targetPrice.lookup_key ?? priceId,
      },
    });

    // Reflect the change locally right away; the webhook reconciles authoritatively.
    const newItem = updated.items?.data?.[0];
    const newLookupKey = newItem?.price?.lookup_key ?? targetPrice.lookup_key ?? priceId;
    const periodEndUnix = newItem?.current_period_end ?? updated.current_period_end ?? null;
    const periodStartUnix = newItem?.current_period_start ?? updated.current_period_start ?? null;

    await supabase
      .from("subscriptions")
      .update({
        status: updated.status,
        price_lookup_key: newLookupKey,
        cancel_at_period_end: !!updated.cancel_at_period_end,
        current_period_start: periodStartUnix
          ? new Date(periodStartUnix * 1000).toISOString()
          : null,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subRow.id);

    const { data: tier } = await supabase
      .from("subscription_tiers")
      .select("id, name")
      .or(`monthly_lookup_key.eq.${newLookupKey},yearly_lookup_key.eq.${newLookupKey}`)
      .maybeSingle();

    if (tier?.id) {
      await supabase
        .from("tenants")
        .update({
          subscription_tier_id: tier.id,
          ...(updated.status === "active" ? { subscription_status: "active" } : {}),
        })
        .eq("id", profile.tenant_id);
    }

    console.log(
      JSON.stringify({
        scope: "update-subscription",
        tenantId: profile.tenant_id,
        subscriptionId: updated.id,
        from: currentItem.price?.lookup_key ?? null,
        to: newLookupKey,
        isUpgrade,
        status: updated.status,
      }),
    );

    return json({
      ok: true,
      isUpgrade,
      status: updated.status,
      tierName: tier?.name ?? null,
      lookupKey: newLookupKey,
      current_period_end: periodEndUnix,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("update-subscription error:", message);
    return json({ error: message }, 500);
  }
});
