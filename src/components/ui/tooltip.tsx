import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={400}>{children}</TooltipPrimitive.Provider>;
}
