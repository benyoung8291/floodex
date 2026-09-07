import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type LogLevel = "info" | "warn" | "error";
function log(level: LogLevel, scope: string, message: string, ctx: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, scope, message, ...ctx });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

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
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const tenantId = session.metadata?.tenantId;
      const jobId = session.metadata?.jobId;

      if (session.metadata?.purpose !== "job_report_unlock") {
        log("info", "checkout.completed", "Not a job report unlock — skipping", {
          eventId,
          sessionId: session.id,
          purpose: session.metadata?.purpose ?? null,
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
    } else {
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
