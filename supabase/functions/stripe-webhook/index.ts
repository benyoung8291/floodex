import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook signing
      event = JSON.parse(body);
      console.log("Warning: Webhook signature verification skipped");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Received webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        
        const tenantId = session.metadata?.tenant_id;
        const tierId = session.metadata?.tier_id;
        
        if (tenantId && tierId) {
          // Update tenant subscription
          const { error } = await supabase
            .from("tenants")
            .update({
              subscription_tier_id: tierId,
              subscription_status: "active",
              stripe_subscription_id: session.subscription as string,
              trial_ends_at: null, // Clear trial since they've subscribed
            })
            .eq("id", tenantId);

          if (error) {
            console.error("Error updating tenant subscription:", error);
          } else {
            console.log("Tenant subscription updated successfully:", tenantId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);

        // Find tenant by stripe_subscription_id
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (tenant) {
          let status: string = "active";
          if (subscription.status === "past_due") status = "past_due";
          if (subscription.status === "canceled" || subscription.status === "unpaid") status = "cancelled";

          const { error } = await supabase
            .from("tenants")
            .update({ subscription_status: status })
            .eq("id", tenant.id);

          if (error) {
            console.error("Error updating subscription status:", error);
          } else {
            console.log("Subscription status updated:", status);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);

        // Find tenant and downgrade to free tier
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (tenant) {
          // Get free tier ID
          const { data: freeTier } = await supabase
            .from("subscription_tiers")
            .select("id")
            .eq("is_free_tier", true)
            .single();

          const { error } = await supabase
            .from("tenants")
            .update({
              subscription_status: "free",
              subscription_tier_id: freeTier?.id || null,
              stripe_subscription_id: null,
            })
            .eq("id", tenant.id);

          if (error) {
            console.error("Error downgrading to free tier:", error);
          } else {
            console.log("Tenant downgraded to free tier:", tenant.id);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment failed:", invoice.id);

        if (invoice.subscription) {
          const { data: tenant } = await supabase
            .from("tenants")
            .select("id")
            .eq("stripe_subscription_id", invoice.subscription)
            .single();

          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "past_due" })
              .eq("id", tenant.id);
            console.log("Tenant marked as past_due:", tenant.id);
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
