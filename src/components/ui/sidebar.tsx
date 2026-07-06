import * as React from "react";
import { cn } from "./utils";

export interface SidebarProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Sidebar({ actions, children }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Space for the traffic lights + window drag */}
      <div className="drag-region flex h-13 shrink-0 items-end justify-end px-2 pb-1">
        {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">{children}</div>
    </div>
  );
}

export interface SidebarListProps<T> {
  items: T[];
  getItemKey: (item: T) => string;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarList<T>({ items, emptyState, children }: SidebarListProps<T>) {
  if (items.length === 0) {
    return <div className="h-full">{emptyState}</div>;
  }
  return <ul className="flex flex-col gap-0.5">{children}</ul>;
}

export interface SidebarListItemProps {
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  title: string;
  accessory?: React.ReactNode;
}

export function SidebarListItem({ selected, onClick, icon, title, accessory }: SidebarListItemProps) {
  return (
    <li className="group">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm text-primary outline-none transition-colors",
          selected ? "bg-control" : "hover:bg-control-subtle",
        )}
      >
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center text-secondary [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span className="flex-1 truncate text-left">{title}</span>
        {accessory}
      </div>
    </li>
  );
}

export function SidebarListItemAccessory({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("flex shrink-0 items-center gap-1 text-xs text-secondary tabular-nums", className)}
      {...props}
    />
  );
}
