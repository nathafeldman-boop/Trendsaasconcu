import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { TwoTone } from "@/components/landing/cta-button";
import { publishedPosts } from "@/lib/blog";

/** The three latest guides, so the home page links into the blog. */
export function LatestPosts() {
  const posts = publishedPosts().slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Le blog</p>
      <h2 className="mt-4 max-w-2xl font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[42px]">
        <TwoTone strong="Nos guides" soft="pour lancer ton business." />
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Link href="/blog" className="mt-6 inline-block font-body text-[14px] text-accent hover:underline">
        Tous les articles →
      </Link>
    </section>
  );
}
