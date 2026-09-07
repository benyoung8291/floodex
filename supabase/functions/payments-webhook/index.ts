import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const UNLIMITED_PRODUCT_LOOKUP_KEY = "floodex_unlimited";

type LogLevel = "info" | "warn" | "error";
function log(level: LogLevel, scope: string, message: string, ctx: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, scope, message, ...ctx });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function toIso(seconds: unknown): string | null {
  return typeof seconds === "number" && Number.isFinite(seconds)
    ? new Date(seconds * 1000).toISOString()
    : null;
}

async function syncSubscription(
  subscription: any,
  env: StripeEnv,
  eventId: string,
): Promise<void> {
  const tenantId = subscription?.metadata?.tenantId;
  if (!tenantId) {
    log("warn", "subscription.sync", "Subscription has no tenantId metadata — skipping", {
      eventId,
      subscriptionId: subscription?.id ?? null,
    });
    return;
  }

  const item = subscription?.items?.data?.[0];
  const row = {
    tenant_id: tenantId,
    user_id: subscription?.metadata?.userId ?? null,
    environment: env,
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_lookup_key: item?.price?.lookup_key ?? item?.price?.id ?? null,
    product_lookup_key:
      subscription?.metadata?.productLookupKey ?? UNLIMITED_PRODUCT_LOOKUP_KEY,
    current_period_start:
      toIso(subscription.current_period_start) ?? toIso(item?.current_period_start),
    current_period_end: toIso(subscription.current_period_end) ?? toIso(item?.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });

  if (error) {
    log("error", "subscription.sync", "Failed to upsert subscription", {
      eventId,
      subscriptionId: subscription.id,
      tenantId,
      error: error.message,
    });
    throw new Error(`Subscription sync failed: ${error.message}`);
  }

  log("info", "subscription.sync", "Subscription synced", {
    eventId,
    subscriptionId: subscription.id,
    tenantId,
    status: row.status,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const env: StripeEnv = "live";

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !secret) {
    log("error", "verify", "Missing signature or webhook secret", {
      env,
      hasSignature: !!signature,
      hasSecret: !!secret,
    });
    return new Response("Bad request", { status: 400 });
  }

  const stripe = createStripeClient(env);

  try {
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
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const purpose = session.metadata?.purpose ?? null;

        if (purpose === "unlimited_subscription") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          if (!subscriptionId) {
            log("warn", "checkout.completed", "Subscription session has no subscription", {
              eventId,
              sessionId: session.id,
            });
            break;
          }
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          subscription.metadata = {
            ...(subscription.metadata || {}),
            tenantId: subscription.metadata?.tenantId ?? session.metadata?.tenantId,
            userId: subscription.metadata?.userId ?? session.metadata?.userId,
            productLookupKey:
              subscription.metadata?.productLookupKey ?? UNLIMITED_PRODUCT_LOOKUP_KEY,
          };
          await syncSubscription(subscription, env, eventId);
          break;
        }

        const tenantId = session.metadata?.tenantId;
        const jobId = session.metadata?.jobId;

        // Remember the Stripe customer for this company so they can always open
        // the billing portal (receipts, card details) even without a subscription.
        const sessionCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        if (tenantId && sessionCustomerId) {
          const { error: customerError } = await supabase
            .from("tenants")
            .update({ stripe_customer_id: sessionCustomerId })
            .eq("id", tenantId)
            .is("stripe_customer_id", null);
          if (customerError) {
            log("warn", "checkout.completed", "Could not store tenant stripe_customer_id", {
              eventId,
              tenantId,
              error: customerError.message,
            });
          }
        }

        if (purpose !== "job_report_unlock") {
          log("info", "checkout.completed", "Unhandled checkout purpose — skipping", {
            eventId,
            sessionId: session.id,
            purpose,
          });
        } else if (!tenantId || !jobId) {
          log("warn", "checkout.completed", "Job unlock session missing metadata", {
            eventId,
            sessionId: session.id,
            hasTenantId: !!tenantId,
            hasJobId: !!jobId,
          });
        } else {
          const { data: unlocked, error: unlockError } = await supabase.rpc(
            "apply_paid_job_report_unlock",
            { p_job_id: jobId, p_tenant_id: tenantId, p_stripe_session_id: session.id },
          );
          if (unlockError) {
            log("error", "checkout.completed", "Paid job unlock failed", {
              eventId,
              sessionId: session.id,
              tenantId,
              jobId,
              error: unlockError.message,
            });
            throw new Error(`Paid job unlock failed: ${unlockError.message}`);
          }
          log("info", "checkout.completed", "Job report unlocked", {
            eventId,
            sessionId: session.id,
            tenantId,
            jobId,
            alreadyUnlocked: Boolean(
              (unlocked as { report_unlocked_at?: string } | null)?.report_unlocked_at,
            ),
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await syncSubscription(event.data.object, env, eventId);
        break;
      }

      case "invoice.payment_failed":
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? invoice.parent?.subscription_details?.subscription;
        if (!subscriptionId) {
          log("info", "invoice", "Invoice not tied to a subscription — skipping", {
            eventId,
            invoiceId: invoice.id,
          });
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription, env, eventId);
        break;
      }

      default:
        log("info", "event", "Ignored event type", { eventId, type: event.type });
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
