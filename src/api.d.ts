export interface NativeThemeInfo {
  themeSource: "system" | "light" | "dark";
  shouldUseDarkColors: boolean;
}

declare global {
  interface Window {
    api: {
      app: {
        getInfo: () => Promise<{ name: string; version: string; environment: string }>;
      };
      window: {
        openSettings: () => Promise<void>;
        closeSettings: () => Promise<void>;
      };
      nativeTheme: {
        getInfo: () => Promise<NativeThemeInfo>;
        setThemeSource: (source: "system" | "light" | "dark") => Promise<boolean>;
      };
    };
  }
}
