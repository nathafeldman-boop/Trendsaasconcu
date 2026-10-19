"use client";

import dynamic from "next/dynamic";

// The coach reads its history from localStorage on first render, so it's
// rendered in the browser only (no server markup to mismatch).
export const CoachChatLoader = dynamic(() => import("@/components/espace/coach-chat").then((m) => m.CoachChat), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-[860px] px-5 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Coach IA</p>
      <div className="glass-panel mt-6 h-64 animate-pulse rounded-[24px]" />
    </div>
  ),
});
