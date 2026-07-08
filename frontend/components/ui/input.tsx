/**
 * components/ui/input.tsx — Input, Textarea e Label base.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink leading-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 text-ink-muted pointer-events-none">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-xl border bg-surface text-ink text-sm",
              "placeholder:text-ink-muted transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-moss-500/50 focus:border-moss-500",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error ? "border-rose-500/60 focus:ring-rose-500/50" : "border-border",
              leftElement ? "pl-9" : "pl-3",
              rightElement ? "pr-9" : "pr-3",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 text-ink-muted pointer-events-none">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
