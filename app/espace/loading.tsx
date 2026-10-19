// Shown the instant a tab is clicked, while the server prepares it: the
// sidebar stays put and the click feels immediate.
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12" aria-busy="true">
      <div>
        <div className="h-3 w-28 animate-pulse rounded-full bg-accent/25" />
        <div className="mt-4 h-9 w-2/3 animate-pulse rounded-[12px] bg-ink/[0.07]" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-ink/[0.05]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="glass-panel h-40 animate-pulse rounded-[20px]" />
        ))}
      </div>
      <div className="glass-panel h-72 animate-pulse rounded-[26px]" />
    </div>
  );
}
