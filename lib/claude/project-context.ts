import { STEPS, type Answers } from "@/components/onboarding/funnel";
import { CHECKLIST_ITEMS, CODE_TOOLS } from "@/lib/espace/content";
import { getStripeMetrics } from "@/lib/stripe/metrics";
import type { AiSession } from "@/lib/claude/guard";

// Everything the coach and the generators know about one user, as a short
// French brief (a few hundred tokens). Built server-side from the database,
// so the client can't make the coach believe something else about them.

/** Onboarding answers turned back into readable « question → réponse » lines. */
export function describeAnswers(answers: Answers) {
  const lines: string[] = [];
  for (const step of STEPS) {
    if (!("title" in step)) continue;
    const value = answers[step.id];
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;

    let text: string | null = null;
    if (step.type === "single") {
      text = value === "autre" ? String(answers[`${step.id}_libre`] ?? "") : step.options.find((o) => o.id === value)?.label ?? null;
    } else if (step.type === "multi" && Array.isArray(value)) {
      const labels = value.filter((v) => v !== "autre").map((v) => step.options.find((o) => o.id === v)?.label ?? v);
      const free = String(answers[`${step.id}_libre`] ?? "").trim();
      text = [...labels, ...(free ? [free] : [])].join(", ");
    } else if (step.type === "scale") {
      text = `${value}/5`;
    } else if (step.type === "slider") {
      text = `${Number(value).toLocaleString("fr-FR")} € par mois`;
    } else {
      text = String(value);
    }
    if (text) lines.push(`- ${step.title} → ${text}`);
  }
  return lines;
}

export async function buildProjectContext(session: AiSession, options: { stripe?: boolean } = {}) {
  const { supabase, userId, firstName } = session;
  const [onboarding, builder, marketing, stripe] = await Promise.all([
    supabase.from("onboarding_responses").select("answers").eq("user_id", userId).maybeSingle(),
    supabase
      .from("builder_progress")
      .select("idea_text, chosen_tool, checklist, mvp_launched")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("marketing_progress")
      .select("chosen_channel, tiktok_url, self_reported_views")
      .eq("user_id", userId)
      .maybeSingle(),
    options.stripe ? getStripeMetrics(userId) : Promise.resolve(null),
  ]);

  const answers = (onboarding.data?.answers ?? {}) as Answers;
  const sections: string[] = [];

  sections.push(`Prénom : ${firstName ?? "inconnu"}`);

  const profile = describeAnswers(answers);
  if (profile.length) sections.push(`Profil (questionnaire d'inscription) :\n${profile.join("\n")}`);

  const b = builder.data;
  const tool = CODE_TOOLS.find((t) => t.id === b?.chosen_tool)?.name;
  const checklist = (b?.checklist ?? {}) as Record<string, boolean>;
  const done = CHECKLIST_ITEMS.filter((item) => checklist[item.id]).map((item) => item.label);
  const next = CHECKLIST_ITEMS.find((item) => !checklist[item.id])?.label;
  sections.push(
    [
      "Projet :",
      `- Idée : ${b?.idea_text || "pas encore choisie"}`,
      `- Outil de code : ${tool ?? "pas encore choisi"}`,
      `- Lancement : ${done.length}/${CHECKLIST_ITEMS.length} étapes faites${done.length ? ` (${done.join(" ; ")})` : ""}`,
      next ? `- Prochaine étape : ${next}` : "- Checklist de lancement terminée",
      `- MVP en ligne : ${b?.mvp_launched ? "oui" : "pas encore"}`,
    ].join("\n")
  );

  const m = marketing.data;
  sections.push(
    [
      "Marketing :",
      `- Canal : ${m?.chosen_channel ?? "pas encore choisi"}`,
      `- Vidéo publiée : ${m?.tiktok_url ? "oui" : "pas encore"}`,
      m?.self_reported_views != null ? `- Vues déclarées : ${m.self_reported_views}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  if (stripe) {
    if (!stripe.connected) {
      sections.push("Revenus : Stripe pas encore connecté dans SaaSFounder.");
    } else if ("mrr" in stripe) {
      const prices = stripe.prices
        .slice(0, 4)
        .map((p) => `${p.amount} ${p.currency.toUpperCase()}/${p.intervalCount > 1 ? `${p.intervalCount} ` : ""}${p.interval} (${p.subscriptions} abonnés)`)
        .join(", ");
      sections.push(
        [
          "Revenus (Stripe, données réelles) :",
          `- MRR : ${stripe.mrr} ${stripe.currency.toUpperCase()}, ${stripe.activeSubscriptions} abonnements actifs, revenu moyen ${stripe.arpu} par abonné`,
          `- 30 derniers jours : ${stripe.newLast30} nouveaux, ${stripe.canceledLast30} résiliés, ${stripe.pastDue} paiements en échec`,
          prices ? `- Prix en cours : ${prices}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      );
    }
  }

  return { text: sections.join("\n\n"), answers };
}
