import type { PaymentMethod } from "@/lib/types/payment-method";

const GUEST_INFO_KEY = "drape-guest";
const PAYMENT_METHODS_KEY = "drape-payment-methods";

export type GuestInfo = {
  name: string;
  email: string;
};

export function loadGuestInfo(): GuestInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(GUEST_INFO_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as GuestInfo).name === "string" &&
      typeof (parsed as GuestInfo).email === "string"
    ) {
      return parsed as GuestInfo;
    }
  } catch {
    return null;
  }

  return null;
}

export function saveGuestInfo(info: GuestInfo): void {
  localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(info));
}

export function loadPaymentMethods(): PaymentMethod[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(PAYMENT_METHODS_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is PaymentMethod =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.brand === "string" &&
        typeof item.last4 === "string" &&
        typeof item.expMonth === "number" &&
        typeof item.expYear === "number"
    );
  } catch {
    return [];
  }
}

export function savePaymentMethods(methods: PaymentMethod[]): void {
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
}

export function addPaymentMethod(method: PaymentMethod): void {
  const methods = loadPaymentMethods().filter((item) => item.id !== method.id);
  savePaymentMethods([method, ...methods]);
}

export function removePaymentMethod(paymentMethodId: string): void {
  const methods = loadPaymentMethods().filter(
    (item) => item.id !== paymentMethodId
  );
  savePaymentMethods(methods);
}
