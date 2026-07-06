import { EmptyState } from "../components/ui";

export function HomeView() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        title="Vos cartes mémoire"
        description="Sélectionnez une collection dans la barre latérale, ou créez-en une avec le bouton +."
      />
    </div>
  );
}
