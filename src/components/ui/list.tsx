import * as React from "react";
import { cn } from "./utils";

interface RootProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  getItemKey: (item: T) => string;
}

function Root<T>({ items: _items, getItemKey: _getItemKey, className, children, ...props }: RootProps<T>) {
  return (
    <div className={cn(className)} {...props}>
      <ul className="divide-y divide-separator overflow-hidden rounded-xl border border-separator bg-control-subtle">
        {children}
      </ul>
    </div>
  );
}

interface ItemProps<T> {
  item: T;
  onClick?: () => void;
  children: React.ReactNode;
}

function Item<T>({ onClick, children }: ItemProps<T>) {
  return (
    <li
      onClick={onClick}
      className="flex cursor-default items-center gap-3 px-4 py-2.5 transition-colors hover:bg-control-subtle"
    >
      {children}
    </li>
  );
}

function ItemContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("truncate text-sm font-medium text-primary", className)} {...props} />;
}

function ItemDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("truncate text-sm text-secondary", className)} {...props} />;
}

function ItemAccessory({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex shrink-0 items-center gap-1", className)} {...props} />;
}

export const List = { Root, Item, ItemContent, ItemTitle, ItemDescription, ItemAccessory };
