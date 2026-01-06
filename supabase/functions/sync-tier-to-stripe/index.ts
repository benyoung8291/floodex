import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SYNC-TIER-TO-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify super_admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check if user is super_admin
    const { data: hasRole } = await supabaseClient.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });

    if (!hasRole) {
      throw new Error("Unauthorized: super_admin role required");
    }
    logStep("Super admin verified", { userId });

    const { tierId, name, monthlyPrice, existingProductId } = await req.json();
    logStep("Request body parsed", { tierId, name, monthlyPrice, existingProductId });

    if (!tierId || !name || monthlyPrice === undefined) {
      throw new Error("Missing required fields: tierId, name, monthlyPrice");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let productId = existingProductId;
    let priceId: string;

    // Create or update product
    if (productId) {
      logStep("Updating existing product", { productId });
      await stripe.products.update(productId, {
        name: name,
        metadata: { tier_id: tierId },
      });
    } else {
      logStep("Creating new product");
      const product = await stripe.products.create({
        name: name,
        metadata: { tier_id: tierId },
      });
      productId = product.id;
      logStep("Product created", { productId });
    }

    // Always create a new price (Stripe prices are immutable)
    // First, archive old prices for this product
    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    for (const oldPrice of existingPrices.data) {
      await stripe.prices.update(oldPrice.id, { active: false });
      logStep("Archived old price", { priceId: oldPrice.id });
    }

    // Create new price
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(monthlyPrice * 100), // Convert to cents
      currency: "aud",
      recurring: { interval: "month" },
      metadata: { tier_id: tierId },
    });
    priceId = price.id;
    logStep("Price created", { priceId, unitAmount: price.unit_amount });

    // Update the tier in database with Stripe IDs
    const { error: updateError } = await supabaseClient
      .from("subscription_tiers")
      .update({
        stripe_product_id: productId,
        stripe_price_id: priceId,
      })
      .eq("id", tierId);

    if (updateError) {
      throw new Error(`Failed to update tier: ${updateError.message}`);
    }
    logStep("Tier updated with Stripe IDs");

    return new Response(
      JSON.stringify({
        success: true,
        productId,
        priceId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
