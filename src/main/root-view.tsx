import { Outlet } from "@tanstack/react-router";
import { SplitView } from "../components/ui";
import { useTheme } from "../hooks";
import { CollectionsSidebar } from "./collections-sidebar";

export function RootView() {
  useTheme();

  return (
    <div className="h-full relative [&:not(:has([data-toolbar]))_.drag-region]:z-50">
      {/* Draggable top bar - fallback for when no toolbar is present */}
      <div className="drag-region pointer-events-none fixed top-0 left-0 right-0 h-13" />
      <SplitView className="h-full" storageKey="flashcards" sidebar={<CollectionsSidebar />}>
        <Outlet />
      </SplitView>
    </div>
  );
}
