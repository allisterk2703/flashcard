// Excel-like table view of a collection: cells are edited inline and a blank
// row at the bottom appends new cards without opening a dialog.

import * as React from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "../components/ui";
import { addCard, updateCard, type Flashcard } from "./store";
import { deleteCardWithUndo } from "./card-actions";

const cellInputClass =
  "w-full bg-transparent px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:bg-control-subtle";

function focusNextInput(current: HTMLInputElement): void {
  const inputs = Array.from(
    current.closest("table")?.querySelectorAll<HTMLInputElement>("input") ?? [],
  );
  const next = inputs[inputs.indexOf(current) + 1];
  next?.focus();
}

function RowNumberCell({ value }: { value: number | null }) {
  return (
    <td className="border-r border-separator px-3 py-2 text-right tabular-nums text-tertiary select-none">
      {value}
    </td>
  );
}

function CardRow({
  collectionId,
  card,
  index,
}: {
  collectionId: string;
  card: Flashcard;
  index: number;
}) {
  const [front, setFront] = React.useState(card.front);
  const [back, setBack] = React.useState(card.back);
  // Escape blurs the input before React re-renders the reverted state, so the
  // blur commit would still see the draft; this flag makes it a no-op instead.
  const cancelled = React.useRef(false);

  React.useEffect(() => {
    setFront(card.front);
    setBack(card.back);
  }, [card.front, card.back]);

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (front.trim() === card.front && back.trim() === card.back) return;
    if (!front.trim() || !back.trim()) {
      // A card can't have an empty side: revert instead of saving.
      setFront(card.front);
      setBack(card.back);
      return;
    }
    updateCard(collectionId, card.id, front, back);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") focusNextInput(event.currentTarget);
    else if (event.key === "Escape") {
      cancelled.current = true;
      setFront(card.front);
      setBack(card.back);
      event.currentTarget.blur();
    }
  };

  return (
    <tr className="border-b border-separator">
      <RowNumberCell value={index + 1} />
      <td className="border-r border-separator">
        <input
          className={cellInputClass}
          value={front}
          onChange={(e) => setFront(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td className="border-r border-separator">
        <input
          className={cellInputClass}
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td>
        <div className="flex items-center justify-end gap-1 px-2">
          {card.mastered ? (
            <CheckCircle2 className="size-4 text-support-green" aria-label="Maîtrisée" />
          ) : null}
          <Button
            iconOnly
            variant="transparent"
            size="small"
            aria-label="Supprimer la carte"
            onClick={() => deleteCardWithUndo(collectionId, card.id)}
          >
            <Trash2 className="size-4 text-secondary" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function NewCardRow({ collectionId }: { collectionId: string }) {
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const frontRef = React.useRef<HTMLInputElement>(null);

  const tryAdd = (refocus: boolean) => {
    if (!front.trim() || !back.trim()) return;
    addCard(collectionId, front, back);
    setFront("");
    setBack("");
    if (refocus) frontRef.current?.focus();
  };

  return (
    <tr
      // Commit when focus leaves the row entirely, so tabbing between the two
      // cells doesn't add a half-typed card.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) tryAdd(false);
      }}
    >
      <RowNumberCell value={null} />
      <td className="border-r border-separator">
        <input
          ref={frontRef}
          className={cellInputClass}
          placeholder="Nouvelle carte : recto…"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") focusNextInput(e.currentTarget);
          }}
        />
      </td>
      <td className="border-r border-separator">
        <input
          className={cellInputClass}
          placeholder="verso…"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") tryAdd(true);
          }}
        />
      </td>
      <td />
    </tr>
  );
}

export function CardTable({
  collectionId,
  cards,
}: {
  collectionId: string;
  cards: Flashcard[];
}) {
  return (
    <div className="px-4 py-3">
      <table className="w-full table-fixed border-collapse rounded-lg text-sm">
        <thead>
          <tr className="border-b border-separator text-left text-secondary">
            <th className="w-12 border-r border-separator px-3 py-2 text-right font-medium">#</th>
            <th className="w-[calc(50%-4.5rem)] border-r border-separator px-3 py-2 font-medium">
              Recto
            </th>
            <th className="w-[calc(50%-4.5rem)] border-r border-separator px-3 py-2 font-medium">
              Verso
            </th>
            <th className="w-24" />
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <CardRow key={card.id} collectionId={collectionId} card={card} index={index} />
          ))}
          <NewCardRow collectionId={collectionId} />
        </tbody>
      </table>
    </div>
  );
}
