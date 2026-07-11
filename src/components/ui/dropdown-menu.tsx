import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive, Popover as PopoverPrimitive } from "radix-ui";
import { Pencil, Trash2, RotateCcw, FileDown, FileSpreadsheet, Check, type LucideIcon } from "lucide-react";
import { cn } from "./utils";

const ITEM_ICONS: Record<string, LucideIcon> = {
  pencil: Pencil,
  trash: Trash2,
  "arrow.counterclockwise": RotateCcw,
  "arrow.down.doc": FileDown,
  tablecells: FileSpreadsheet,
  checkmark: Check,
};

const contentClass =
  "z-50 min-w-40 rounded-xl bg-popover p-1 shadow-xl border border-separator focus:outline-none";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  align,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={4}
        className={cn(contentClass, className)}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
  icon?: string;
  color?: "red";
}

export function DropdownMenuItem({
  icon,
  color,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const Icon = icon ? ITEM_ICONS[icon] : undefined;
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-primary outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        color === "red" && "text-support-red data-[highlighted]:bg-support-red data-[highlighted]:text-white",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="size-4" /> : null}
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-separator", className)}
      {...props}
    />
  );
}

// Popover-based variant for fully custom dropdown content (e.g. the emoji picker).
// modal: takes over the scroll lock when opened inside a Dialog, so the
// popover content itself stays scrollable.
export function CustomDropdownMenu(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root modal {...props} />;
}
export const CustomDropdownMenuTrigger = PopoverPrimitive.Trigger;

export function CustomDropdownMenuContent({
  className,
  align,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={4}
        className={cn(contentClass, className)}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
