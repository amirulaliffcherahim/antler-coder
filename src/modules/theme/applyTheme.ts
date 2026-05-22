import type { ThemeTokens } from "./types";

export function applyTheme(tokens: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--background", tokens.background);
  root.style.setProperty("--foreground", tokens.foreground);
  root.style.setProperty("--card", tokens.card);
  root.style.setProperty("--card-foreground", tokens.cardForeground);
  root.style.setProperty("--popover", tokens.popover);
  root.style.setProperty("--popover-foreground", tokens.popoverForeground);
  root.style.setProperty("--primary", tokens.primary);
  root.style.setProperty("--primary-foreground", tokens.primaryForeground);
  root.style.setProperty("--secondary", tokens.secondary);
  root.style.setProperty("--secondary-foreground", tokens.secondaryForeground);
  root.style.setProperty("--muted", tokens.muted);
  root.style.setProperty("--muted-foreground", tokens.mutedForeground);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-foreground", tokens.accentForeground);
  root.style.setProperty("--destructive", tokens.destructive);
  root.style.setProperty("--destructive-foreground", tokens.destructiveForeground);
  root.style.setProperty("--border", tokens.border);
  root.style.setProperty("--input", tokens.input);
  root.style.setProperty("--ring", tokens.ring);
  root.style.setProperty("--neon-cyan", tokens.neonCyan);
  root.style.setProperty("--neon-green", tokens.neonGreen);
  root.style.setProperty("--neon-amber", tokens.neonAmber);
  root.style.setProperty("--neon-red", tokens.neonRed);
  root.style.setProperty("--neon-purple", tokens.neonPurple);
}
