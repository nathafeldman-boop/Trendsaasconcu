import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Logo } from "@/components/ui/logo";
import { ProgressBar } from "@/components/onboarding/progress-bar";

export function StepShell({
  step,
  total,
  onBack,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-5 py-6 sm:px-8">
        <Logo />
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 px-5 pb-16 sm:px-8">
        <ProgressBar step={step} total={total} />

        <div className="mt-6 h-5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 font-body text-[13px] text-ink-faint transition-colors hover:text-ink-muted"
            >
              <ArrowLeft className="size-3.5" />
              Question précédente
            </button>
          ) : null}
        </div>

        <div className="mt-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-[28px] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[34px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-10">{footer}</div> : null}

        <p className="mt-10 font-body text-[12px] text-ink-faint">
          Tes réponses restent sur cet appareil.{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-ink-muted">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
