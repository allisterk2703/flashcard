import * as React from "react";
import { cn } from "./utils";

export interface FieldProps {
  label?: string;
  description?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}

export function Field({ label, description, orientation = "horizontal", className, children }: FieldProps) {
  if (label === undefined && description === undefined) {
    // Composition mode: FieldLabel / FieldContent children.
    return (
      <div
        className={cn(
          "flex gap-2 py-2",
          orientation === "horizontal" ? "items-center justify-between" : "flex-col",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-1.5 py-2",
        orientation === "horizontal" ? "items-center justify-between" : "flex-col",
        className,
      )}
    >
      {label ? <span className="text-sm font-medium text-primary">{label}</span> : null}
      {children}
      {description ? <span className="text-xs text-secondary">{description}</span> : null}
    </div>
  );
}

export function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-primary", className)} {...props} />;
}

export function FieldContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 min-w-0", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function FieldSet({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl bg-control-subtle px-4 py-1 border border-separator", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("flex items-center gap-1.5 text-sm text-primary", className)} {...props} />;
}
