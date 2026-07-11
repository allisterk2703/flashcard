// Card deletion with undo: shows a toast whose "Annuler" action restores the
// card. Used by both the list and table views.

import { toast } from "../components/ui";
import { deleteCard, undoDeleteCard } from "./store";

export function deleteCardWithUndo(collectionId: string, cardId: string): void {
  deleteCard(collectionId, cardId);
  toast("Carte supprimée", {
    action: {
      label: "Annuler",
      onClick: () => {
        if (undoDeleteCard(cardId)) toast.success("Carte rétablie");
      },
    },
  });
}
