import type Stripe from "stripe";
import type { createAdminClient } from "@/lib/supabase/admin";
import { euros, PLAN_TIERS } from "@/lib/stripe/plans";
import { sendEmail } from "@/lib/email/send";
import { logEvent } from "@/lib/analytics/server";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function content({ firstName, planLine, url }: { firstName: string | null; planLine: string | null; url: string }) {
  const hello = firstName ? `Salut ${firstName},` : "Salut,";
  const lines = [
    "Ton paiement ne s'est pas terminé : ton espace SaaSFounder est encore verrouillé.",
    ...(planLine ? [`Ta formule : ${planLine}. Résiliable à tout moment.`] : []),
  ];
  const after = [
    "Le lien reprend là où tu t'étais arrêté, au même prix. Il reste valable 30 jours.",
    "Tu nous avais demandé ce rappel : c'est le seul que tu recevras.",
  ];
  const text = [hello, "", ...lines, "", `Reprendre mon paiement : ${url}`, "", ...after, "", "L'équipe SaaSFounder"].join("\n");
  const p = (line: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#27272a">${escapeHtml(line)}</p>`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:17px;font-weight:600;color:#09090a">SaaSFounder</p>
${p(hello)}
${lines.map(p).join("\n")}
<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0fb5b1;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px">Reprendre mon paiement</a></p>
${after.map((line) => `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#71717a">${escapeHtml(line)}</p>`).join("\n")}
<p style="margin:24px 0 0;font-size:14px;color:#27272a">L'équipe SaaSFounder</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
  return { text, html };
}

/**
 * The reminder for a Checkout Session that expired unpaid, sent once per
 * member and only to those who asked for it on the pricing cards (the
 * session carries reminder_consent). Its link reopens the same checkout.
 */
export async function sendCheckoutReminder(admin: AdminClient, session: Stripe.Checkout.Session, origin: string) {
  if (session.metadata?.reminder_consent !== "yes") return;
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return;

  // Claimed before sending, so a redelivered or second expired session
  // doesn't send it again. Members who paid since are skipped.
  const { data: profile } = await admin
    .from("profiles")
    .update({ checkout_reminder_sent_at: new Date().toISOString() })
    .eq("id", userId)
    .is("checkout_reminder_sent_at", null)
    .eq("has_access", false)
    .select("email, first_name")
    .maybeSingle();
  const to = profile?.email ?? session.customer_details?.email ?? session.customer_email;
  if (!profile || !to) return;

  const tier = session.metadata?.price_tier === "standard" ? "standard" : "launch";
  const plan = PLAN_TIERS[tier].find((p) => p.id === session.metadata?.plan);
  const planLine = plan && session.amount_total ? `${plan.label}, ${euros(session.amount_total)} /${plan.interval}` : null;
  const url = session.after_expiration?.recovery?.url ?? `${origin}/tarifs`;

  const sent = await sendEmail({
    to,
    subject: profile.first_name ? `${profile.first_name}, ton espace SaaSFounder t'attend` : "Ton espace SaaSFounder t'attend",
    ...content({ firstName: profile.first_name, planLine, url }),
    idempotencyKey: `checkout-reminder-${userId}`,
  });
  if (!sent) {
    // Not sent: the next expired session can try again.
    await admin.from("profiles").update({ checkout_reminder_sent_at: null }).eq("id", userId);
    return;
  }
  await logEvent({ name: "checkout_reminder_sent", user_id: userId, props: { plan: plan?.id ?? null, tier } });
}
