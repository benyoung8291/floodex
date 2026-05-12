import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function resolveTierIdFromLookupKey(lookupKey: string | null) {
  if (!lookupKey) return null;
  const { data } = await supabase
    .from("subscription_tiers")
    .select("id")
    .or(`monthly_lookup_key.eq.${lookupKey},yearly_lookup_key.eq.${lookupKey}`)
    .maybeSingle();
  return data?.id ?? null;
}

async function upsertSubscription(env: StripeEnv, sub: any, tenantId: string) {
  const stripe = createStripeClient(env);
  // The webhook payload already has price info, but be defensive and re-fetch on mutate events
  const item = sub.items?.data?.[0];
  const priceLookupKey = item?.price?.lookup_key ?? sub.metadata?.priceLookupKey ?? null;
  const productId = item?.price?.product ?? null;
  const tierId = await resolveTierIdFromLookupKey(priceLookupKey);
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

  await supabase.from("subscriptions").upsert(
    {
      tenant_id: tenantId,
      user_id: sub.metadata?.userId ?? null,
      environment: env,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_lookup_key: priceLookupKey,
      product_lookup_key: typeof productId === "string" ? productId : null,
      current_period_end: periodEnd,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Sync tenant
  const tenantStatus = sub.status === "trialing" ? "trial"
    : sub.status === "active" || sub.status === "past_due" ? "active"
    : sub.status === "canceled" || sub.status === "unpaid" ? "cancelled"
    : sub.status;

  await supabase
    .from("tenants")
    .update({
      subscription_tier_id: tierId,
      subscription_status: tenantStatus,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
    })
    .eq("id", tenantId);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const env: StripeEnv = url.searchParams.get("env") === "live" ? "live" : "sandbox";

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = env === "live"
    ? Deno.env.get("PAYMENTS_LIVE_WEBHOOK_SECRET")
    : Deno.env.get("PAYMENTS_SANDBOX_WEBHOOK_SECRET");

  if (!signature || !secret) {
    console.error("Missing signature or webhook secret");
    return new Response("Bad request", { status: 400 });
  }

  try {
    const stripe = createStripeClient(env);
    await stripe.webhooks.verify(body, signature, secret);
  } catch (e) {
    console.error("Webhook verify failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  console.log(`Webhook event: ${event.type} (${env})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const tenantId = session.metadata?.tenantId;
        if (!tenantId) break;
        if (session.mode === "subscription" && session.subscription) {
          const stripe = createStripeClient(env);
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          // ensure metadata has tenantId/userId from the session
          sub.metadata = { ...(sub.metadata || {}), ...(session.metadata || {}) };
          await upsertSubscription(env, sub, tenantId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const tenantId = sub.metadata?.tenantId;
        if (!tenantId) {
          // try lookup via existing subscriptions row
          const { data: existing } = await supabase
            .from("subscriptions")
            .select("tenant_id")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();
          if (!existing?.tenant_id) {
            console.warn("No tenantId on subscription event", sub.id);
            break;
          }
          await upsertSubscription(env, sub, existing.tenant_id);
        } else {
          await upsertSubscription(env, sub, tenantId);
        }
        break;
      }
      default:
        // ignore other events
        break;
    }
  } catch (e) {
    console.error("Handler error:", e);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
