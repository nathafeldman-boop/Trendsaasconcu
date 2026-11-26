"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { preconnect } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CreditCard, Loader2, Lock, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PLAN,
  EXIT_OFFER_CENTS,
  OFFER_MS,
  PLAN_TIERS,
  UNLOCKS,
  availability,
  euros,
  type PlanId,
  type PriceTier,
} from "@/lib/stripe/plans";
import { startOffer, syncOffer, useNow, useOfferDeadline } from "@/lib/offer";
import { checkoutExtras, setChoice, useChoice } from "@/lib/checkout-choices";
import { whatsappLink } from "@/lib/legal";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { InAppBrowserHint } from "@/components/pricing/in-app-browser-hint";
import { track } from "@/lib/analytics/track";

const EXIT_SEEN_KEY = "sf_exit_offer_seen";

function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

async function signedIn() {
  // Read locally from the session cookie: no round trip just to learn the
  // visitor isn't signed in. The server re-checks the session anyway.
  const supabase = createClient();
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  return !!data.session;
}

async function syncIfSignedIn(start: boolean) {
  if (await signedIn()) await syncOffer(start);
}

// Back from Stripe without paying (the cancel URL adds ?paiement=annule).
const noSubscribe = () => () => {};
function useCancelledPayment() {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("paiement") === "annule",
    () => false
  );
}

function OfferBanner({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return (
      <div className="rounded-xl border border-ink/12 bg-ink/[0.03] px-4 py-3 text-center font-body text-[13px] leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Ton prix de bienvenue a expiré.</span> Ce sont maintenant les tarifs en vigueur pour toi.
      </div>
    );
  }
  const lastMinute = remaining <= 60_000;
  const tone = lastMinute ? "text-red-400" : "text-amber-300";
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-amber-400/[0.07]", lastMinute ? "border-red-400/50" : "border-amber-400/40")}>
      <div className="flex items-center gap-4 px-4 py-3.5">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <p className={cn("font-display text-[19px] font-semibold leading-tight", tone)}>Prix de bienvenue</p>
          <p className="font-body text-[13px] leading-snug text-ink-muted">réservé 10 minutes</p>
        </div>
        <p
          role="timer"
          aria-label="Temps restant avant la fin du prix de bienvenue"
          className={cn("font-mono text-[22px] font-semibold tabular-nums", tone)}
        >
          {formatCountdown(remaining)}
        </p>
      </div>
      <div className="h-0.5 bg-ink/10">
        <div
          className={cn("h-full transition-[width] duration-1000 ease-linear", lastMinute ? "bg-red-400" : "bg-amber-300")}
          style={{ width: `${Math.min(100, (remaining / OFFER_MS) * 100)}%` }}
        />
      </div>
    </div>
  );
}

// Back from Stripe without paying: one tap on what stopped them, and the
// answer to that very thing (counted as checkout_abandon_reason).
const ABANDON_REASONS = [
  { id: "no-card", label: "Je n'ai pas de carte bancaire" },
  { id: "bank", label: "Ma banque m'a bloqué ou demandé de valider" },
  { id: "price", label: "C'est trop cher pour moi" },
  { id: "trust", label: "Je ne suis pas sûr que ça marche" },
  { id: "looking", label: "Je voulais juste voir le prix" },
] as const;

