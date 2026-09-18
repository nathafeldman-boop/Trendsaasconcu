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
          "bg-ink text-canvas hover:bg-accent hover:shadow-[0_0_32px_-6px_var(--color-accent)]",
        secondary:
          "border border-ink/15 text-ink bg-ink/[0.02] hover:border-accent/50 hover:bg-accent/[0.08] hover:shadow-[0_0_24px_-8px_var(--color-accent)]",
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

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
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
