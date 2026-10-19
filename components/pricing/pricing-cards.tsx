"use client";

import { useState } from "react";
import { preconnect } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/client";
import { InAppBrowserHint } from "@/components/pricing/in-app-browser-hint";

const FEATURES = [
  "Ton idée de SaaS et ton prompt de démarrage",
  "Checklist de lancement guidée",
  "Conseils marketing et idées de contenu",
  "Dashboard de suivi de ton MRR",
];

export function PricingCards() {
  // Open the connection to Stripe Checkout ahead of the click.
  preconnect("https://checkout.stripe.com");
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(planId: PlanId) {
    if (loadingPlan) return;
    setError(null);
    setLoadingPlan(planId);
    const toSignup = () => router.push(`/inscription?plan=${planId}`);

    // Read locally from the session cookie: no round trip just to learn the
    // visitor isn't signed in. The server re-checks the session anyway.
    const supabase = createClient();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
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
    <div>
      <InAppBrowserHint />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-xl border p-6 ${
              plan.recommended
                ? "border-accent/50 bg-accent/[0.06] shadow-[0_0_40px_-15px_var(--color-accent)]"
                : "border-ink/12 bg-ink/[0.02]"
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-canvas">
                <Sparkles className="size-3" />
                Recommandé
              </span>
            )}
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{plan.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-ink">
              {plan.price}
              <span className="font-body text-[14px] font-normal text-ink-faint"> /{plan.interval}</span>
            </p>
            <p className="mt-1 h-5 font-body text-[13px] text-accent">
              {plan.perMonth ? `soit ${plan.perMonth}/mois` : null}
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 font-body text-[13px] text-ink-muted">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              showArrow={false}
              variant={plan.recommended ? "primary" : "secondary"}
              disabled={loadingPlan !== null}
              onClick={() => choose(plan.id)}
              className="mt-6 w-full"
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
        ))}
      </div>
      {error && <p className="mt-4 text-center font-body text-[13px] text-red-400">{error}</p>}
    </div>
  );
}