function AbandonReason({
  disabled,
  retryLabel,
  monthlyLabel,
  onRetry,
  onMonthly,
  question,
}: {
  disabled: boolean;
  retryLabel: React.ReactNode;
  monthlyLabel: React.ReactNode;
  onRetry: () => void;
  onMonthly: () => void;
  question: string | null;
}) {
  const [reason, setReason] = useState<(typeof ABANDON_REASONS)[number]["id"] | null>(null);
  const retry = (
    <Button size="sm" showArrow={false} className="mt-3" disabled={disabled} onClick={onRetry}>
      {retryLabel}
    </Button>
  );
  const monthly = (
    <Button size="sm" showArrow={false} className="mt-3" disabled={disabled} onClick={onMonthly}>
      {monthlyLabel}
    </Button>
  );
  const answers: Record<string, React.ReactNode> = {
    "no-card": (
      <>
        <p>
          Pas besoin de carte : tu peux payer avec <span className="font-semibold text-ink">PayPal</span>, Apple Pay, Google Pay ou
          Revolut, sur la même page de paiement. Si tu es mineur, demande à un parent de payer avec toi : il valide sur son téléphone.
        </p>
        <div className="flex flex-wrap gap-2">{retry}</div>
      </>
    ),
    bank: (
      <>
        <p>
          C&apos;est la sécurité de ta banque, ta carte n&apos;est pas refusée. Réessaie et, dès que tu cliques sur payer,
          <span className="font-semibold text-ink"> ouvre l&apos;appli de ta banque pour valider</span> (ou tape le code reçu par SMS).
          Ne ferme pas la page pendant ce temps. Sinon, passe par PayPal.
        </p>
        {retry}
      </>
    ),
    price: (
      <>
        <p>
          La formule 1 mois est la plus petite pour commencer : tu payes un mois, et tu résilies en un clic depuis ton espace si
          ça ne te convient pas.
        </p>
        {monthly}
      </>
    ),
    trust: (
      <>
        <p>
          Normal de se poser la question. Si tu appliques la méthode 48 h sans faire de vente, tu es remboursé en entier (
          <Link href="/remboursement" className="underline underline-offset-2 hover:text-ink">
            conditions
          </Link>
          ).
          {question && (
            <>
              {" "}
              Une question avant ?{" "}
              <a href={question} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                Écris-nous sur WhatsApp
              </a>
              , on répond vite.
            </>
          )}
        </p>
        {retry}
      </>
    ),
    looking: (
      <>
        <p>Aucun souci. Ton accès s&apos;ouvre dès le paiement validé : ton idée et ton plan t&apos;attendent dans ton espace.</p>
        <div className="flex flex-wrap gap-2">
          {retry}
        </div>
      </>
    ),
  };
  return (
    <div className="rounded-xl border border-ink/12 bg-ink/[0.03] p-4">
      <p className="font-body text-[14px] font-medium text-ink">Ton paiement n&apos;est pas allé au bout. Aucun montant n&apos;a été prélevé.</p>
      {reason === null ? (
        <>
          <p className="mt-1 font-body text-[13px] text-ink-muted">Qu&apos;est-ce qui t&apos;a bloqué ? On a sûrement une solution.</p>
          <div className="mt-3 flex flex-col gap-2">
            {ABANDON_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setReason(r.id);
                  track("checkout_abandon_reason", { reason: r.id });
                }}
                className="rounded-[10px] border border-ink/12 px-3.5 py-2.5 text-left font-body text-[14px] text-ink transition-colors hover:border-accent/50"
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-2 font-body text-[13.5px] leading-relaxed text-ink-muted">{answers[reason]}</div>
      )}
    </div>
  );
}

function Guarantee() {
  return (
    <div className="flex gap-4 rounded-xl border border-success/40 bg-success/[0.06] p-4">
      <ShieldCheck className="mt-0.5 size-9 shrink-0 text-success" strokeWidth={1.75} />
      <div>
        <p className="font-display text-[17px] font-semibold leading-snug text-success">Pas de vente ? On te rembourse intégralement.</p>
        <span className="mt-1.5 inline-block rounded-full bg-success/15 px-2.5 py-0.5 font-mono text-[11px] font-medium text-success">
          Garantie 48 h
        </span>
        <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-muted">
          Applique la méthode 48 h. Aucune vente : tu es remboursé.{" "}
          <Link href="/remboursement" className="underline underline-offset-2 hover:text-ink">
            Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}

function ConsentBoxes({ highlight }: { highlight: boolean }) {
  const terms = useChoice("terms");
  const reminder = useChoice("reminder");
  return (
    <div className="flex flex-col gap-3">
      <label
        id="consent-terms"
        className={cn(
          "flex cursor-pointer items-start gap-2.5 font-body text-[13px] leading-relaxed text-ink-muted transition-colors",
          highlight && !terms && "text-red-300"
        )}
      >
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setChoice("terms", e.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-accent)]"
        />
        <span>
          J&apos;ai 16 ans ou plus, j&apos;accepte les{" "}
          <Link href="/conditions" className="underline underline-offset-2 hover:text-ink">
            CGV
          </Link>{" "}
          et je demande l&apos;accès immédiat à mon espace : je renonce à mon délai de rétractation de 14 jours.
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 font-body text-[13px] leading-relaxed text-ink-faint">
        <input
          type="checkbox"
          checked={reminder}
          onChange={(e) => setChoice("reminder", e.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-accent)]"
        />
        <span>Si je ne termine pas mon paiement, envoie-moi un rappel par email (un seul).</span>
      </label>
    </div>
  );
}

