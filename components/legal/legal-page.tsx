import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto max-w-2xl px-5 pb-24 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Dernière mise à jour : {updatedAt}
        </p>
        <div className="prose-legal mt-8 flex flex-col gap-6 font-body text-[15px] leading-relaxed text-ink-muted [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
