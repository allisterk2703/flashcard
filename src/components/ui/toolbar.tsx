import * as React from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-toolbar
      className={cn("drag-region flex shrink-0 flex-col gap-2 px-4 pb-2 pt-3", className)}
      {...props}
    />
  );
}

export function ToolbarRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-9 items-center gap-2", className)} {...props} />;
}

export function ToolbarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}

export function ToolbarTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("truncate text-lg font-semibold text-primary", className)} {...props} />;
}

export function ToolbarActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex shrink-0 items-center gap-2", className)} {...props} />;
}

export interface ToolbarBackButtonProps {
  label?: string;
  onClick?: () => void;
}

export function ToolbarBackButton({ label, onClick }: ToolbarBackButtonProps) {
  return (
    <Button variant="glass" size="large" onClick={onClick} aria-label={label ?? "Retour"}>
      <ChevronLeft className="size-4.5" />
      {label}
    </Button>
  );
}

export interface ToolbarSearchButtonProps {
  value: string;
  onChange: (value: string) => void;
  size?: "default" | "large";
  placeholder?: string;
}

export function ToolbarSearchButton({
  value,
  onChange,
  size = "default",
  placeholder = "Rechercher…",
}: ToolbarSearchButtonProps) {
  return (
    <div
      className={cn(
        "no-drag flex w-full items-center gap-2 rounded-pill bg-control-subtle px-3 focus-within:ring-1 focus-within:ring-ring",
        size === "large" ? "h-9" : "h-8",
      )}
    >
      <Search className="size-4 shrink-0 text-secondary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-sm text-primary outline-none placeholder:text-tertiary"
      />
      {value ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={() => onChange("")}
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-control"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
