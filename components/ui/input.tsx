import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-[52px] rounded-lg border border-white/12 bg-white/[0.03] px-4 font-body text-[15px] text-ink placeholder:text-ink-faint outline-none transition-colors duration-150",
            "focus:border-accent/60 focus:bg-white/[0.05]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
