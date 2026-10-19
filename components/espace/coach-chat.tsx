"use client";

import { Fragment, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Brain, ImagePlus, RotateCcw, Sparkles, X } from "lucide-react";
import { PromptBlock, TabHeader } from "@/components/espace/kit";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";

type Message = { role: "user" | "assistant"; content: string; image?: string };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_STORED_MESSAGES = 40;

const SUGGESTIONS = [
  "Par quoi je commence aujourd'hui ?",
  "Écris-moi le prompt pour ajouter Stripe à mon site",
  "Mon prix est-il bien choisi ?",
  "Donne-moi 3 idées de vidéos pour ma cible",
  "Comment je trouve mes 10 premiers clients ?",
  "Je suis bloqué, voici une capture d'écran",
];

function storageKey(userId: string) {
  return `saasfounder-coach-v1-${userId}`;
}

// The conversation lives in this browser only: nothing to pay for storing
// it, and the coach rebuilds the project context from the database anyway.
// Safe to read during render: this component only renders client-side
// (see coach-chat-loader.tsx).
function readHistory(userId: string): Message[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CoachChat({
  userId,
  firstName,
  initialQuestion,
  initialBudgetUsed,
  facts,
}: {
  userId: string;
  firstName: string | null;
  initialQuestion: string;
  initialBudgetUsed: number;
  facts: { label: string; value: string }[];
}) {
  const [messages, setMessages] = useState<Message[]>(() => readHistory(userId));
  const [draft, setDraft] = useState(initialQuestion);
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [budgetUsed, setBudgetUsed] = useState(initialBudgetUsed);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuestion) inputRef.current?.focus();
  }, [initialQuestion]);

  useEffect(() => {
    try {
      const toStore = messages.slice(-MAX_STORED_MESSAGES).map(({ role, content }) => ({ role, content }));
      window.localStorage.setItem(storageKey(userId), JSON.stringify(toStore));
    } catch {
      // storage full or blocked: the conversation just won't survive a reload
    }
  }, [messages, userId]);

  useEffect(() => {
    if (messages.length) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image trop lourde (4 Mo maximum).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function send(text = draft) {
    const content = text.trim();
    if ((!content && !image) || loading) return;
    const attached = image;
    track("coach_message", { has_image: !!attached, turn: messages.filter((m) => m.role === "user").length + 1 });
    const next: Message[] = [...messages, { role: "user", content, image: attached ?? undefined }];
    setMessages(next);
    setDraft("");
    setImage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), image: attached }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        typeof data.reply === "string"
          ? data.reply
          : res.status === 401
            ? "Ta session a expiré : reconnecte-toi pour continuer."
            : "Le coach est momentanément indisponible, réessaie dans un instant.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (typeof data.budgetUsed === "number") setBudgetUsed(data.budgetUsed);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur réseau, réessaie dans un instant." }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setDraft("");
    setImage(null);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-[860px] flex-col px-5 pt-8 sm:px-8 lg:min-h-[calc(100dvh-2.25rem)] lg:px-12 lg:pt-12">
      <TabHeader
        eyebrow="Coach IA"
        title={firstName ? `Ton coach, ${firstName}.` : "Ton coach."}
        sub="Il connaît ton idée, ton avancement et tes chiffres Stripe. Pose-lui une question, il te répond avec les étapes et les prompts à coller."
      >
        <BudgetMeter used={budgetUsed} />
      </TabHeader>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          <Brain className="size-3.5" /> Il sait que
        </span>
        {facts.map((f) => (
          <span key={f.label} className="rounded-full border border-ink/10 bg-ink/[0.03] px-3 py-1 font-body text-[12px] text-ink-muted">
            <span className="text-ink-faint">{f.label} :</span> {f.value}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-5">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[24px] p-6">
            <div className="flex items-center gap-3">
              <CoachAvatar />
              <p className="font-body text-[15px] leading-relaxed text-ink">
                Salut{firstName ? ` ${firstName}` : ""} ! Dis-moi où tu en es ou ce qui te bloque : je te donne la
                prochaine action, et le prompt exact si ça demande du code.
              </p>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => (s.includes("capture") ? fileRef.current?.click() : send(s))}
                  className="rounded-[14px] border border-ink/10 bg-ink/[0.025] px-4 py-3 text-left font-body text-[13.5px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={cn("flex gap-3", m.role === "user" && "justify-end")}
            >
              {m.role === "assistant" && <CoachAvatar />}
              <div
                className={cn(
                  "min-w-0 rounded-[20px] px-4 py-3",
                  m.role === "user"
                    ? "max-w-[85%] bg-accent/15 font-body text-[14.5px] leading-relaxed text-ink"
                    : "glass-panel max-w-full flex-1"
                )}
              >
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- ephemeral data URL, not a static asset
                  <img src={m.image} alt="Capture jointe" className="mb-2 max-h-48 rounded-[12px] object-contain" />
                )}
                {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown text={m.content} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-3">
            <CoachAvatar />
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="size-2 rounded-full bg-accent"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.18 }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-[84px] z-10 mt-6 pb-4 lg:bottom-0 lg:pb-8">
        <div className="glass-panel rounded-[22px] bg-canvas-raised/90 p-2.5">
          {image && (
            <div className="flex items-center gap-2 px-2 pb-2 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral data URL, not a static asset */}
              <img src={image} alt="" className="size-12 rounded-[10px] object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="flex items-center gap-1 font-body text-[12px] text-ink-faint hover:text-ink"
              >
                <X className="size-3.5" /> Retirer
              </button>
            </div>
          )}
          {imageError && <p className="px-2 pb-2 font-body text-[12px] text-red-400">{imageError}</p>}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={pickImage} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Joindre une capture d'écran"
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              <ImagePlus className="size-[18px]" />
            </button>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={Math.min(6, Math.max(1, draft.split("\n").length))}
              placeholder="Pose ta question à ton coach..."
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2.5 font-body text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={loading || (!draft.trim() && !image)}
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-accent text-canvas shadow-[0_0_24px_-6px_var(--color-accent)] transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between px-2">
          <p className="font-body text-[11.5px] text-ink-faint">Entrée pour envoyer · Maj + Entrée pour aller à la ligne</p>
          {messages.length > 0 && (
            <button type="button" onClick={reset} className="flex items-center gap-1 font-body text-[11.5px] text-ink-faint hover:text-ink">
              <RotateCcw className="size-3" /> Nouvelle conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CoachAvatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/12 text-accent shadow-[0_0_18px_-6px_var(--color-accent)]">
      <Sparkles className="size-4" />
    </span>
  );
}

