// The creator program's terms, shared by the signup page, the creator's own
// page and the admin. Change the rate here: everything is computed from it.

/** What a creator earns, in euro cents, per 1 000 views. */
export const RATE_CENTS_PER_1000_VIEWS = 100;

export const PAYOUT_METHODS = [
  { id: "paypal", label: "PayPal", placeholder: "ton e-mail PayPal" },
  { id: "iban", label: "Virement (IBAN)", placeholder: "FR76 …" },
  { id: "revolut", label: "Revolut", placeholder: "@ton-revtag ou numéro" },
  { id: "lydia", label: "Lydia / Wero", placeholder: "ton numéro" },
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number]["id"];

export function payoutLabel(id: string) {
  return PAYOUT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export function earnedCents(views: number) {
  return Math.floor((Math.max(0, views) * RATE_CENTS_PER_1000_VIEWS) / 1000);
}

export function formatEuros(cents: number) {
  const digits = cents % 100 === 0 ? 0 : 2;
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatViews(views: number) {
  return Math.max(0, views).toLocaleString("fr-FR");
}

export function rateLabel() {
  return `${formatEuros(RATE_CENTS_PER_1000_VIEWS)} pour 1 000 vues`;
}

/** "@Name.Here " → "name.here": TikTok handles are case-insensitive. */
export function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/** French numbers to +33…, anything else kept as typed digits with its +. Null if not a phone number. */
export function normalizePhone(raw: string) {
  const compact = raw.replace(/[\s.\-()]/g, "");
  let phone = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
  if (/^0[1-9]\d{8}$/.test(phone)) phone = `+33${phone.slice(1)}`;
  return /^\+\d{8,15}$/.test(phone) ? phone : null;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}
