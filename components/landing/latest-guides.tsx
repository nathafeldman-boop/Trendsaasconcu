import Link from "next/link";
import { latestSeoPages } from "@/lib/seo/store";
import { FAMILIES } from "@/lib/seo/topics";

/**
 * The latest generated guides (lib/seo), linked from the home page: the page
 * search engines visit most, so new guides are found the hour they go live.
 */
export async function LatestGuides() {
  const pages = await latestSeoPages(24);
  if (!pages.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Nouveaux guides</p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <li key={`${p.family}/${p.slug}`}>
            <Link
              href={`${FAMILIES[p.family].path}/${p.slug}`}
              className="block h-full rounded-[12px] border border-ink/10 px-4 py-3 font-body text-[14px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-body text-[14px]">
        {Object.values(FAMILIES).map((f) => (
          <Link key={f.path} href={f.path} className="text-accent hover:underline">
            {f.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
