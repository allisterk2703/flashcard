import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// ── SplitView ───────────────────────────────────────────────────────────

export interface SplitViewProps {
  className?: string;
  storageKey?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 240;

export function SplitView({ className, storageKey, sidebar, children }: SplitViewProps) {
  const persistKey = storageKey ? `splitview.${storageKey}.width` : null;
  const [width, setWidth] = React.useState<number>(() => {
    if (!persistKey) return SIDEBAR_DEFAULT;
    const saved = Number(localStorage.getItem(persistKey));
    return Number.isFinite(saved) && saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX
      ? saved
      : SIDEBAR_DEFAULT;
  });

  const startDrag = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;

    const onMove = (e: MouseEvent) => {
      const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + e.clientX - startX));
      setWidth(next);
      if (persistKey) localStorage.setItem(persistKey, String(next));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={cn("flex min-h-0", className)}>
      <aside style={{ width }} className="relative shrink-0 border-r border-separator">
        {sidebar}
        <div
          className="absolute right-[-3px] top-0 z-10 h-full w-1.5 cursor-col-resize"
          onMouseDown={startDrag}
        />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

// ── ScrollArea ──────────────────────────────────────────────────────────

export interface ScrollAreaProps {
  className?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function ScrollArea({ className, toolbar, children }: ScrollAreaProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {toolbar}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────────────

export interface EmptyStateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 p-6 text-center">
      <p className="text-base font-semibold text-primary">{title}</p>
      {description ? <p className="max-w-sm text-sm text-secondary">{description}</p> : null}
      {actions ? <div className="mt-3 flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// ── Text ────────────────────────────────────────────────────────────────

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-sm",
      small: "text-xs",
      large: "text-lg",
      heading1: "text-3xl font-bold",
    },
    color: {
      default: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof textVariants> {}

export function Text({ className, variant, color, ...props }: TextProps) {
  return <p className={cn(textVariants({ variant, color }), className)} {...props} />;
}

// ── Separator ───────────────────────────────────────────────────────────

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("h-px border-0 bg-separator", className)} {...props} />;
}

// ── Keyboard keys ───────────────────────────────────────────────────────

export function Key({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded bg-control-subtle px-1.5 font-sans text-xs text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function KeyGroup({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-0.5", className)} {...props} />;
}

// ── Error boundary view (route-level error display) ─────────────────────

export function ErrorBoundaryView({ error }: { error?: unknown }) {
  const message = error instanceof Error ? error.message : String(error ?? "Erreur inconnue");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-base font-semibold text-primary">Une erreur est survenue</p>
      <p className="max-w-md text-sm text-secondary">{message}</p>
    </div>
  );
}
