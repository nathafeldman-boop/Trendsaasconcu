import type Stripe from "stripe";

// SaaSFounder's own payment method configuration in the shared Stripe
// account: card, Apple Pay and Google Pay, nothing else. Unlike passing
// payment_method_types: ["card"], a configuration keeps Checkout's dynamic
// display, including Apple Pay on browsers other than Safari (paid by
// scanning a QR code with an iPhone). Created on first use, then reused.

const NAME = "SaaSFounder : carte, Apple Pay, Google Pay";

const ON = ["card", "apple_pay", "google_pay"] as const;
// Everything the account's default configuration turns on besides those.
const OFF = [
  "link",
  "klarna",
  "amazon_pay",
  "samsung_pay",
  "bancontact",
  "blik",
  "eps",
  "kakao_pay",
  "mb_way",
  "naver_pay",
  "payco",
  "pix",
] as const;

type MethodKey = (typeof ON)[number] | (typeof OFF)[number];

function desiredSettings() {
  const settings: Partial<Record<MethodKey, { display_preference: { preference: "on" | "off" } }>> = {};
  for (const key of ON) settings[key] = { display_preference: { preference: "on" } };
  for (const key of OFF) settings[key] = { display_preference: { preference: "off" } };
  return settings;
}

function matches(config: Stripe.PaymentMethodConfiguration) {
  const preference = (key: MethodKey) => config[key]?.display_preference?.preference;
  return ON.every((key) => preference(key) === "on") && OFF.every((key) => preference(key) !== "on");
}

// undefined: not looked up yet on this server instance; null: unavailable.
let configId: string | null | undefined;

export async function paymentMethodConfiguration(stripe: Stripe) {
  if (configId !== undefined) return configId;
  try {
    const { data } = await stripe.paymentMethodConfigurations.list({ limit: 100 });
    const existing = data.find((config) => config.name === NAME && config.active && !config.parent);
    if (!existing) {
      configId = (await stripe.paymentMethodConfigurations.create({ name: NAME, ...desiredSettings() })).id;
    } else {
      if (!matches(existing)) await stripe.paymentMethodConfigurations.update(existing.id, desiredSettings());
      configId = existing.id;
    }
  } catch (err) {
    // Checkout then falls back to card-only sessions.
    console.error("Payment method configuration unavailable:", err instanceof Error ? err.message : err);
    configId = null;
  }
  return configId;
}
