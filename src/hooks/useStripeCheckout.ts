import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CheckoutOptions {
  priceId: string;
  returnUrl?: string;
}

export function useStripeCheckout() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const openCheckout = useCallback((opts: CheckoutOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  const openCustomerPortal = useCallback(async () => {
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.href, environment: import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN?.startsWith("pk_test_") ? "sandbox" : "live" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error(data?.error || "No portal URL returned");
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  }, []);

  return { isOpen, options, openCheckout, closeCheckout, openCustomerPortal, isPortalLoading };
}
