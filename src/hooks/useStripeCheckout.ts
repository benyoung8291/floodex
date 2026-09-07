import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutOptions {
  priceId?: string;
  jobId?: string;
  returnUrl?: string;
}

export function useStripeCheckout() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<CheckoutOptions | null>(null);

  const openCheckout = useCallback((opts: CheckoutOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  return { isOpen, options, openCheckout, closeCheckout };
}
