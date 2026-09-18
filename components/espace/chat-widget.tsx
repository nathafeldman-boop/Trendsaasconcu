"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Paperclip } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; image?: string };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Salut, je suis là pour t'aider à avancer sur ton SaaS. Pose-moi une question, ou joins une capture d'écran si tu es bloqué sur quelque chose de précis.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image trop lourde (max 4 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function send() {
    const content = draft.trim();
    if ((!content && !attachedImage) || loading) return;
    const image = attachedImage;
    const next = [...messages, { role: "user" as const, content, image: image ?? undefined }];
    setMessages(next);
    setDraft("");
    setAttachedImage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, image }),
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
            className="mb-3 flex h-[420px] w-[320px] flex-col overflow-hidden rounded-xl border border-ink/12 bg-canvas shadow-[0_30px_80px_-40px_rgba(27,22,48,0.35)]"
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
                  {m.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- ephemeral data URL, not a static asset
                    <img
                      src={m.image}
                      alt="Capture jointe"
                      className="mb-1.5 max-h-32 rounded-md object-contain"
                    />
                  )}
                  {m.content}
                </div>
              ))}
              {loading && <p className="font-body text-[12px] text-ink-faint">L&apos;assistant écrit...</p>}
              <div ref={bottomRef} />
            </div>
            {attachedImage && (
              <div className="flex items-center gap-2 border-t border-ink/10 px-3 pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral data URL, not a static asset */}
                <img src={attachedImage} alt="" className="size-10 rounded-md object-cover" />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="font-body text-[12px] text-ink-faint underline underline-offset-2 hover:text-ink"
                >
                  Retirer
                </button>
              </div>
            )}
            {imageError && (
              <p className="px-3 pt-2 font-body text-[11px] text-red-400">{imageError}</p>
            )}
            <div className="flex items-center gap-2 border-t border-ink/10 p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink-faint hover:text-ink"
                title="Joindre une capture d'écran"
              >
                <Paperclip className="size-4" />
              </button>
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
