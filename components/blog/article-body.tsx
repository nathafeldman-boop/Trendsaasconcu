import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// Renders the blog's light Markdown. Text is always rendered as React text
// (never as HTML), so nothing in an article can inject markup.

function inline(text: string, live?: Set<string>): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1]) {
      out.push(
        <strong key={key++} className="font-semibold text-ink">
          {match[1]}
        </strong>
      );
    } else {
      const href = match[3];
      const internal = href.startsWith("/");
      const post = href.match(/^\/blog\/([a-z0-9-]+)$/)?.[1];
      // A post scheduled for later isn't online yet: keep the words, drop the link.
      if (post && live && !live.has(post)) {
        out.push(match[2]);
        last = match.index + match[0].length;
        continue;
      }
      out.push(
        internal ? (
          <Link key={key++} href={href} className="text-accent underline underline-offset-2 hover:text-accent-light">
            {match[2]}
          </Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent-light">
            {match[2]}
          </a>
        )
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function headings(body: string) {
  return body
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => ({ text: line.slice(3).trim(), id: slugifyHeading(line.slice(3)) }));
}

export function ArticleBody({ body, live }: { body: string; live?: Set<string> }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <div className="flex flex-col gap-5 font-body text-[17px] leading-[1.75] text-ink-muted">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        const first = lines[0];
        if (first.startsWith("## ")) {
          const text = first.slice(3).trim();
          return (
            <Fragment key={i}>
              <h2 id={slugifyHeading(text)} className="mt-6 scroll-mt-24 font-display text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
                {text}
              </h2>
              {lines.length > 1 && <p>{inline(lines.slice(1).join(" "), live)}</p>}
            </Fragment>
          );
        }
        if (first.startsWith("### ")) {
          return (
            <Fragment key={i}>
              <h3 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">{first.slice(4).trim()}</h3>
              {lines.length > 1 && <p>{inline(lines.slice(1).join(" "), live)}</p>}
            </Fragment>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="flex flex-col gap-2 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{inline(l.slice(2), live)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i} className="flex flex-col gap-2 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span className="w-6 shrink-0 font-mono text-[14px] leading-[1.75rem] text-accent">{j + 1}.</span>
                  <span>{inline(l.replace(/^\d+\. /, ""), live)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (lines.every((l) => l.startsWith("> "))) {
          return (
            <aside key={i} className="rounded-[14px] border border-accent/25 bg-accent/[0.06] px-5 py-4 text-ink">
              {inline(lines.map((l) => l.slice(2)).join(" "), live)}
            </aside>
          );
        }
        return <p key={i}>{inline(lines.join(" "), live)}</p>;
      })}
    </div>
  );
}
