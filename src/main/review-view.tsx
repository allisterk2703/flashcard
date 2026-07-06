import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Toolbar,
  ToolbarRow,
  ToolbarContent,
  ToolbarTitle,
  ToolbarActions,
  ToolbarBackButton,
  Button,
  Text,
  Separator,
  EmptyState,
  Key,
  KeyGroup,
  Dialog,
  Field,
  Textarea,
} from "../components/ui";
import { Check, RotateCcw, Undo2 } from "lucide-react";
import { useCollection, setCardMastered, updateCard, type Flashcard } from "./store";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ReviewView() {
  const { collectionId } = useParams({ from: "/collections/$collectionId/review" });
  const collection = useCollection(collectionId);
  const navigate = useNavigate();

  const [queue, setQueue] = React.useState<Flashcard[]>([]);
  const [total, setTotal] = React.useState(0);
  const [mastered, setMastered] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const showAnswerRef = React.useRef(showAnswer);
  showAnswerRef.current = showAnswer;

  const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null);
  const [editFront, setEditFront] = React.useState("");
  const [editBack, setEditBack] = React.useState("");

  // Mastery persists in the store, so re-reading collection.cards on every
  // grade would reset the in-progress session. Read the latest cards through
  // a ref instead, and only (re)build the session when the route changes.
  const collectionRef = React.useRef(collection);
  collectionRef.current = collection;
  const currentRef = React.useRef<Flashcard | undefined>(undefined);

  const goBack = React.useCallback(() => {
    navigate({ to: "/collections/$collectionId", params: { collectionId } });
  }, [navigate, collectionId]);

  const startSession = React.useCallback(() => {
    const cards = collectionRef.current?.cards ?? [];
    const unmastered = cards.filter((c) => !c.mastered);
    setQueue(shuffle(unmastered));
    setTotal(cards.length);
    setMastered(cards.length - unmastered.length);
    setShowAnswer(false);
  }, []);

  // Start the session once per collection; mastering a card mid-session must
  // not restart it (see the ref note above).
  React.useEffect(() => {
    startSession();
  }, [startSession, collectionId]);

  const gradeMastered = React.useCallback(() => {
    const card = currentRef.current;
    if (card) setCardMastered(collectionId, card.id, true);
    setMastered((m) => m + 1);
    setQueue((q) => q.slice(1));
    setShowAnswer(false);
  }, [collectionId]);

  const gradeAgain = React.useCallback(() => {
    setQueue((q) => (q.length <= 1 ? q : [...q.slice(1), q[0]]));
    setShowAnswer(false);
  }, []);

  const openEdit = React.useCallback((card: Flashcard) => {
    setEditingCard(card);
    setEditFront(card.front);
    setEditBack(card.back);
  }, []);

  const handleEditFrontChange = (value: string) => {
    setEditFront(value);
    if (!editingCard) return;
    updateCard(collectionId, editingCard.id, value, editBack);
    setQueue((q) => q.map((c) => (c.id === editingCard.id ? { ...c, front: value } : c)));
  };

  const handleEditBackChange = (value: string) => {
    setEditBack(value);
    if (!editingCard) return;
    updateCard(collectionId, editingCard.id, editFront, value);
    setQueue((q) => q.map((c) => (c.id === editingCard.id ? { ...c, back: value } : c)));
  };

  const current = queue[0];
  currentRef.current = current;
  const finished = total > 0 && queue.length === 0;

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (editingCard) return;
      if (e.code === "Space") {
        e.preventDefault();
        setShowAnswer((s) => !s);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (showAnswerRef.current) gradeAgain();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (showAnswerRef.current) gradeMastered();
      } else if (e.key === "Escape") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gradeMastered, gradeAgain, goBack, editingCard]);

  if (!collection) {
    return (
      <div className="h-full">
        <div className="drag-region pointer-events-none fixed top-0 left-0 right-0 h-13" />
        <EmptyState title="Collection introuvable" description="Cette collection n'existe plus." />
      </div>
    );
  }

  const reviewed = mastered;
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      <Toolbar>
        <ToolbarRow>
          <ToolbarBackButton label="Terminer" onClick={goBack} />
          <ToolbarContent>
            <ToolbarTitle>{collection.name}</ToolbarTitle>
          </ToolbarContent>
          <ToolbarActions>
            <Text variant="small" color="secondary" className="tabular-nums">
              {mastered} / {total} maîtrisées
            </Text>
          </ToolbarActions>
        </ToolbarRow>
      </Toolbar>

      {/* Progress bar */}
      <div className="h-1 w-full bg-well shrink-0">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {finished ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="Session terminée 🎉"
            description={`Vous avez maîtrisé ${total} carte${total > 1 ? "s" : ""}.`}
            actions={
              <>
                <Button variant="accent" onClick={startSession}>
                  <RotateCcw className="size-4.5" />
                  Recommencer
                </Button>
                <Button onClick={goBack}>Retour à la collection</Button>
              </>
            }
          />
        </div>
      ) : current ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 pb-8 overflow-auto">
          {/* Card */}
          <div className="relative w-full max-w-xl min-h-64 rounded-card border border-separator bg-control-subtle flex flex-col items-center justify-center gap-5 p-10 text-center">
            <Text
              variant="heading1"
              className="whitespace-pre-wrap cursor-pointer"
              onClick={() => openEdit(current)}
            >
              {current.front}
            </Text>
            {showAnswer ? (
              <>
                <Separator className="w-16" />
                <Text variant="large" color="secondary" className="whitespace-pre-wrap">
                  {current.back}
                </Text>
              </>
            ) : null}
          </div>

          {/* Controls */}
          {showAnswer ? (
            <div className="flex items-center gap-3">
              <Button size="large" onClick={gradeAgain}>
                <Undo2 className="size-4.5 text-support-orange" />
                À revoir
                <KeyGroup className="ml-1">
                  <Key>←</Key>
                </KeyGroup>
              </Button>
              <Button size="large" onClick={gradeMastered}>
                <Check className="size-4.5 text-support-green" />
                Maîtrisée
                <KeyGroup className="ml-1">
                  <Key>→</Key>
                </KeyGroup>
              </Button>
            </div>
          ) : (
            <Button variant="accent" size="large" onClick={() => setShowAnswer(true)}>
              Voir la réponse
              <KeyGroup className="ml-1">
                <Key>Espace</Key>
              </KeyGroup>
            </Button>
          )}
        </div>
      ) : null}

      {/* Edit card (auto-save) */}
      <Dialog
        open={!!editingCard}
        onOpenChange={(open) => {
          if (!open) setEditingCard(null);
        }}
        title="Modifier la carte"
        confirmLabel="Fermer"
        cancelLabel={null}
        onConfirm={() => setEditingCard(null)}
      >
        <div className="flex flex-col gap-3">
          <Field label="Recto" orientation="vertical" className="p-0">
            <Textarea autoFocus value={editFront} onChange={(e) => handleEditFrontChange(e.target.value)} />
          </Field>
          <Field label="Verso" orientation="vertical" className="p-0">
            <Textarea value={editBack} onChange={(e) => handleEditBackChange(e.target.value)} />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
