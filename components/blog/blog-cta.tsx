import { CtaButton } from "@/components/landing/cta-button";

/** The article's way into the product: the free questionnaire. */
export function BlogCta() {
  return (
    <div className="my-4 rounded-[18px] border border-ink/10 bg-ink/[0.03] px-6 py-7 text-center">
      <p className="font-display text-[22px] font-semibold leading-tight tracking-[-0.03em] text-ink">
        Trouve l&apos;idée de SaaS faite pour toi
      </p>
      <p className="mx-auto mt-2 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
        Réponds à quelques questions : tu reçois ton idée, le prompt qui construit ton site et ton plan pour trouver tes premiers
        clients. Le questionnaire est gratuit.
      </p>
      <CtaButton from="blog" className="mt-5" />
    </div>
  );
}
