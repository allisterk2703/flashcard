// Minimal CSV parser for flashcard import.
// Supports quoted fields, escaped quotes ("") and auto-detects the delimiter
// (comma, semicolon or tab). The first two columns map to front / back.

export interface ParsedCard {
  front: string;
  back: string;
}

function detectDelimiter(text: string): string {
  // Count delimiter occurrences on the first record, ignoring anything inside
  // quotes so a comma inside a quoted field can't be mistaken for the delimiter.
  const counts: Record<string, number> = { ";": 0, "\t": 0, ",": 0 };
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i++;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (!inQuotes && (char === "\n" || char === "\r")) {
      break; // end of the first record
    } else if (!inQuotes && char in counts) {
      counts[char]++;
    }
  }

  // Priority order breaks ties toward delimiters unlikely to appear in prose.
  let best = ",";
  let bestCount = 0;
  for (const candidate of [";", "\t", ","]) {
    if (counts[candidate] > bestCount) {
      bestCount = counts[candidate];
      best = candidate;
    }
  }
  return best;
}

function parseRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else {
      field += char;
    }
  }

  // Trailing field / row (file not ending in newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Parse CSV text into flashcards. Rows missing a back are skipped.
 * A leading header row like "front,back" / "question,réponse" is detected
 * and ignored.
 */
export function parseCsvCards(rawText: string): ParsedCard[] {
  const text = rawText.replace(/^\uFEFF/, ""); // strip a leading UTF-8 BOM
  const delimiter = detectDelimiter(text);
  const rows = parseRows(text, delimiter);

  const cards: ParsedCard[] = [];
  rows.forEach((row, index) => {
    const front = (row[0] ?? "").trim();
    const back = (row[1] ?? "").trim();
    if (!front && !back) return;

    // Skip a likely header on the first row.
    if (index === 0) {
      const header = `${front} ${back}`.toLowerCase();
      const headerWords = ["front", "back", "question", "answer", "réponse", "reponse", "recto", "verso", "terme", "définition", "definition"];
      if (headerWords.some((word) => header.includes(word))) return;
    }

    if (!front || !back) return;
    cards.push({ front, back });
  });

  return cards;
}
