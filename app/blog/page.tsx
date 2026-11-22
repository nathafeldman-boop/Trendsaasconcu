import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { PostCard } from "@/components/blog/post-card";
import { BlogCta } from "@/components/blog/blog-cta";
import { CATEGORIES, publishedPosts } from "@/lib/blog";
import type { BlogCategory } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

// Re-rendered every hour, so a post scheduled for today appears on its own.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Créer un SaaS avec l'IA, sans savoir coder | SaaSFounder",
  description:
    "Guides pour créer ton SaaS avec l'IA : trouver une idée, construire sans coder, encaisser avec Stripe et trouver tes premiers clients.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const requested = (await searchParams).categorie;
  const category = requested && requested in CATEGORIES ? (requested as BlogCategory) : null;
  const posts = publishedPosts().filter((p) => !category || p.category === category);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Le blog</p>
        <h1 className="mt-4 max-w-3xl font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[52px]">
          Créer ton SaaS avec l&apos;IA, <span className="text-ink-faint">de l&apos;idée au premier client.</span>
        </h1>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Catégories">
          {[{ id: null, label: "Tout" }, ...Object.entries(CATEGORIES).map(([id, c]) => ({ id, label: c.label }))].map((c) => (
            <Link
              key={c.label}
              href={c.id ? `/blog?categorie=${c.id}` : "/blog"}
              className={cn(
                "rounded-full border px-4 py-2 font-body text-[13px] transition-colors",
                category === c.id ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/12 text-ink-muted hover:text-ink"
              )}
            >
              {c.label}
            </Link>
          ))}
        </nav>
        {category && <p className="mt-4 font-body text-[15px] text-ink-muted">{CATEGORIES[category].description}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-14">
          <BlogCta />
        </div>
      </main>
      <Footer />
    </>
  );
}
