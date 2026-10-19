"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircle, X } from "lucide-react";
import { VslPlayer } from "@/components/vsl/vsl-player";
import { WELCOME_FILM } from "@/lib/vsl/scenes";
import { track } from "@/lib/analytics/track";

// The guided tour of the member area: opens by itself right after payment
// (/espace?checkout=success), and stays one click away afterwards.
export function WelcomeTour({ openOnArrival }: { openOnArrival: boolean }) {
  const [open, setOpen] = useState(openOnArrival);

  // Once shown, a reload of the same URL shouldn't replay it.
  useEffect(() => {
    if (!openOnArrival) return;
    track("welcome_tour_opened", { auto: true });
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [openOnArrival]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track("welcome_tour_opened", { auto: false });
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-ink/[0.04] px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/45 hover:text-ink"
      >
        <PlayCircle className="size-4 text-accent" />
        Visite guidée · 40 s
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={WELCOME_FILM.label}
              initial={{ y: 24, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[min(1100px,calc((100vh-8rem)*16/9))]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[15px] font-semibold text-ink sm:text-[18px]">Bienvenue ! Voilà ton espace en 40 secondes.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer la visite"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-muted transition-colors hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
              <VslPlayer film={WELCOME_FILM} autoPlay="now" cta={{ label: "Je commence", onClick: () => setOpen(false) }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
