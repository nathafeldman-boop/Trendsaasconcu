import Link from "next/link";
import { CATEGORIES, formatDate, readingMinutes } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog/types";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-[16px] border border-ink/10 bg-ink/[0.02] p-5 transition-colors hover:border-accent/40 hover:bg-ink/[0.04]"
    >
      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">{CATEGORIES[post.category].label}</span>
      <span className="mt-2 font-display text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink group-hover:text-accent-light">
        {post.title}
      </span>
      <span className="mt-2 line-clamp-3 font-body text-[14px] leading-relaxed text-ink-muted">{post.description}</span>
      <span className="mt-auto pt-4 font-body text-[12.5px] text-ink-faint">
        {formatDate(post.date)} · {readingMinutes(post)} min de lecture
      </span>
    </Link>
  );
}
