import * as React from "react";
import { cn } from "./utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-separator bg-control-subtle px-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-ring",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-20 w-full resize-y rounded-lg border border-separator bg-control-subtle px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-ring",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
