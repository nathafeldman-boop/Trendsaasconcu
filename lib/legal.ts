// Contact points shown on the pricing page, the terms and the refund page.

/** Where refund requests and questions go (a mailbox on the site's domain). */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "contact@saasfounder.fr";

/** WhatsApp number for questions and the lifetime plan's support, digits with country code (33612345678). */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || null;

export function whatsappLink(text: string) {
  return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : null;
}

export const LEGAL_UPDATED_AT = "21 novembre 2026";
