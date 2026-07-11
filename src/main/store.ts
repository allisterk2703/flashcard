// Local persistence for flashcard collections.
// Everything lives in localStorage; React Query is used purely as a reactive
// cache over the synchronous store so views stay in sync after mutations.

import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./router";
import type { ParsedCard } from "./csv";

const STORAGE_KEY = "flashcards.collections.v1";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  /** Persists across sessions: true once graded "Maîtrisée" in review. */
  mastered?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  /** Single emoji used as the collection's visual identity (optional). */
  emoji?: string;
  cards: Flashcard[];
  createdAt: number;
}

const COLLECTIONS_QUERY_KEY = ["collections"] as const;

function uid(): string {
  return crypto.randomUUID();
}

export function loadCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Collection[];
  } catch {
    return [];
  }
}

function persist(collections: Collection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  queryClient.setQueryData(COLLECTIONS_QUERY_KEY, collections);
}

function mutate(fn: (collections: Collection[]) => Collection[]): Collection[] {
  const next = fn(loadCollections());
  persist(next);
  return next;
}

// ── Reactive reads ──────────────────────────────────────────────────────

export function useCollections(): Collection[] {
  const { data } = useQuery({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: () => loadCollections(),
    initialData: loadCollections,
    staleTime: Infinity,
  });
  return data;
}

export function useCollection(id: string | undefined): Collection | undefined {
  const collections = useCollections();
  return collections.find((c) => c.id === id);
}

// ── Mutations ─────────────────────────────────────────────────────────────

export function createCollection(name: string, emoji?: string): Collection {
  const collection: Collection = {
    id: uid(),
    name: name.trim() || "Sans titre",
    emoji: emoji?.trim() || undefined,
    cards: [],
    createdAt: Date.now(),
  };
  mutate((collections) => [...collections, collection]);
  return collection;
}

export function renameCollection(id: string, name: string, emoji?: string): void {
  mutate((collections) =>
    collections.map((c) =>
      c.id === id ? { ...c, name: name.trim() || c.name, emoji: emoji?.trim() || undefined } : c,
    ),
  );
}

export function deleteCollection(id: string): void {
  mutate((collections) => collections.filter((c) => c.id !== id));
}

/** Clears mastery progress on every card of the collection; cards themselves are kept. */
export function resetCollection(id: string): void {
  mutate((collections) =>
    collections.map((c) =>
      c.id === id ? { ...c, cards: c.cards.map((card) => ({ ...card, mastered: false })) } : c,
    ),
  );
}

export function setCardMastered(collectionId: string, cardId: string, mastered: boolean): void {
  mutate((collections) =>
    collections.map((c) =>
      c.id === collectionId
        ? { ...c, cards: c.cards.map((card) => (card.id === cardId ? { ...card, mastered } : card)) }
        : c,
    ),
  );
}

export function addCard(collectionId: string, front: string, back: string): void {
  const card: Flashcard = { id: uid(), front: front.trim(), back: back.trim() };
  mutate((collections) =>
    collections.map((c) => (c.id === collectionId ? { ...c, cards: [...c.cards, card] } : c)),
  );
}

export function updateCard(collectionId: string, cardId: string, front: string, back: string): void {
  mutate((collections) =>
    collections.map((c) =>
      c.id === collectionId
        ? {
            ...c,
            cards: c.cards.map((card) =>
              card.id === cardId ? { ...card, front: front.trim(), back: back.trim() } : card,
            ),
          }
        : c,
    ),
  );
}

// Recently deleted cards, most recent last, so deletions can be undone
// (Cmd+Z or the toast's "Annuler" action).
interface DeletedCardEntry {
  collectionId: string;
  card: Flashcard;
  index: number;
}
const deletedStack: DeletedCardEntry[] = [];

export function deleteCard(collectionId: string, cardId: string): void {
  mutate((collections) =>
    collections.map((c) => {
      if (c.id !== collectionId) return c;
      const index = c.cards.findIndex((card) => card.id === cardId);
      if (index === -1) return c;
      deletedStack.push({ collectionId, card: c.cards[index], index });
      return { ...c, cards: c.cards.filter((card) => card.id !== cardId) };
    }),
  );
}

/**
 * Restore a deleted card at its original position. With no argument, restores
 * the most recent deletion; with a cardId, restores that specific card.
 * Returns the restored card, or null if there is nothing to restore.
 */
export function undoDeleteCard(cardId?: string): Flashcard | null {
  const at = cardId
    ? deletedStack.findIndex((e) => e.card.id === cardId)
    : deletedStack.length - 1;
  if (at < 0) return null;
  const [entry] = deletedStack.splice(at, 1);
  let restored = false;
  mutate((collections) =>
    collections.map((c) => {
      if (c.id !== entry.collectionId) return c;
      restored = true;
      const cards = [...c.cards];
      cards.splice(Math.min(entry.index, cards.length), 0, entry.card);
      return { ...c, cards };
    }),
  );
  return restored ? entry.card : null;
}

/** Bulk-append parsed cards (from CSV import). Returns the number added. */
export function addCards(collectionId: string, parsed: ParsedCard[]): number {
  if (parsed.length === 0) return 0;
  const cards: Flashcard[] = parsed.map((p) => ({ id: uid(), front: p.front, back: p.back }));
  mutate((collections) =>
    collections.map((c) => (c.id === collectionId ? { ...c, cards: [...c.cards, ...cards] } : c)),
  );
  return cards.length;
}
