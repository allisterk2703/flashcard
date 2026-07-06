// Main process entry point.

import * as path from "path";

import { app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog, shell } from "electron";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const RELEASES_API = "https://api.github.com/repos/allisterk2703/flashcard/releases/latest";
const RELEASES_PAGE = "https://github.com/allisterk2703/flashcard/releases/latest";

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  return path.join(__dirname, "preload.cjs");
}

async function loadWindow(window: BrowserWindow, htmlFileName: string): Promise<void> {
  if (DEV_SERVER_URL) {
    await window.loadURL(`${DEV_SERVER_URL}/${htmlFileName}`);
  } else {
    await window.loadFile(path.join(__dirname, "..", "dist", htmlFileName));
  }
}

// ── Windows ───────────────────────────────────────────────────────────

async function createMainWindow(): Promise<void> {
  if (mainWindow && !mainWindow.isDestroyed()) return;

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 390,
    minHeight: 456,
    title: "FlashCard",
    show: false,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    visualEffectState: "followWindow",
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await loadWindow(mainWindow, "index.html");

  // Fallback: ready-to-show does not always fire on windows created hidden.
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
    mainWindow.show();
  }
}

async function openSettingsWindow(): Promise<void> {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 300,
    minWidth: 400,
    minHeight: 200,
    title: "Réglages",
    show: false,
    center: true,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    visualEffectState: "followWindow",
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  await loadWindow(settingsWindow, "settings.html");

  if (settingsWindow && !settingsWindow.isDestroyed() && !settingsWindow.isVisible()) {
    settingsWindow.show();
  }
}

// ── Update check ──────────────────────────────────────────────────────

/** Returns 1 if a > b, -1 if a < b, 0 if equal (numeric dotted versions). */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
}

async function checkForUpdates(): Promise<void> {
  const current = app.getVersion();
  let latest: string;

  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "FlashCard" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const release = (await response.json()) as { tag_name?: string };
    if (!release.tag_name) throw new Error("tag_name manquant");
    latest = release.tag_name.replace(/^v/, "");
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      message: "Impossible de vérifier les mises à jour",
      detail: `Vérifiez votre connexion internet et réessayez.\n\n(${error instanceof Error ? error.message : error})`,
      buttons: ["OK"],
    });
    return;
  }

  if (compareVersions(latest, current) > 0) {
    const { response } = await dialog.showMessageBox({
      type: "info",
      message: `FlashCard ${latest} est disponible`,
      detail: `Vous utilisez la version ${current}.\n\nVia Homebrew : brew upgrade --cask flashcard\nOu téléchargez la nouvelle version depuis GitHub.`,
      buttons: ["Ouvrir la page de téléchargement", "Plus tard"],
      defaultId: 0,
      cancelId: 1,
    });
    if (response === 0) {
      await shell.openExternal(RELEASES_PAGE);
    }
  } else {
    await dialog.showMessageBox({
      type: "info",
      message: "FlashCard est à jour",
      detail: `Vous utilisez la dernière version (${current}).`,
      buttons: ["OK"],
    });
  }
}

// ── IPC handlers ──────────────────────────────────────────────────────

function registerHandlers(): void {
  ipcMain.handle("app:getInfo", () => ({
    name: "FlashCard",
    version: app.getVersion(),
    environment: process.env.NODE_ENV || "production",
  }));

  ipcMain.handle("window:openSettings", async () => {
    await openSettingsWindow();
  });

  ipcMain.handle("window:closeSettings", () => {
    settingsWindow?.close();
  });

  ipcMain.handle("nativeTheme:getInfo", () => ({
    themeSource: nativeTheme.themeSource,
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
  }));

  ipcMain.handle("nativeTheme:setThemeSource", (_event, source: "system" | "light" | "dark") => {
    nativeTheme.themeSource = source;
    return true;
  });
}

// ── Application menu ──────────────────────────────────────────────────

function setupApplicationMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: "about" },
        {
          label: "Rechercher des mises à jour…",
          click: () => void checkForUpdates(),
        },
        { type: "separator" },
        {
          label: "Réglages…",
          accelerator: "Command+,",
          click: () => void openSettingsWindow(),
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "fileMenu" },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ]);
  Menu.setApplicationMenu(menu);
}

// ── Lifecycle ─────────────────────────────────────────────────────────

app.on("window-all-closed", () => {
  // On macOS, apps typically stay open when all windows are closed.
});

app.on("activate", () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    void createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.whenReady().then(() => {
  registerHandlers();
  setupApplicationMenu();
  void createMainWindow();
});