function BudgetMeter({ used }: { used: number }) {
  return (
    <div className="w-full max-w-[220px]">
      <div className="flex items-center justify-between font-body text-[12px]">
        <span className="text-ink-faint">Crédit IA du mois</span>
        <span className={cn(used >= 90 ? "text-red-400" : "text-ink-muted")}>{100 - used}% restant</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${Math.max(2, 100 - used)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-1 font-body text-[11px] text-ink-faint">Se recharge le 1er de chaque mois.</p>
    </div>
  );
}

// ───────────────────────── Minimal markdown for the coach's replies:
// code blocks (with copy), lists, short headings, **bold** and `code`.

function Markdown({ text }: { text: string }) {
  const parts = text.split(/```([\w-]*)\n?([\s\S]*?)(?:```|$)/g);
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]?.trim()) nodes.push(<TextBlocks key={`t${i}`} text={parts[i]} />);
    const code = parts[i + 2];
    if (code?.trim()) {
      const lang = parts[i + 1];
      nodes.push(
        <div key={`c${i}`} className="my-1">
          <PromptBlock label={lang && lang !== "text" ? lang : "Prompt à copier"} text={code.trimEnd()} />
        </div>
      );
    }
  }
  return <div className="flex flex-col gap-3 font-body text-[14.5px] leading-relaxed text-ink/90">{nodes}</div>;
}

type Block = { kind: "p" | "ul" | "ol"; lines: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

/** Groups lines into paragraphs and lists, so "À surveiller :" followed by bullets renders as text + list. */
function toBlocks(text: string) {
  const blocks: Block[] = [];
  for (const line of text.trim().split("\n")) {
    if (!line.trim()) {
      blocks.push({ kind: "p", lines: [] });
      continue;
    }
    const kind = BULLET.test(line) ? "ul" : NUMBERED.test(line) ? "ol" : "p";
    const last = blocks[blocks.length - 1];
    if (last && last.kind === kind && (kind !== "p" || last.lines.length)) last.lines.push(line);
    else blocks.push({ kind, lines: [line] });
  }
  return blocks.filter((b) => b.lines.length);
}

function TextBlocks({ text }: { text: string }) {
  return (
    <>
      {toBlocks(text).map((block, i) => {
        if (block.kind === "ul") {
          return (
            <ul key={i} className="flex flex-col gap-1.5">
              {block.lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>
                    <Inline text={l.replace(BULLET, "")} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === "ol") {
          return (
            <ol key={i} className="flex flex-col gap-2">
              {block.lines.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-[10.5px] text-accent">
                    {l.match(/^\s*(\d+)/)?.[1]}
                  </span>
                  <span>
                    <Inline text={l.replace(NUMBERED, "")} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((l, j) => {
              const heading = l.match(/^#{1,4}\s+(.*)$/);
              return (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {heading ? (
                    <strong className="font-display text-[15px] font-semibold text-ink">{heading[1]}</strong>
                  ) : (
                    <Inline text={l} />
                  )}
                </Fragment>
              );
            })}
          </p>
        );
      })}
    </>
  );
}

function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.startsWith("**") && t.endsWith("**") && t.length > 4) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {t.slice(2, -2)}
            </strong>
          );
        }
        if (t.startsWith("`") && t.endsWith("`") && t.length > 2) {
          return (
            <code key={i} className="rounded-[6px] bg-ink/[0.08] px-1.5 py-0.5 font-mono text-[12.5px] text-accent-light">
              {t.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={i}>{t}</Fragment>;
      })}
    </>
  );
}
