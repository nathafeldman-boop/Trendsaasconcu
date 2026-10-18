import { cn } from "@/lib/utils";

// Splits a line into words that each come in from a blur, one after the
// other. CSS-only (see the blur-reveal keyframes in globals.css), so it runs
// on first paint without waiting for hydration.
export function BlurReveal({
  text,
  delay = 0,
  step = 70,
  className,
}: {
  text: string;
  delay?: number;
  step?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className={cn("inline-block animate-blur-reveal", className)}
            style={{ animationDelay: `${delay + index * step}ms` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
