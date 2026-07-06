import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap gap-1.5 rounded-pill border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:cursor-default [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-control-subtle text-primary hover:bg-control active:bg-control",
        glass: "bg-glass text-primary hover:bg-control-subtle active:bg-control",
        accent: "bg-accent text-accent-foreground hover:opacity-90 active:opacity-80",
        transparent: "bg-transparent text-primary hover:bg-control-subtle active:bg-control",
        destructive: "bg-support-red text-white hover:opacity-90 active:opacity-80",
      },
      size: {
        small: "h-6 px-2 text-xs",
        default: "h-8 px-3 text-sm",
        large: "h-9 px-4 text-sm",
      },
      iconOnly: {
        true: "p-0",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "small", className: "w-6" },
      { iconOnly: true, size: "default", className: "w-8" },
      { iconOnly: true, size: "large", className: "w-9" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconOnly, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
