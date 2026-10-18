export function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = Math.min(100, Math.round((step / Math.max(1, total - 1)) * 100));
  return (
    <div className="h-[3px] w-full rounded-full bg-ink/8">
      <div
        className="relative h-full rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)] transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      >
        <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
      </div>
    </div>
  );
}