const FAQ = [
  {
    q: "Je peux arrêter quand je veux ?",
    a: "Oui. Les formules 1 mois et 3 mois se résilient en un clic depuis ton espace, sans frais : tu gardes l'accès jusqu'à la fin de la période payée. La formule À vie est un paiement unique, sans renouvellement.",
  },
  {
    q: "Et si je ne fais aucune vente ?",
    a: "Tu es couvert par la garantie 48 h : publie au moins 3 vidéos par jour pendant les deux jours qui suivent ton achat pour promouvoir ton SaaS, et si aucune vente n'arrive, écris-nous dans les 48 heures : on te rembourse ton premier paiement en entier.",
  },
];

/**
 * The pricing page: three plans at their welcome price for 10 minutes from
 * the first time it's seen, then the standard price (enforced by checkout).
 * Someone about to leave gets the lifetime plan for less, once; someone back
 * from an unfinished payment is asked what stopped them (AbandonReason).
 * `startsCountdown={false}` shows the countdown only if it's already running
 * (the landing page: the questionnaire that follows takes longer than that).
 */
export function PricingCards({ startsCountdown = true, goal }: { startsCountdown?: boolean; goal?: number | null }) {
  // Open the connection to Stripe Checkout ahead of the click.
  preconnect("https://checkout.stripe.com");
  const router = useRouter();
  const [selected, setSelected] = useState<PlanId>(DEFAULT_PLAN);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightTerms, setHighlightTerms] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const terms = useChoice("terms");
  const reminder = useChoice("reminder");
  const cancelled = useCancelledPayment();

  const deadline = useOfferDeadline();
  const now = useNow();
  const remaining = deadline !== null && now !== null ? deadline - now : null;
  const running = remaining !== null && remaining > 0;
  const expired = remaining !== null && remaining <= 0;
  const tier: PriceTier = expired ? "standard" : "launch";
  const plans = PLAN_TIERS[tier];
  const current = plans.find((p) => p.id === selected) ?? plans[1];
  const lifetime = plans.find((p) => p.id === "lifetime")!;
  const question = whatsappLink("Salut, j'ai une question sur SaaSFounder :");

  // Signed in: the account's deadline is the one checkout enforces.
  useEffect(() => {
    syncIfSignedIn(false);
  }, []);

  // "Voit les prix" in the admin funnel: the page actually came on screen.
  // That's also when the countdown starts.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track("pricing_viewed");
          if (startsCountdown && startOffer()) {
            track("offer_started");
            syncIfSignedIn(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [startsCountdown]);

  // The sticky bar shows while the main button is off screen.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setCtaVisible(entries.some((e) => e.isIntersecting)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Counted when it runs out on screen, not on every later visit.
  const sawRunning = useRef(false);
  useEffect(() => {
    if (running) sawRunning.current = true;
    else if (expired && sawRunning.current) {
      sawRunning.current = false;
      track("offer_expired");
    }
  }, [running, expired]);

  // About to leave (the pointer heads for the tab bar): the lifetime offer, once.
  useEffect(() => {
    if (!startsCountdown) return;
    const onOut = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 0) return;
      try {
        if (window.localStorage.getItem(EXIT_SEEN_KEY)) return;
        window.localStorage.setItem(EXIT_SEEN_KEY, "1");
      } catch {
        return;
      }
      track("exit_offer_shown");
      setExitOpen(true);
    };
    document.addEventListener("mouseout", onOut);
    return () => document.removeEventListener("mouseout", onOut);
  }, [startsCountdown]);

  useEffect(() => {
    if (cancelled) track("abandon_reasons_shown");
  }, [cancelled]);

  async function choose(planId: PlanId, offer?: "exit") {
    if (loading) return;
    setError(null);
    if (!terms) {
      setHighlightTerms(true);
      setError("Coche la case des CGV pour continuer.");
      track("terms_missing", { plan: planId });
      document.getElementById("consent-terms")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const key = offer ? `${planId}:${offer}` : planId;
    setLoading(key);
    const toSignup = () => router.push(`/inscription?plan=${planId}${offer ? `&offer=${offer}` : ""}`);

    const isSignedIn = await signedIn();
    track("checkout_clicked", { plan: planId, signed_in: isSignedIn, tier: offer ?? tier, reminder });
    if (offer) track("exit_offer_chosen");
    if (!isSignedIn) {
      toSignup();
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, offer, ...checkoutExtras() }),
      });
      if (res.status === 401) {
        toSignup();
        return;
      }
      const result = await res.json();
      if (result.url) {
        // Keep "Redirection..." on screen while Stripe loads.
        window.location.assign(result.url);
        return;
      }
      setError("Le paiement n'a pas pu démarrer. Réessaie dans un instant ou utilise un code d'accès.");
    } catch {
      setError("Connexion impossible, réessaie dans un instant.");
    }
    setLoading(null);
  }

  const busy = (key: string) => loading === key;
  const redirecting = (
    <span className="flex items-center gap-2">
      <Loader2 className="size-4 animate-spin" /> Redirection vers le paiement...
    </span>
  );

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[560px]">
      <InAppBrowserHint />
      <div className="flex flex-col gap-5">
        {remaining !== null && <OfferBanner remaining={remaining} />}

        {cancelled && (
          <AbandonReason
            disabled={loading !== null}
            retryLabel={busy(current.id) ? redirecting : "Réessayer le paiement"}
            monthlyLabel={busy("monthly") ? redirecting : "Prendre la formule 1 mois"}
            onRetry={() => choose(current.id)}
            onMonthly={() => choose("monthly")}
            question={question}
          />
        )}

        <div>
          <h3 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink">Choisis ta formule.</h3>
          <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink-muted">
            {goal ? (
              <>
                Ton objectif : <span className="font-semibold text-ink">{euros(goal * 100)} par mois</span>. Voici de quoi le viser.
              </>
            ) : (
              "Accès immédiat à ton espace, résiliable à tout moment."
            )}
          </p>
        </div>

        <Guarantee />

        <div role="radiogroup" aria-label="Formules" className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Formules</p>
          {plans.map((plan) => {
            const active = plan.id === selected;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setSelected(plan.id);
                  track("plan_selected", { plan: plan.id });
                }}
                className={cn(
                  "relative flex items-center gap-3.5 rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-accent/60 bg-accent/[0.07] shadow-[0_0_32px_-14px_var(--color-accent)]"
                    : "border-ink/12 bg-ink/[0.02] hover:border-ink/25",
                  plan.recommended && "mt-2"
                )}
              >
                {plan.recommended && (
                  <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-accent px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-canvas">
                    <Sparkles className="size-3" />
                    Le plus choisi
                  </span>
                )}
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-accent bg-accent" : "border-ink/30"
                  )}
                >
                  {active && <Check className="size-3 text-canvas" strokeWidth={3.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[17px] font-semibold text-ink">{plan.label}</span>
                  <span className="mt-0.5 block font-body text-[14px] text-ink">
                    <span className="font-semibold">{plan.price}</span> <span className="text-ink-muted">{plan.period}</span>
                    {running && plan.nextPrice && <span className="text-[12px] text-ink-faint"> · puis {plan.nextPrice}</span>}
                  </span>
                  <span className="mt-2 block rounded-md border border-ink/10 px-2 py-1 font-body text-[11.5px] leading-snug text-ink-muted">
                    {plan.summary}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-[18px] font-semibold text-ink">{plan.perDay ?? "Une fois"}</span>
                  <span className="block font-body text-[11px] text-ink-faint">{plan.perDay ? "/ jour" : "à vie"}</span>
                </span>
              </button>
            );
          })}
        </div>

        <ConsentBoxes highlight={highlightTerms} />

        <div ref={ctaRef}>
          <Button showArrow={!loading} disabled={loading !== null} onClick={() => choose(selected)} className="w-full">
            {busy(selected) ? redirecting : `Continuer · ${current.price} ${current.period}`}
          </Button>
          {error && !exitOpen && <p className="mt-3 text-center font-body text-[13px] text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <p className="flex items-center gap-1.5 font-body text-[13px] text-success">
            <Lock className="size-3.5" /> Paiement sécurisé, encaissé par Stripe
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Carte bancaire", icon: CreditCard },
              { label: "Apple Pay", icon: Smartphone },
              { label: "Google Pay", icon: Smartphone },
            ].map(({ label, icon: Icon }) => (
              <span key={label} className="flex items-center gap-1.5 rounded-lg border border-ink/12 px-3 py-1.5 font-body text-[12px] text-ink-muted">
                <Icon className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-body text-[14px] font-medium text-ink">
                {item.q}
                <span className="text-ink-faint transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        {question && (
          <p className="text-center font-body text-[13px] text-ink-faint">
            Une autre question ?{" "}
            <a href={question} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
              Écris-moi sur WhatsApp
            </a>
          </p>
        )}

        <div className="mt-4">
          <p className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">Ce que tu débloques</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {UNLOCKS.map((item) => (
              <li key={item.label} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3">
                <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} />
                <span>
                  <span className="block font-body text-[14px] font-medium text-ink">{item.label}</span>
                  <span className="block font-body text-[12px] text-ink-faint">{availability(item.feature)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-body text-[11.5px] leading-relaxed text-ink-faint">
          Dès 16 ans. Formules 1 et 3 mois : renouvellement automatique au prix indiqué (le prix de bienvenue est gardé tant que tu ne
          résilies pas), résiliable à tout moment. Formule à vie : paiement unique, sans renouvellement.{" "}
          <Link href="/conditions" className="underline underline-offset-2">
            CGV
          </Link>{" "}
          ·{" "}
          <Link href="/remboursement" className="underline underline-offset-2">
            Remboursement
          </Link>
        </p>
      </div>

      {/* Sticky bar while the main button is off screen (phones). */}
      <AnimatePresence>
        {!ctaVisible && !exitOpen && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[90] border-t border-ink/10 bg-canvas/95 px-4 py-3 backdrop-blur-md sm:hidden"
          >
            <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3">
              <p className="font-body text-[15px] text-ink">
                <span className="font-semibold">{current.price}</span> <span className="text-ink-muted">{current.period}</span>
              </p>
              <Button size="sm" disabled={loading !== null} onClick={() => choose(selected)}>
                Continuer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The lifetime plan for less, to someone about to leave. */}
      <AnimatePresence>
        {exitOpen && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label="Fermer" onClick={() => setExitOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-title"
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              className="relative w-full max-w-md rounded-2xl border border-ink/12 bg-canvas-raised p-6"
            >
              <button
                type="button"
                onClick={() => setExitOpen(false)}
                aria-label="Fermer"
                className="absolute right-4 top-4 text-ink-faint transition-colors hover:text-ink"
              >
                <X className="size-5" />
              </button>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300">Avant de partir</p>
              <h3 id="exit-title" className="mt-2 font-display text-[26px] font-semibold leading-tight text-ink">
                L&apos;accès à vie à {euros(EXIT_OFFER_CENTS)}, une seule fois.
              </h3>
              <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-muted">
                Tout, pour toujours, en un seul paiement : ton idée, ton site, tes plans, tes scripts vidéo, le coach IA et
                l&apos;accompagnement. Au lieu de {lifetime.price} sur cette page.
              </p>
              <div className="mt-5">
                <ConsentBoxes highlight={highlightTerms} />
              </div>
              <Button className="mt-5 w-full" disabled={loading !== null} onClick={() => choose("lifetime", "exit")}>
                {busy("lifetime:exit") ? redirecting : `Je prends l'accès à vie à ${euros(EXIT_OFFER_CENTS)}`}
              </Button>
              {error && <p className="mt-3 text-center font-body text-[13px] text-red-400">{error}</p>}
              <button
                type="button"
                onClick={() => setExitOpen(false)}
                className="mt-3 w-full text-center font-body text-[13px] text-ink-faint underline-offset-2 hover:underline"
              >
                Non merci
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
