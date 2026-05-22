import { createContext } from "react";
import { neonDark } from "./themes/neon-dark";
import type { ThemeContextValue } from "./types";

export const ThemeContext = createContext<ThemeContextValue>({
  themeId: "neon-dark",
  tokens: neonDark,
  setTheme: () => {},
});
