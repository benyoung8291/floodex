import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---------------------------------------------------------------------------
// Structured logging helper
// ---------------------------------------------------------------------------
type LogLevel = "info" | "warn" | "error";
function log(level: LogLevel, scope: string, message: string, ctx: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...ctx,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function resolveTierIdFromLookupKey(lookupKey: string | null, eventId: string) {
  if (!lookupKey) return null;
  const { data, error } = await supabase
    .from("subscription_tiers")
    .select("id, name")
    .or(`monthly_lookup_key.eq.${lookupKey},yearly_lookup_key.eq.${lookupKey}`)
    .maybeSingle();
  if (error) {
    log("error", "resolveTier", "Failed to look up tier by lookup_key", {
      eventId,
      lookupKey,
      error: error.message,
    });
    return null;
  }
  if (!data) {
    log("warn", "resolveTier", "No subscription_tier matched lookup_key", { eventId, lookupKey });
    return null;
  }
  log("info", "resolveTier", "Resolved tier", { eventId, lookupKey, tierId: data.id, tierName: data.name });
  return data.id as string;
}

async function ensureTenantExists(tenantId: string, eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, subscription_status")
    .eq("id", tenantId)
    .maybeSingle();
  if (error) {
    log("error", "ensureTenant", "Tenant lookup failed", { eventId, tenantId, error: error.message });
    return false;
  }
  if (!data) {
    log("error", "ensureTenant", "Tenant does not exist — refusing to upsert subscription", {
      eventId,
      tenantId,
    });
    return false;
  }
  log("info", "ensureTenant", "Tenant verified", {
    eventId,
    tenantId,
    tenantName: data.name,
    previousStatus: data.subscription_status,
  });
  return true;
}

async function upsertSubscription(env: StripeEnv, sub: any, tenantId: string, eventId: string) {
  // Validate basics before touching the DB so we have clear, attributable errors.
  if (!sub?.id || typeof sub.id !== "string") {
    log("error", "upsertSubscription", "Subscription event missing id", { eventId, tenantId });
    throw new Error("Invalid subscription payload: missing id");
  }
  if (!sub.customer || typeof sub.customer !== "string") {
    log("error", "upsertSubscription", "Subscription event missing customer", {
      eventId,
      tenantId,
      subscriptionId: sub.id,
    });
    throw new Error("Invalid subscription payload: missing customer");
  }

  const tenantOk = await ensureTenantExists(tenantId, eventId);
  if (!tenantOk) {
    throw new Error(`Tenant ${tenantId} not found`);
  }

  const item = sub.items?.data?.[0];
  const priceLookupKey: string | null =
    item?.price?.lookup_key ?? sub.metadata?.priceLookupKey ?? null;
  const productId = item?.price?.product;
  const tierId = await resolveTierIdFromLookupKey(priceLookupKey, eventId);

  // Basil (2026-03-25.dahlia) puts period fields on the item; fall back to the
  // subscription itself for older payloads.
  const periodEndUnix: number | null =
    item?.current_period_end ?? sub.current_period_end ?? null;
  const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;

  const subRow = {
    tenant_id: tenantId,
    user_id: sub.metadata?.userId ?? null,
    environment: env,
    stripe_customer_id: sub.customer as string,
    stripe_subscription_id: sub.id as string,
    status: sub.status as string,
    price_lookup_key: priceLookupKey,
    product_lookup_key: typeof productId === "string" ? productId : null,
    current_period_end: periodEnd,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  log("info", "upsertSubscription", "Writing subscription row", {
    eventId,
    tenantId,
    env,
    subscriptionId: sub.id,
    status: sub.status,
    priceLookupKey,
    cancelAtPeriodEnd: subRow.cancel_at_period_end,
    periodEnd,
  });

  const { data: upsertData, error: upsertError } = await supabase
    .from("subscriptions")
    .upsert(subRow, { onConflict: "stripe_subscription_id" })
    .select("id, status, price_lookup_key, current_period_end, cancel_at_period_end")
    .maybeSingle();

  if (upsertError) {
    log("error", "upsertSubscription", "Subscription upsert failed", {
      eventId,
      tenantId,
      subscriptionId: sub.id,
      error: upsertError.message,
      details: upsertError.details,
    });
    throw new Error(`Subscription upsert failed: ${upsertError.message}`);
  }
  if (!upsertData) {
    log("error", "upsertSubscription", "Subscription upsert returned no row", {
      eventId,
      tenantId,
      subscriptionId: sub.id,
    });
    throw new Error("Subscription upsert returned no row");
  }
  log("info", "upsertSubscription", "Subscription row persisted", {
    eventId,
    tenantId,
    subscriptionRowId: upsertData.id,
    status: upsertData.status,
  });

  // Map Stripe -> tenant subscription_status enum
  const tenantStatus =
    sub.status === "trialing"
      ? "trial"
      : sub.status === "active" || sub.status === "past_due"
        ? "active"
        : sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired"
          ? "cancelled"
          : null;

  if (!tenantStatus) {
    log("warn", "syncTenant", "Unmapped Stripe status — leaving tenant.subscription_status unchanged", {
      eventId,
      tenantId,
      stripeStatus: sub.status,
    });
  }

  const tenantUpdate: Record<string, unknown> = {
    subscription_tier_id: tierId,
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
  };
  if (tenantStatus) tenantUpdate.subscription_status = tenantStatus;

  const { data: tenantUpdated, error: tenantError } = await supabase
    .from("tenants")
    .update(tenantUpdate)
    .eq("id", tenantId)
    .select("id, subscription_status, subscription_tier_id, stripe_subscription_id")
    .maybeSingle();

  if (tenantError) {
    log("error", "syncTenant", "Tenant update failed", {
      eventId,
      tenantId,
      error: tenantError.message,
      details: tenantError.details,
    });
    throw new Error(`Tenant update failed: ${tenantError.message}`);
  }
  if (!tenantUpdated) {
    log("error", "syncTenant", "Tenant update returned no row (RLS or missing id?)", {
      eventId,
      tenantId,
    });
    throw new Error("Tenant update returned no row");
  }
  log("info", "syncTenant", "Tenant row updated", {
    eventId,
    tenantId,
    newStatus: tenantUpdated.subscription_status,
    newTierId: tenantUpdated.subscription_tier_id,
    stripeSubscriptionId: tenantUpdated.stripe_subscription_id,
  });
}

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const rawEnv = url.searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    log("error", "request", "Invalid env query parameter", { rawEnv });
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret =
    env === "live"
      ? Deno.env.get("PAYMENTS_LIVE_WEBHOOK_SECRET")
      : Deno.env.get("PAYMENTS_SANDBOX_WEBHOOK_SECRET");

  if (!signature || !secret) {
    log("error", "verify", "Missing signature or webhook secret", {
      env,
      hasSignature: !!signature,
      hasSecret: !!secret,
    });
    return new Response("Bad request", { status: 400 });
  }

  try {
    const stripe = createStripeClient(env);
    await stripe.webhooks.verify(body, signature, secret);
  } catch (e) {
    log("error", "verify", "Webhook signature verification failed", {
      env,
      error: e instanceof Error ? e.message : String(e),
    });
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    log("error", "parse", "Webhook body was not valid JSON", { env });
    return new Response("Bad JSON", { status: 400 });
  }

  const eventId: string = event?.id ?? "unknown";
  log("info", "event", "Received webhook event", {
    eventId,
    type: event.type,
    env,
    livemode: event.livemode,
    apiVersion: event.api_version,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const tenantId = session.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "checkout.completed", "Session missing tenantId metadata", {
            eventId,
            sessionId: session.id,
          });
          break;
        }
        if (session.mode === "subscription" && session.subscription) {
          const stripe = createStripeClient(env);
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          sub.metadata = { ...(sub.metadata || {}), ...(session.metadata || {}) };
          await upsertSubscription(env, sub, tenantId, eventId);
        } else {
          log("info", "checkout.completed", "Non-subscription checkout — skipping sync", {
            eventId,
            sessionId: session.id,
            mode: session.mode,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        let tenantId: string | undefined = sub.metadata?.tenantId;
        if (!tenantId) {
          const { data: existing, error: existingErr } = await supabase
            .from("subscriptions")
            .select("tenant_id")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();
          if (existingErr) {
            log("error", "subscription.event", "Lookup of existing subscription row failed", {
              eventId,
              subscriptionId: sub.id,
              error: existingErr.message,
            });
          }
          tenantId = existing?.tenant_id ?? undefined;
          if (!tenantId) {
            log("warn", "subscription.event", "Cannot resolve tenant for subscription — skipping", {
              eventId,
              subscriptionId: sub.id,
              type: event.type,
            });
            break;
          }
          log("info", "subscription.event", "Resolved tenant via existing subscription row", {
            eventId,
            subscriptionId: sub.id,
            tenantId,
          });
        }
        await upsertSubscription(env, sub, tenantId, eventId);
        break;
      }
      default:
        log("info", "event", "Ignored event type", { eventId, type: event.type });
        break;
    }
  } catch (e) {
    log("error", "handler", "Unhandled error processing event", {
      eventId,
      type: event.type,
      error: e instanceof Error ? e.message : String(e),
    });
    return new Response("Handler error", { status: 500 });
  }

  log("info", "event", "Webhook processed successfully", { eventId, type: event.type });
  return new Response(JSON.stringify({ received: true, eventId }), {
    headers: { "Content-Type": "application/json" },
  });
});
