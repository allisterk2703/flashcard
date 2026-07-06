// Preload script: the secure bridge between the renderer and the main process.
// Renderer code should only access window.api.

import { contextBridge, ipcRenderer } from "electron";

export interface NativeThemeInfo {
  themeSource: "system" | "light" | "dark";
  shouldUseDarkColors: boolean;
}

const api = {
  app: {
    getInfo: (): Promise<{ name: string; version: string; environment: string }> =>
      ipcRenderer.invoke("app:getInfo"),
  },

  window: {
    openSettings: (): Promise<void> => ipcRenderer.invoke("window:openSettings"),
    closeSettings: (): Promise<void> => ipcRenderer.invoke("window:closeSettings"),
  },

  nativeTheme: {
    getInfo: (): Promise<NativeThemeInfo> => ipcRenderer.invoke("nativeTheme:getInfo"),
    setThemeSource: (source: "system" | "light" | "dark"): Promise<boolean> =>
      ipcRenderer.invoke("nativeTheme:setThemeSource", source),
  },
};

contextBridge.exposeInMainWorld("api", api);

export type AppAPI = typeof api;
