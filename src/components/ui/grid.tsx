import * as React from "react";
import { cn } from "./utils";

interface GridContextValue<T> {
  selectedItem: T | null;
  onSelectedItemChange?: (item: T | null) => void;
}

const GridContext = React.createContext<GridContextValue<unknown>>({ selectedItem: null });

interface RootProps<T> {
  items: T[];
  selectedItem?: T | null;
  onSelectedItemChange?: (item: T | null) => void;
  getItemKey: (item: T) => string;
  columns: number;
  autoFocus?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Root<T>({
  selectedItem = null,
  onSelectedItemChange,
  columns,
  autoFocus,
  className,
  children,
}: RootProps<T>) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoFocus) {
      ref.current?.querySelector("button")?.focus();
    }
  }, [autoFocus]);

  return (
    <GridContext.Provider
      value={{ selectedItem, onSelectedItemChange: onSelectedItemChange as GridContextValue<unknown>["onSelectedItemChange"] }}
    >
      <div
        ref={ref}
        role="grid"
        className={cn("grid", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </GridContext.Provider>
  );
}

interface ItemProps<T> {
  item: T;
  onAction?: (item: T) => void;
  className?: string;
  children: React.ReactNode;
}

function Item<T>({ item, onAction, className, children }: ItemProps<T>) {
  const { selectedItem, onSelectedItemChange } = React.useContext(GridContext);
  const selected = selectedItem === item;

  return (
    <button
      type="button"
      onClick={() => {
        onSelectedItemChange?.(item);
        onAction?.(item);
      }}
      className={cn(selected && "bg-control ring-1 ring-ring", className)}
    >
      {children}
    </button>
  );
}

export const Grid = { Root, Item };
