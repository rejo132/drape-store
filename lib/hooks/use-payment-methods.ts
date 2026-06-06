"use client";

import { useCallback, useEffect, useState } from "react";

import type { PaymentMethod } from "@/lib/types/payment-method";

type UsePaymentMethodsResult = {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteMethod: (paymentMethodId: string) => Promise<void>;
};

export function usePaymentMethods(): UsePaymentMethodsResult {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/payment-methods");

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load payment methods");
      }

      const data = (await response.json()) as PaymentMethod[];
      setMethods(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payment methods"
      );
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMethod = useCallback(
    async (paymentMethodId: string) => {
      const response = await fetch("/api/stripe/delete-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete payment method");
      }

      await refetch();
    },
    [refetch]
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { methods, loading, error, refetch, deleteMethod };
}
