import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "./utils";

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  orientation?: "horizontal" | "vertical";
}

export function RadioGroup({ className, orientation = "vertical", ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex gap-3", orientation === "vertical" && "flex-col", className)}
      {...props}
    />
  );
}

export function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border border-separator bg-control-subtle outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-1.5 rounded-full bg-accent-foreground" />
    </RadioGroupPrimitive.Item>
  );
}
