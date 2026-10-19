"use client";

import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { InAppBrowserHint } from "@/components/pricing/in-app-browser-hint";
import { track } from "@/lib/analytics/track";

// In every plan.
const FEATURES = [
  "Ton idée de SaaS et ton prompt de démarrage",
  "Checklist de lancement guidée",
  "Coach IA, conseils marketing et idées de contenu",
  "Dashboard de suivi de ton MRR",
];

type Plan = (typeof PLANS)[number];

const BEST_DISCOUNT = Math.max(...PLANS.map((p) => p.discountPercent ?? 0));

// What the longer plans add. The monthly card lists them too, locked, so
// the difference is visible where the choice is made.
function extras(plan: Plan) {
  return [
    { label: "Crédit IA doublé chaque mois", included: plan.aiCredit > 1 },
    {
      label: plan.savings ? `${plan.savings} économisés vs le mensuel` : `Jusqu'à −${BEST_DISCOUNT}\u00a0% sur le prix`,
      included: !!plan.savings,
    },
  ];
}

export function PricingCards() {
  // Open the connection to Stripe Checkout ahead of the click.
  preconnect("https://checkout.stripe.com");
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // "Voit les prix" in the admin funnel: the cards actually came on screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        track("pricing_viewed");
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  async function choose(planId: PlanId) {
    if (loadingPlan) return;
    setError(null);
    setLoadingPlan(planId);
    const toSignup = () => router.push(`/inscription?plan=${planId}`);

    // Read locally from the session cookie: no round trip just to learn the
    // visitor isn't signed in. The server re-checks the session anyway.
    const supabase = createClient();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    track("checkout_clicked", { plan: planId, signed_in: !!data.session });
    if (!data.session) {
      toSignup();
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.status === 401) {
        toSignup();
        return;
      }
      const result = await res.json();
      if (result.url) {
        // Keep "Redirection..." on screen while Stripe loads: resetting the
        // button here made it look like nothing happened.
        window.location.assign(result.url);
        return;
      }
      setError(
        result.error === "Plan not configured"
          ? "Cette formule n'est pas encore ouverte au paiement. Choisis-en une autre ou utilise un code d'accès."
          : "Le paiement n'est pas encore configuré. Réessaie plus tard ou utilise un code d'accès."
      );
    } catch {
      setError("Connexion impossible, réessaie dans un instant.");
    }
    setLoadingPlan(null);
  }

  return (
    <div ref={rootRef}>
      <InAppBrowserHint />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-xl border p-6",
              plan.recommended
                ? "border-accent/50 bg-accent/[0.06] shadow-[0_0_40px_-15px_var(--color-accent)]"
                : "border-ink/12 bg-ink/[0.02]",
              // On a phone the recommended plan comes first and the monthly one last.
              plan.recommended && "order-first sm:order-none",
              plan.months === 1 && "order-last sm:order-none"
            )}
          >
            {plan.recommended ? (
              <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-canvas">
                <Sparkles className="size-3" />
                Recommandé
              </span>
            ) : plan.discountPercent === BEST_DISCOUNT ? (
              <span className="absolute -top-3 left-6 rounded-full border border-success/40 bg-canvas px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-success">
                Meilleur prix
              </span>
            ) : null}
            <div className="flex h-6 items-center justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{plan.label}</p>
              {plan.discountPercent ? (
                <span className="rounded-full bg-success/12 px-2 py-0.5 font-mono text-[11px] font-medium text-success">
                  −{plan.discountPercent}&nbsp;%
                </span>
              ) : null}
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-ink">
              {plan.price}
              <span className="font-body text-[14px] font-normal text-ink-faint"> /{plan.interval}</span>
            </p>
            <p className="mt-1 h-5 font-body text-[13px] text-accent">
              {plan.perMonth ? (
                <>
                  soit {plan.perMonth}/mois{" "}
                  <span className="text-ink-faint">
                    au lieu de <span className="line-through">{PLANS[0].price}</span>
                  </span>
                </>
              ) : (
                <span className="text-ink-faint">Facturé chaque mois</span>
              )}
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 font-body text-[13px] text-ink-muted">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
              {extras(plan).map((extra) =>
                extra.included ? (
                  <li key={extra.label} className="flex items-start gap-2 font-body text-[13px] font-medium text-ink">
                    <Plus className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={3} />
                    {extra.label}
                  </li>
                ) : (
                  <li key={extra.label} className="flex items-start gap-2 font-body text-[13px] text-ink-faint/70">
                    <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                    <span className="line-through decoration-ink/25">{extra.label}</span>
                  </li>
                )
              )}
            </ul>
            {plan.months === 1 && (
              <p className="mt-4 rounded-lg border border-ink/8 bg-ink/[0.03] px-3 py-2 font-body text-[12px] leading-relaxed text-ink-faint">
                Le crédit IA doublé et les économies sont réservés au <span className="text-ink-muted">Trimestriel</span> et
                à l&apos;<span className="text-ink-muted">Annuel</span>.
              </p>
            )}
            <div className="mt-auto pt-6">
              <Button
                showArrow={false}
                variant={plan.recommended ? "primary" : "secondary"}
                disabled={loadingPlan !== null}
                onClick={() => choose(plan.id)}
                className="w-full"
              >
                {loadingPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Redirection vers le paiement...
                  </span>
                ) : (
                  "Choisir"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-center font-body text-[13px] text-red-400">{error}</p>}
    </div>
  );
}
