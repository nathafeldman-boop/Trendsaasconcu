import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-body font-semibold transition-all duration-200 ease-out hover:scale-[1.025] active:scale-[0.94] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "overflow-hidden bg-accent text-canvas shadow-[0_0_28px_-8px_var(--color-accent),inset_0_1px_0_rgba(255,255,255,0.55)] hover:bg-accent-light hover:shadow-[0_0_40px_-6px_var(--color-accent),inset_0_1px_0_rgba(255,255,255,0.6)]",
        secondary:
          "border border-ink/12 text-ink bg-ink/[0.04] backdrop-blur-sm hover:border-accent/45 hover:bg-accent/10 hover:text-accent",
        ghost: "text-ink-muted hover:text-ink",
      },
      size: {
        default: "h-[52px] px-7 text-[15px]",
        sm: "h-10 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type ButtonBaseProps = VariantProps<typeof buttonStyles> & {
  className?: string;
  showArrow?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { className, variant, size, showArrow = true, children, ...rest } = props;

  const isPrimary = (variant ?? "primary") === "primary";

  const content = (
    <>
      {isPrimary && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      )}
      <span className="relative">{children}</span>
      {showArrow && (
        <ArrowRight
          className="relative size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={cn(buttonStyles({ variant, size }), className)}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
