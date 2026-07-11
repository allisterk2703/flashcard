import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarList,
  SidebarListItem,
  SidebarListItemAccessory,
  EmptyState,
  Button,
  Dialog,
  Field,
  Input,
  AlertDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui";
import { Layers, MoreHorizontal, Plus } from "lucide-react";
import {
  useCollections,
  createCollection,
  deleteCollection,
  renameCollection,
  type Collection,
} from "./store";
import { EmojiPicker } from "../components/emoji-picker";

export function CollectionsSidebar() {
  const collections = useCollections();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { collectionId?: string };
  const activeId = params.collectionId;

  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Collection | null>(null);
  const [renameTarget, setRenameTarget] = React.useState<Collection | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameEmoji, setRenameEmoji] = React.useState("");

  const submitCreate = () => {
    const collection = createCollection(name, emoji);
    setName("");
    setEmoji("");
    navigate({ to: "/collections/$collectionId", params: { collectionId: collection.id } });
  };

  return (
    <Sidebar
      actions={
        <Button iconOnly aria-label="Nouvelle collection" onClick={() => setCreateOpen(true)}>
          <Plus />
        </Button>
      }
    >
      <SidebarList
        items={collections}
        getItemKey={(c) => c.id}
        emptyState={
          <EmptyState
            title="Aucune collection"
            description="Créez votre première collection pour commencer."
            actions={<Button onClick={() => setCreateOpen(true)}>Nouvelle collection</Button>}
          />
        }
      >
        {collections.map((collection) => (
          <SidebarListItem
            key={collection.id}
            selected={collection.id === activeId}
            onClick={() =>
              navigate({
                to: "/collections/$collectionId",
                params: { collectionId: collection.id },
              })
            }
            icon={
              collection.emoji ? (
                <span className="text-base leading-none">{collection.emoji}</span>
              ) : (
                <Layers />
              )
            }
            title={collection.name}
            accessory={
              <SidebarListItemAccessory>
                <span>{collection.cards.length}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      iconOnly
                      variant="transparent"
                      size="small"
                      aria-label="Options de la collection"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      icon="pencil"
                      onSelect={() => {
                        setRenameValue(collection.name);
                        setRenameEmoji(collection.emoji ?? "");
                        setRenameTarget(collection);
                      }}
                    >
                      Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      icon="trash"
                      color="red"
                      onSelect={() => setDeleteTarget(collection)}
                    >
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarListItemAccessory>
            }
          />
        ))}
      </SidebarList>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setName("");
            setEmoji("");
          }
        }}
        title="Nouvelle collection"
        description="Donnez un nom à votre collection."
        confirmLabel="Créer"
        confirmDisabled={!name.trim()}
        onConfirm={submitCreate}
      >
        <Field label="Nom" orientation="vertical" className="p-0">
          <div className="flex gap-2">
            <EmojiPicker value={emoji} onChange={setEmoji} />
            <Input
              autoFocus
              value={name}
              placeholder="Saisissez le nom de la collection"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  e.preventDefault();
                  setCreateOpen(false);
                  submitCreate();
                }
              }}
            />
          </div>
        </Field>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title="Renommer la collection"
        confirmLabel="Enregistrer"
        confirmDisabled={!renameValue.trim()}
        onConfirm={() => {
          if (!renameTarget) return;
          renameCollection(renameTarget.id, renameValue, renameEmoji);
          setRenameTarget(null);
        }}
      >
        <Field label="Nom" orientation="vertical" className="p-0">
          <div className="flex gap-2">
            <EmojiPicker value={renameEmoji} onChange={setRenameEmoji} />
            <Input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          </div>
        </Field>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Supprimer « ${deleteTarget?.name ?? ""} » ?`}
        description="La collection et toutes ses cartes seront définitivement supprimées. Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCollection(deleteTarget.id);
          if (activeId === deleteTarget.id) navigate({ to: "/" });
          setDeleteTarget(null);
        }}
      />
    </Sidebar>
  );
}
