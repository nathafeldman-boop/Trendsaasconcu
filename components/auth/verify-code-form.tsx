"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloatingIcon } from "@/components/ui/floating-icon";
import { createClient } from "@/lib/supabase/client";

export function VerifyCodeForm({
  email,
  onSuccess,
  autoResend = false,
}: {
  email: string;
  onSuccess: () => void;
  autoResend?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (autoResend) handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) return;

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim();
    if (!code) return;

    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setLoading(false);

    if (verifyError) {
      setError("Code invalide ou expiré. Vérifie le code ou demandes-en un nouveau.");
      return;
    }
    onSuccess();
  }

  async function handleResend() {
    const supabase = createClient();
    if (!supabase) return;
    setError(null);
    setResent(false);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FloatingIcon>
        <MailCheck className="size-5" strokeWidth={1.75} />
      </FloatingIcon>
      <p className="font-body text-[14px] leading-relaxed text-ink-muted">
        On a envoyé un code à 6 chiffres à <span className="text-ink">{email}</span>. Entre-le
        ci-dessous pour activer ton compte.
      </p>
      <Input
        label="Code de vérification"
        name="code"
        inputMode="numeric"
        placeholder="123456"
        maxLength={6}
        autoComplete="one-time-code"
        required
      />
      {error && <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
      <Button type="submit" showArrow={false} disabled={loading} className="w-full">
        {loading ? "Vérification..." : "Valider mon compte"}
      </Button>
      <button
        type="button"
        onClick={handleResend}
        className="text-center font-body text-[13px] text-ink-faint underline underline-offset-2 hover:text-ink-muted"
      >
        {resent ? "Code renvoyé !" : "Renvoyer le code"}
      </button>
    </form>
  );
}
