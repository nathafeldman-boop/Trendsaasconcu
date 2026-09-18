"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Salut, je suis là pour t'aider à avancer sur ton SaaS. Pose-moi une question quand tu veux.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const content = draft.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Une erreur est survenue, réessaie dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="mb-3 flex h-[420px] w-[320px] flex-col overflow-hidden rounded-xl border border-ink/12 bg-canvas-raised shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
              <span className="font-display text-[14px] font-semibold text-ink">Assistant SaaSFounder</span>
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 font-body text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-accent/20 text-ink"
                      : "bg-ink/[0.04] text-ink-muted"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && <p className="font-body text-[12px] text-ink-faint">L&apos;assistant écrit...</p>}
            </div>
            <div className="flex items-center gap-2 border-t border-ink/10 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Écris ton message..."
                className="h-9 flex-1 rounded-lg border border-ink/12 bg-ink/[0.03] px-3 font-body text-[13px] text-ink outline-none focus:border-accent/60"
              />
              <button
                onClick={send}
                disabled={loading}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-canvas disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="flex size-14 items-center justify-center rounded-full bg-accent text-canvas shadow-[0_0_32px_-6px_var(--color-accent)]"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </motion.button>
    </div>
  );
}
