// Server-only: sends an email through Resend (RESEND_API_KEY), from
// EMAIL_FROM, a sender on a domain verified in Resend. Returns false when
// email isn't set up or Resend refuses it, so callers can carry on.

type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend sends at most once per key (for 24 hours). */
  idempotencyKey: string;
};

export async function sendEmail({ to, subject, html, text, idempotencyKey }: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    console.warn("Email not sent: RESEND_API_KEY or EMAIL_FROM is missing.");
    return false;
  }
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ from, to, subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      console.error(`Resend refused the email (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend unreachable:", err instanceof Error ? err.message : err);
    return false;
  }
}
