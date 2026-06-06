export function formatCardBrand(brand: string): string {
  const brandNames: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
  };

  return (
    brandNames[brand.toLowerCase()] ??
    brand.charAt(0).toUpperCase() + brand.slice(1)
  );
}

export function formatMaskedLast4(last4: string): string {
  return `•••• ${last4}`;
}

export function formatExpiry(expMonth: number, expYear: number): string {
  const month = String(expMonth).padStart(2, "0");
  const year = String(expYear).slice(-2);
  return `${month}/${year}`;
}
