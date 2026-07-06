import { Toaster as SonnerToaster, toast } from "sonner";

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--app-popover)",
          color: "var(--app-primary)",
          border: "1px solid var(--app-separator)",
        },
      }}
    />
  );
}
