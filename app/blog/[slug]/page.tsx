import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { ArticleBody, headings } from "@/components/blog/article-body";
import { BlogCta } from "@/components/blog/blog-cta";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORIES, formatDate, getPost, publishedPosts, readingMinutes, relatedPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title.length > 55 ? post.title : `${post.title} | SaaSFounder`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${post.slug}`, publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const toc = headings(post.body);
  const live = new Set(publishedPosts().map((p) => p.slug));
  // The call to action sits after the second section, then again at the end.
  const sections = post.body.split(/\n(?=## )/);
  const firstPart = sections.slice(0, 3).join("\n");
  const rest = sections.slice(3).join("\n");

  const structured: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
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
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faq?.length) {
    structured.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

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
          <Link href="/blog" className="hover:text-ink">
            Blog
          </Link>{" "}
          /{" "}
          <Link href={`/blog?categorie=${post.category}`} className="hover:text-ink">
            {CATEGORIES[post.category].label}
          </Link>
        </nav>

        <article className="mt-6">
          <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[46px]">{post.title}</h1>
          <p className="mt-4 font-body text-[18px] leading-relaxed text-ink-muted">{post.description}</p>
          <p className="mt-4 font-body text-[13px] text-ink-faint">
            Publié le <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min de lecture
          </p>

          {toc.length > 2 && (
            <nav className="mt-8 rounded-[14px] border border-ink/10 p-5" aria-label="Sommaire">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Sommaire</p>
              <ol className="mt-3 flex flex-col gap-1.5 font-body text-[14.5px]">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink-muted hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-8">
            <ArticleBody body={firstPart} live={live} />
            {rest && (
              <>
                <div className="my-8">
                  <BlogCta />
                </div>
                <ArticleBody body={rest} live={live} />
              </>
            )}
          </div>

          {post.faq?.length ? (
            <section className="mt-12">
              <h2 className="font-display text-[26px] font-semibold tracking-[-0.03em] text-ink">Questions fréquentes</h2>
              <div className="mt-4 flex flex-col gap-4">
                {post.faq.map((f) => (
                  <div key={f.q} className="rounded-[14px] border border-ink/10 p-5">
                    <h3 className="font-body text-[16px] font-semibold text-ink">{f.q}</h3>
                    <p className="mt-2 font-body text-[15.5px] leading-relaxed text-ink-muted">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-12">
            <BlogCta />
          </div>
        </article>

        <section className="mt-14">
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">À lire ensuite</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {relatedPosts(post, 4).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
