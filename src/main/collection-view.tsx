import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ScrollArea,
  List,
  Button,
  EmptyState,
  Dialog,
  AlertDialog,
  Field,
  Input,
  Textarea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Toolbar,
  ToolbarRow,
  ToolbarContent,
  ToolbarTitle,
  ToolbarActions,
  ToolbarSearchButton,
  toast,
} from "../components/ui";
import { MoreHorizontal, Plus, Upload, Play, Trash2, CheckCircle2 } from "lucide-react";
import {
  useCollection,
  addCard,
  addCards,
  updateCard,
  deleteCard,
  renameCollection,
  deleteCollection,
  resetCollection,
  type Flashcard,
} from "./store";
import { parseCsvCards } from "./csv";
import { EmojiPicker } from "../components/emoji-picker";

export function CollectionView() {
  const { collectionId } = useParams({ from: "/collections/$collectionId" });
  const collection = useCollection(collectionId);
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [cardDialogOpen, setCardDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Flashcard | null>(null);
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameEmoji, setRenameEmoji] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  if (!collection) {
    return (
      <div className="h-full">
        <div className="drag-region pointer-events-none fixed top-0 left-0 right-0 h-13" />
        <EmptyState title="Collection introuvable" description="Cette collection n'existe plus." />
      </div>
    );
  }

  const openAddCard = () => {
    setEditing(null);
    setFront("");
    setBack("");
    setCardDialogOpen(true);
  };

  const openEditCard = (card: Flashcard) => {
    setEditing(card);
    setFront(card.front);
    setBack(card.back);
    setCardDialogOpen(true);
  };

  const submitCard = () => {
    if (editing) {
      updateCard(collection.id, editing.id, front, back);
    } else {
      addCard(collection.id, front, back);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCsvCards(text);
      if (parsed.length === 0) {
        toast.error("Aucune carte trouvée", {
          description: "Le fichier doit contenir deux colonnes : recto, verso.",
        });
        return;
      }
      const count = addCards(collection.id, parsed);
      toast.success(`${count} carte${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""}`);
    } catch {
      toast.error("Impossible de lire le fichier");
    }
  };

  const cardCount = collection.cards.length;
  const masteredCount = collection.cards.filter((c) => c.mastered).length;
  const unmasteredCount = cardCount - masteredCount;

  const query = search.trim().toLowerCase();
  const filteredCards = query
    ? collection.cards.filter(
        (c) => c.front.toLowerCase().includes(query) || c.back.toLowerCase().includes(query),
      )
    : collection.cards;

  return (
    <ScrollArea
      className="h-full"
      toolbar={
        <Toolbar>
          <ToolbarRow>
            <ToolbarContent>
              <ToolbarTitle>
                {collection.emoji ? `${collection.emoji} ${collection.name}` : collection.name}
              </ToolbarTitle>
            </ToolbarContent>
            <ToolbarActions>
              <Button variant="glass" size="large" onClick={handleImportClick}>
                <Upload className="size-4.5" />
                Importer CSV
              </Button>
              <Button variant="glass" size="large" onClick={openAddCard}>
                <Plus className="size-4.5" />
                Ajouter
              </Button>
              <Button
                variant="accent"
                size="large"
                disabled={unmasteredCount === 0}
                onClick={() =>
                  navigate({
                    to: "/collections/$collectionId/review",
                    params: { collectionId: collection.id },
                  })
                }
              >
                <Play className="size-4.5" />
                Réviser
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Options de la collection"
                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-strong overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:cursor-default disabled:pointer-events-none disabled:opacity-50 bg-glass dimmable hover:bg-control-subtle text-primary border border-transparent active:bg-control focus:outline-none data-[state='open']:bg-control transition-colors duration-200 gap-1.5 [&_svg:not([class*='size-'])]:size-5 p-0 rounded-pill w-9 h-9"
                >
                  <MoreHorizontal className="size-4.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    icon="pencil"
                    onSelect={() => {
                      setRenameValue(collection.name);
                      setRenameEmoji(collection.emoji ?? "");
                      setRenameOpen(true);
                    }}
                  >
                    Renommer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    icon="arrow.counterclockwise"
                    onSelect={() => setResetOpen(true)}
                    disabled={masteredCount === 0}
                  >
                    Réinitialiser la progression
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon="trash" color="red" onSelect={() => setDeleteOpen(true)}>
                    Supprimer la collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ToolbarActions>
          </ToolbarRow>
          {cardCount > 0 ? (
            <ToolbarRow>
              <ToolbarSearchButton value={search} onChange={setSearch} size="large" />
            </ToolbarRow>
          ) : null}
        </Toolbar>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {cardCount === 0 ? (
        <EmptyState
          title="Aucune carte"
          description="Ajoutez des cartes une par une ou importez-les depuis un fichier CSV (recto, verso)."
          actions={
            <>
              <Button variant="accent" onClick={openAddCard}>
                <Plus className="size-4.5" />
                Ajouter une carte
              </Button>
              <Button onClick={handleImportClick}>
                <Upload className="size-4.5" />
                Importer CSV
              </Button>
            </>
          }
        />
      ) : filteredCards.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          description={`Aucune carte ne correspond à « ${search.trim()} ».`}
        />
      ) : (
        <List.Root
          items={filteredCards}
          getItemKey={(card) => card.id}
          className="px-3 py-2"
        >
          {filteredCards.map((card) => (
            <List.Item key={card.id} item={card} onClick={() => openEditCard(card)}>
              <List.ItemContent>
                <List.ItemTitle>{card.front}</List.ItemTitle>
                <List.ItemDescription>{card.back}</List.ItemDescription>
              </List.ItemContent>
              <List.ItemAccessory>
                {card.mastered ? (
                  <CheckCircle2 className="size-4 text-support-green" aria-label="Maîtrisée" />
                ) : null}
                <Button
                  iconOnly
                  variant="transparent"
                  size="small"
                  aria-label="Supprimer la carte"
                  onClick={() => deleteCard(collection.id, card.id)}
                >
                  <Trash2 className="size-4 text-secondary" />
                </Button>
              </List.ItemAccessory>
            </List.Item>
          ))}
        </List.Root>
      )}

      {/* Add / edit card */}
      <Dialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        title={editing ? "Modifier la carte" : "Nouvelle carte"}
        confirmLabel={editing ? "Enregistrer" : "Ajouter"}
        confirmDisabled={!front.trim() || !back.trim()}
        onConfirm={submitCard}
      >
        <div className="flex flex-col gap-3">
          <Field label="Recto" description="La question ou le terme." orientation="vertical" className="p-0">
            <Textarea
              autoFocus
              value={front}
              placeholder="Ex. Bonjour"
              onChange={(e) => setFront(e.target.value)}
            />
          </Field>
          <Field label="Verso" description="La réponse." orientation="vertical" className="p-0">
            <Textarea value={back} placeholder="Ex. Hello" onChange={(e) => setBack(e.target.value)} />
          </Field>
        </div>
      </Dialog>

      {/* Rename collection */}
      <Dialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Renommer la collection"
        confirmLabel="Enregistrer"
        confirmDisabled={!renameValue.trim()}
        onConfirm={() => renameCollection(collection.id, renameValue, renameEmoji)}
      >
        <Field label="Nom" orientation="vertical" className="p-0">
          <div className="flex gap-2">
            <EmojiPicker value={renameEmoji} onChange={setRenameEmoji} />
            <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          </div>
        </Field>
      </Dialog>

      {/* Delete collection */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Supprimer « ${collection.name} » ?`}
        description="La collection et toutes ses cartes seront définitivement supprimées. Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmVariant="destructive"
        onConfirm={() => {
          deleteCollection(collection.id);
          navigate({ to: "/" });
        }}
      />

      {/* Reset progress */}
      <AlertDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={`Réinitialiser la progression de « ${collection.name} » ?`}
        description="Toutes les cartes redeviennent à réviser, comme si aucune n'avait jamais été maîtrisée. Les cartes elles-mêmes ne sont pas supprimées."
        confirmLabel="Réinitialiser"
        confirmVariant="destructive"
        onConfirm={() => {
          resetCollection(collection.id);
          toast.success("Progression réinitialisée");
        }}
      />
    </ScrollArea>
  );
}
