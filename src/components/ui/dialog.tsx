import * as React from "react";
import { Dialog as DialogPrimitive, AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "./utils";
import { Button } from "./button";

const overlayClass =
  "fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=open]:fade-in";
const contentClass =
  "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-dialog p-5 shadow-2xl border border-separator focus:outline-none";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  cancelLabel?: string | null;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "OK",
  confirmDisabled,
  cancelLabel = "Annuler",
  onConfirm,
  children,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content className={contentClass}>
          <DialogPrimitive.Title className="text-base font-semibold text-primary">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-secondary">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          <div className="mt-4">{children}</div>
          <div className="mt-5 flex justify-end gap-2">
            {cancelLabel !== null ? (
              <Button onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
            ) : null}
            <Button
              variant="accent"
              disabled={confirmDisabled}
              onClick={() => {
                onConfirm?.();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "accent";
  onConfirm: () => void;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "OK",
  confirmVariant = "accent",
  onConfirm,
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClass} />
        <AlertDialogPrimitive.Content className={cn(contentClass, "max-w-sm")}>
          <AlertDialogPrimitive.Title className="text-base font-semibold text-primary">
            {title}
          </AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description className="mt-1 text-sm text-secondary">
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button>Annuler</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant={confirmVariant} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
