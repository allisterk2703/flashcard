// Export a collection's cards to CSV or Excel. Both formats include a
// "Recto;Verso" header row, which the importer recognizes and skips, so an
// exported file re-imports cleanly.

import * as XLSX from "xlsx";
import type { Collection } from "./store";

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "collection";
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvField(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportCollectionCsv(collection: Collection): void {
  // Semicolon delimiter + BOM so French Excel opens the file correctly.
  const lines = ["Recto;Verso", ...collection.cards.map((c) => `${csvField(c.front)};${csvField(c.back)}`)];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `${safeFileName(collection.name)}.csv`);
}

export function exportCollectionXlsx(collection: Collection): void {
  const rows = [["Recto", "Verso"], ...collection.cards.map((c) => [c.front, c.back])];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Cartes");
  XLSX.writeFile(workbook, `${safeFileName(collection.name)}.xlsx`);
}
