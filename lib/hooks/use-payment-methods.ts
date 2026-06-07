"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addPaymentMethod,
  loadPaymentMethods,
  removePaymentMethod,
} from "@/lib/guest-storage";
import type { PaymentMethod } from "@/lib/types/payment-method";

type UsePaymentMethodsResult = {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteMethod: (paymentMethodId: string) => void;
  saveMethod: (method: PaymentMethod) => void;
};

export function usePaymentMethods(): UsePaymentMethodsResult {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      setMethods(loadPaymentMethods());
    } catch {
      setError("Failed to load saved cards");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMethod = useCallback(
    (paymentMethodId: string) => {
      removePaymentMethod(paymentMethodId);
      refetch();
    },
    [refetch]
  );

  const saveMethod = useCallback(
    (method: PaymentMethod) => {
      addPaymentMethod(method);
      refetch();
    },
    [refetch]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { methods, loading, error, refetch, deleteMethod, saveMethod };
}
