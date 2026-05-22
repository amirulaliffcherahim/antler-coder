import type { ThemeTokens } from "./types";

/**
 * Convert a hex color (e.g. "#0a0a0a") to an HSL triplet string
 * (e.g. "0 0% 4%") suitable for use with `hsl(var(--name))` in Tailwind.
 */
function hexToHslTriplet(hex: string): string {
  // Parse hex to RGB
  let r = 0, g = 0, b = 0;
  const clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }

  // Normalize to [0, 1]
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;

  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rN) {
      h = ((gN - bN) / delta + (gN < bN ? 6 : 0)) * 60;
    } else if (max === gN) {
      h = ((bN - rN) / delta + 2) * 60;
    } else {
      h = ((rN - gN) / delta + 4) * 60;
    }
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// CSS variable names that should use HSL triplet format for Tailwind compatibility
const HSL_VARS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;



/**
 * Apply theme tokens as CSS custom properties on :root.
 * Semantic color variables are stored as HSL triplets for Tailwind compatibility.
 * Neon accent variables remain as hex for xterm.js and other direct consumers.
 */
export function applyTheme(tokens: ThemeTokens) {
  const root = document.documentElement;

  // Token key → CSS var suffix mapping
  const tokenMap: Record<string, string> = {
    background: "background",
    foreground: "foreground",
    card: "card",
    cardForeground: "card-foreground",
    popover: "popover",
    popoverForeground: "popover-foreground",
    primary: "primary",
    primaryForeground: "primary-foreground",
    secondary: "secondary",
    secondaryForeground: "secondary-foreground",
    muted: "muted",
    mutedForeground: "muted-foreground",
    accent: "accent",
    accentForeground: "accent-foreground",
    destructive: "destructive",
    destructiveForeground: "destructive-foreground",
    border: "border",
    input: "input",
    ring: "ring",
    neonCyan: "neon-cyan",
    neonGreen: "neon-green",
    neonAmber: "neon-amber",
    neonRed: "neon-red",
    neonPurple: "neon-purple",
  };

  for (const [key, varName] of Object.entries(tokenMap)) {
    const value = (tokens as unknown as Record<string, string>)[key];
    if (HSL_VARS.includes(varName as any)) {
      root.style.setProperty(`--${varName}`, hexToHslTriplet(value));
    } else {
      root.style.setProperty(`--${varName}`, value);
    }
  }
}
