"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

const FEATURES = [
  "Ton idée de SaaS et ton prompt de démarrage",
  "Checklist de lancement guidée",
  "Conseils marketing et idées de contenu",
  "Dashboard de suivi de ton MRR",
];

export function PricingCards({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(planId: PlanId) {
    if (!isAuthenticated) {
      router.push("/commencer");
      return;
    }
    setError(null);
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError("Le paiement n'est pas encore configuré. Réessaie plus tard ou utilise un code d'accès.");
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-xl border p-6 ${
              plan.recommended
                ? "border-accent/50 bg-accent/[0.06] shadow-[0_0_40px_-15px_var(--color-accent)]"
                : "border-white/12 bg-white/[0.02]"
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
            <ul className="mt-6 flex flex-col gap-2.5">
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
              disabled={loadingPlan === plan.id}
              onClick={() => choose(plan.id)}
              className="mt-6 w-full"
            >
              {loadingPlan === plan.id ? "Redirection..." : "Choisir"}
            </Button>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-center font-body text-[13px] text-red-400">{error}</p>}
      <p className="mt-6 text-center font-body text-[13px] text-ink-faint">
        Un code d&apos;accès ?{" "}
        <a href="/acces" className="text-ink underline underline-offset-2 hover:text-accent">
          Entre-le ici
        </a>
      </p>
    </div>
  );
}
