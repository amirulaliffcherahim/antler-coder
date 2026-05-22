import { useEffect, useState, type ReactNode } from "react";
import { neonDark } from "./themes/neon-dark";
import { zincDark } from "./themes/zinc-dark";
import { applyTheme } from "./applyTheme";
import { ThemeContext } from "./ThemeContext";
import type { ThemeTokens, ThemeId } from "./types";

const THEME_MAP: Record<ThemeId, ThemeTokens> = {
  "neon-dark": neonDark,
  "zinc-dark": zincDark,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("neon-dark");
  const tokens = THEME_MAP[themeId];

  useEffect(() => {
    applyTheme(tokens);
  }, [tokens]);

  return (
    <ThemeContext.Provider value={{ themeId, tokens, setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}
