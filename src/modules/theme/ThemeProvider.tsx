import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { neonDark } from "./themes/neon-dark";
import { applyTheme } from "./applyTheme";
import type { ThemeTokens, ThemeId } from "./types";

const THEME_MAP: Record<ThemeId, ThemeTokens> = {
  "neon-dark": neonDark,
  "neon-light": neonDark, // placeholder — only dark for now
};

interface ThemeContextValue {
  themeId: ThemeId;
  tokens: ThemeTokens;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "neon-dark",
  tokens: neonDark,
  setTheme: () => {},
});

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

export function useTheme() {
  return useContext(ThemeContext);
}
