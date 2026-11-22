import type { BlogCategory, BlogPost } from "@/lib/blog/types";
import { POSTS_1 } from "@/lib/blog/posts/batch-1";
import { POSTS_2 } from "@/lib/blog/posts/batch-2";
import { POSTS_3 } from "@/lib/blog/posts/batch-3";
import { POSTS_4 } from "@/lib/blog/posts/batch-4";
import { POSTS_5 } from "@/lib/blog/posts/batch-5";
import { POSTS_6 } from "@/lib/blog/posts/batch-6";

export const CATEGORIES: Record<BlogCategory, { label: string; description: string }> = {
  idees: { label: "Trouver son idée", description: "Trouver, choisir et valider une idée de SaaS qui se vend." },
  creer: { label: "Créer avec l'IA", description: "Construire ton SaaS sans savoir coder, avec les bons outils IA." },
  lancer: { label: "Lancer", description: "Mettre ton SaaS en ligne : MVP, site, paiements, aspects légaux." },
  vendre: { label: "Trouver des clients", description: "Tes premiers clients : TikTok, landing page, prospection." },
  argent: { label: "Revenus", description: "Prix, abonnements, MRR : comprendre l'argent d'un SaaS." },
};

const ALL: BlogPost[] = [...POSTS_1, ...POSTS_2, ...POSTS_3, ...POSTS_4, ...POSTS_5, ...POSTS_6];

/** Today in Paris as YYYY-MM-DD: posts go live on their date, French time. */
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

export function publishedPosts(): BlogPost[] {
  const now = today();
  return ALL.filter((p) => p.date <= now).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export function getPost(slug: string): BlogPost | null {
  return publishedPosts().find((p) => p.slug === slug) ?? null;
}

export function relatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const others = publishedPosts().filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, count);
}

export function readingMinutes(post: BlogPost) {
  return Math.max(2, Math.round(post.body.split(/\s+/).length / 220));
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Every post, published or not: for checks only (duplicate slugs, links). */
export function allPostsForChecks() {
  return ALL;
}
