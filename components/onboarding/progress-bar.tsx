export function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = Math.min(100, Math.round((step / (total - 1)) * 100));
  return (
    <div className="h-[3px] w-full rounded-full bg-ink/8">
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
