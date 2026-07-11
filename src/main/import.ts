// File import for flashcards: CSV/TSV text or Excel (.xlsx / .xls).
// The format is detected from the file content (magic bytes), not the
// extension, so a mislabeled file still imports correctly.

import * as XLSX from "xlsx";
import { parseCsvCards, rowsToCards, type ParsedCard } from "./csv";

function isZip(bytes: Uint8Array): boolean {
  // .xlsx is a ZIP archive: "PK\x03\x04"
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

function isCfb(bytes: Uint8Array): boolean {
  // Legacy .xls is a Compound File Binary: D0 CF 11 E0 A1 B1 1A E1
  const magic = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return magic.every((byte, i) => bytes[i] === byte);
}

function parseExcelCards(buffer: ArrayBuffer): ParsedCard[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    raw: false,
    defval: "",
  });
  return rowsToCards(rows.map((row) => row.map((cell) => String(cell ?? ""))));
}

/** Parse an imported file (CSV, TSV or Excel) into flashcards. */
export async function parseImportFile(file: File): Promise<ParsedCard[]> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 8));
  if (isZip(bytes) || isCfb(bytes)) return parseExcelCards(buffer);
  return parseCsvCards(new TextDecoder().decode(buffer));
}
