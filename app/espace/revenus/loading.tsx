// Reading the member's Stripe account can take a few seconds.
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Revenus</p>
        <p className="mt-3 font-display text-[30px] font-semibold text-ink sm:text-[36px]">Lecture de ton Stripe...</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="glass-panel h-[108px] animate-pulse rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}
