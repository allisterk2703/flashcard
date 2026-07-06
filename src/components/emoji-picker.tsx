import * as React from "react";
import {
  CustomDropdownMenu,
  CustomDropdownMenuTrigger,
  CustomDropdownMenuContent,
  Button,
} from "./ui";
import { Search, Smile } from "lucide-react";
import emojiData from "emojibase-data/fr/compact.json";

interface EmojiEntry {
  label: string;
  unicode: string;
  group?: number;
  tags?: string[];
  order?: number;
}

const GROUP_LABELS: Record<number, string> = {
  0: "Smileys & émotions",
  1: "Personnes",
  3: "Animaux & nature",
  4: "Nourriture & boissons",
  5: "Voyages & lieux",
  6: "Activités",
  7: "Objets",
  8: "Symboles",
  9: "Drapeaux",
};

const GROUP_ORDER = [0, 1, 3, 4, 5, 6, 7, 8, 9];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Group 2 (composants : tons de peau, cheveux) et les entrées sans groupe
// (indicateurs régionaux…) ne sont pas des emojis présentables.
const ALL_EMOJIS: EmojiEntry[] = (emojiData as EmojiEntry[])
  .filter((e) => e.group !== undefined && e.group !== 2)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const BY_GROUP: Array<{ group: number; label: string; emojis: EmojiEntry[] }> = GROUP_ORDER.map(
  (group) => ({
    group,
    label: GROUP_LABELS[group],
    emojis: ALL_EMOJIS.filter((e) => e.group === group),
  }),
).filter((section) => section.emojis.length > 0);

interface EmojiPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const pick = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  const q = normalize(query.trim());
  const results = q
    ? ALL_EMOJIS.filter(
        (e) => normalize(e.label).includes(q) || e.tags?.some((t) => normalize(t).includes(q)),
      )
    : null;

  const emojiButton = (e: EmojiEntry) => (
    <button
      key={e.unicode}
      type="button"
      title={e.label}
      aria-label={e.label}
      onClick={() => pick(e.unicode)}
      className={
        "flex size-8 items-center justify-center rounded-md text-xl hover:bg-control-subtle " +
        (value === e.unicode ? "bg-control ring-1 ring-ring" : "")
      }
    >
      {e.unicode}
    </button>
  );

  return (
    <CustomDropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <CustomDropdownMenuTrigger asChild>
        <Button
          type="button"
          className="h-9 w-11 shrink-0 rounded-lg border border-separator text-lg"
          aria-label="Choisir un emoji (optionnel)"
          title="Emoji (optionnel)"
        >
          {value ? value : <Smile className="size-4.5 text-tertiary" />}
        </Button>
      </CustomDropdownMenuTrigger>
      <CustomDropdownMenuContent align="start" className="w-[340px] p-0">
        <div className="flex items-center gap-2 border-b border-separator px-3 py-2">
          <Search className="size-4 shrink-0 text-secondary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un emoji…"
            className="h-6 w-full bg-transparent text-sm text-primary outline-none placeholder:text-tertiary"
          />
        </div>

        <div className="h-72 overflow-y-auto p-2">
          {results ? (
            results.length > 0 ? (
              <div className="grid grid-cols-9 gap-0.5">{results.map(emojiButton)}</div>
            ) : (
              <p className="px-1 py-6 text-center text-sm text-secondary">
                Aucun emoji ne correspond à « {query.trim()} ».
              </p>
            )
          ) : (
            BY_GROUP.map((section) => (
              <div key={section.group} className="mb-2">
                <p className="sticky top-0 z-10 bg-popover px-1 py-1 text-xs font-medium text-secondary">
                  {section.label}
                </p>
                <div className="grid grid-cols-9 gap-0.5">{section.emojis.map(emojiButton)}</div>
              </div>
            ))
          )}
        </div>

        {value ? (
          <div className="border-t border-separator p-1">
            <Button
              variant="transparent"
              size="small"
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Retirer l&apos;emoji
            </Button>
          </div>
        ) : null}
      </CustomDropdownMenuContent>
    </CustomDropdownMenu>
  );
}
