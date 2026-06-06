export const SHIPPING_FLAT_CENTS = 800;
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

export function getShippingCost(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : SHIPPING_FLAT_CENTS;
}

export function calculateOrderTotal(subtotalCents: number): number {
  return subtotalCents + getShippingCost(subtotalCents);
}
