"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Compass, Copy } from "lucide-react";
import { track } from "@/lib/analytics/track";

// Apple Pay doesn't show inside the browsers built into TikTok, Instagram
// and co on iPhone. Visitors arriving from those apps get a nudge to reopen
// the pricing page in Safari, where Stripe offers it. Nothing renders
// anywhere else, including on the server.

const IN_APP_BROWSERS: [RegExp, string][] = [
  [/musical_ly|BytedanceWebview|TikTok|trill_/i, "TikTok"],
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/Snapchat/i, "Snapchat"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Twitter/i, "X"],
  [/Pinterest/i, "Pinterest"],
];

function detectInAppBrowser() {
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua);
  if (!isIos) return null;
  return IN_APP_BROWSERS.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
}

const noSubscribe = () => () => {};

export function InAppBrowserHint() {
  const app = useSyncExternalStore(noSubscribe, detectInAppBrowser, () => null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (app) track("in_app_hint_shown", { app });
  }, [app]);

  if (!app) return null;

  // Back to /tarifs in Safari: signed out there, so a plan click goes
  // through login and straight on to Stripe.
  const url = `${window.location.origin}/tarifs`;

  async function copy() {
    try {
      track("in_app_link_copied", { app });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked in this in-app browser: the manual steps remain.
    }
  }

  return (
    <div className="mb-6 rounded-[18px] border border-accent/30 bg-accent/[0.06] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Compass className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold text-ink">
            Pour payer avec Apple Pay, ouvre cette page dans Safari
          </p>
          <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-muted">
            Tu es dans le navigateur de {app} : Apple Pay n&apos;y est pas disponible. La carte bancaire marche quand
            même ici.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={url.replace(/^(https?):\/\//, "x-safari-$1://")}
          onClick={() => track("open_in_safari_clicked", { app })}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 font-body text-[13.5px] font-semibold text-canvas"
        >
          <Compass className="size-4" /> Ouvrir dans Safari
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/15 px-4 font-body text-[13.5px] text-ink"
        >
          {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
          {copied ? "Lien copié" : "Copier le lien"}
        </button>
      </div>
      <p className="mt-3 font-body text-[12px] leading-relaxed text-ink-faint">
        Si le bouton ne marche pas : touche ••• en haut à droite, puis « Ouvrir dans le navigateur ». Tu devras te
        reconnecter dans Safari.
      </p>
    </div>
  );
}
