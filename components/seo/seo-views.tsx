import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleBody, slugifyHeading } from "@/components/blog/article-body";
import { BlogCta } from "@/components/blog/blog-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getSeoPage, listSeoPages, relatedSeoPages } from "@/lib/seo/store";
import { FAMILIES, type SeoFamily } from "@/lib/seo/topics";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// The generated SEO pages (lib/seo): one article view and one hub view,
// shared by the four families. Content is rendered as React text through
// the blog's light Markdown, never as HTML.

const FAMILY_ORDER: SeoFamily[] = ["idees", "application", "argent", "glossaire"];

export async function seoPageMetadata(family: SeoFamily, slug: string): Promise<Metadata> {
  const page = await getSeoPage(family, slug);
  if (!page) return { robots: { index: false } };
  const path = `${FAMILIES[family].path}/${slug}`;
  return {
    title: page.title.length > 55 ? page.title : `${page.title} | SaaSFounder`,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { type: "article", title: page.title, description: page.description, url: path, publishedTime: page.published_at },
  };
}

export async function SeoArticle({ family, slug }: { family: SeoFamily; slug: string }) {
  const page = await getSeoPage(family, slug);
  if (!page) notFound();
  const meta = FAMILIES[family];
  const url = `${SITE_URL}${meta.path}/${slug}`;
  const { content } = page;
  const related = await relatedSeoPages(family, slug, 6);
  const date = page.published_at.slice(0, 10);

  const structured: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      datePublished: date,
      dateModified: date,
      inLanguage: "fr-FR",
      mainEntityOfPage: url,
      url,
      image: `${SITE_URL}/opengraph-image`,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: meta.label, item: `${SITE_URL}${meta.path}` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const body = (sections: typeof content.sections) => sections.map((s) => `## ${s.heading}\n\n${s.body}`).join("\n\n");
  const firstPart = body(content.sections.slice(0, 2));
  const rest = body(content.sections.slice(2));

  return (
    <>
      <JsonLd data={structured} />
      <Nav />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-8">
        <nav className="font-body text-[13px] text-ink-faint" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-ink">
            Accueil
          </Link>{" "}
          /{" "}
          <Link href={meta.path} className="hover:text-ink">
            {meta.label}
          </Link>
        </nav>

        <article className="mt-6">
          <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[44px]">{page.title}</h1>
          <div className="mt-5">
            <ArticleBody body={content.intro} />
          </div>

          <nav className="mt-6 rounded-[14px] border border-ink/10 p-5" aria-label="Sommaire">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Sommaire</p>
            <ol className="mt-3 flex flex-col gap-1.5 font-body text-[14.5px]">
              {content.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${slugifyHeading(s.heading)}`} className="text-ink-muted hover:text-accent">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-8">
            <ArticleBody body={firstPart} />
            <div className="my-8">
              <BlogCta />
            </div>
            <ArticleBody body={rest} />
          </div>

          <section className="mt-12">
            <h2 className="font-display text-[26px] font-semibold tracking-[-0.03em] text-ink">Questions fréquentes</h2>
            <div className="mt-4 flex flex-col gap-4">
              {content.faq.map((f) => (
                <div key={f.q} className="rounded-[14px] border border-ink/10 p-5">
                  <h3 className="font-body text-[16px] font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 font-body text-[15.5px] leading-relaxed text-ink-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12">
            <BlogCta />
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">Dans la même rubrique</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`${meta.path}/${r.slug}`}
                    className="block h-full rounded-[14px] border border-ink/10 p-4 font-body text-[15px] text-ink transition-colors hover:border-accent/40"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <OtherFamilies current={family} />
      </main>
      <Footer />
    </>
  );
}

function OtherFamilies({ current }: { current?: SeoFamily }) {
  return (
    <nav className="mt-12 flex flex-wrap gap-2" aria-label="Rubriques">
      {FAMILY_ORDER.filter((f) => f !== current).map((f) => (
        <Link key={f} href={FAMILIES[f].path} className="rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-muted hover:text-ink">
          {FAMILIES[f].label}
        </Link>
      ))}
      <Link href="/blog" className="rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-muted hover:text-ink">
        Le blog
      </Link>
    </nav>
  );
}

export function seoHubMetadata(family: SeoFamily): Metadata {
  const meta = FAMILIES[family];
  return {
    title: `${meta.hubTitle} | SaaSFounder`,
    description: meta.hubDescription,
    alternates: { canonical: meta.path },
  };
}

export async function SeoHub({ family }: { family: SeoFamily }) {
  const meta = FAMILIES[family];
  const pages = (await listSeoPages(family)).sort((a, b) => a.title.localeCompare(b.title, "fr"));
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">{meta.label}</p>
        <h1 className="mt-4 max-w-3xl font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[48px]">
          {meta.hubTitle}
        </h1>
        <p className="mt-4 max-w-2xl font-body text-[17px] leading-relaxed text-ink-muted">{meta.hubDescription}</p>
        {pages.length === 0 ? (
          <p className="mt-10 font-body text-[15px] text-ink-muted">Les premiers guides arrivent très bientôt.</p>
        ) : (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`${meta.path}/${p.slug}`}
                  className="block h-full rounded-[14px] border border-ink/10 p-4 font-body text-[15px] text-ink transition-colors hover:border-accent/40"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-14">
          <BlogCta />
        </div>
        <OtherFamilies current={family} />
      </main>
      <Footer />
    </>
  );
}
