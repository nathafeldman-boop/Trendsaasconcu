import Link from "next/link";
import { Lock } from "lucide-react";
import { UNLOCKS, availability, planFor, planWith, type Feature } from "@/lib/stripe/plans";

/** In place of a tab the member's plan doesn't include: what it is, and the plan that has it. */
export function PlanLock({ feature }: { feature: Feature }) {
  const label = UNLOCKS.find((item) => item.feature === feature)?.label ?? "Cette partie";
  const plan = planFor(planWith(feature));
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-20 text-center sm:px-8">
      <span className="flex size-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
        <Lock className="size-5 text-accent" />
      </span>
      <h1 className="mt-5 font-display text-[26px] font-semibold leading-tight text-ink">{label}</h1>
      <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-muted">
        Inclus dans : {availability(feature).toLowerCase()}. Ta formule actuelle ne le comprend pas encore. En passant à la formule{" "}
        {plan.label}, tu le débloques tout de suite ; ton abonnement actuel s&apos;arrête à la fin de sa période.
      </p>
      <Link
        href="/tarifs"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 font-body text-[14px] font-semibold text-canvas transition-transform hover:scale-[1.02]"
      >
        Voir les formules
      </Link>
    </div>
  );
}
