import * as React from "react";

/**
 * Keeps the `.dark` class on <html> in sync with the effective system /
 * app theme. Electron's nativeTheme drives `prefers-color-scheme` in the
 * renderer, so a media-query listener covers both system changes and
 * theme-source changes made in the settings window.
 */
export function useTheme(): void {
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
}
