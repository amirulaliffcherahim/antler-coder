import { create } from "zustand";
import { getSetting, setSetting } from "./store";

export type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  modelId: string;
};

export type AutocompleteMode = "ghost" | "manual" | "both";

interface PreferencesState {
  // Hydration
  hydrated: boolean;

  // Theme
  themeId: string;
  fontSize: number;

  // Editor
  tabSize: number;
  vimMode: boolean;
  wordWrap: boolean;

  // Autocomplete
  autocompleteEnabled: boolean;
  autocompleteMode: AutocompleteMode;
  autocompleteProvider: ProviderConfig | null;

  // Terminal
  defaultShell: string;
  terminalFontSize: number;

  // Keybindings
  keybindingPreset: "vim-terminal" | "vscode";

  // Actions
  hydrate: () => Promise<void>;
  setThemeId: (id: string) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setVimMode: (enabled: boolean) => void;
  setWordWrap: (enabled: boolean) => void;
  setAutocompleteEnabled: (enabled: boolean) => void;
  setAutocompleteMode: (mode: AutocompleteMode) => void;
  setAutocompleteProvider: (provider: ProviderConfig | null) => void;
  setDefaultShell: (shell: string) => void;
  setTerminalFontSize: (size: number) => void;
  setKeybindingPreset: (preset: "vim-terminal" | "vscode") => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  hydrated: false,
  themeId: "neon-dark",
  fontSize: 12.5,
  tabSize: 2,
  vimMode: false,
  wordWrap: true,
  autocompleteEnabled: true,
  autocompleteMode: "both",
  autocompleteProvider: null,
  defaultShell: "/bin/bash",
  terminalFontSize: 12,
  keybindingPreset: "vim-terminal",

  hydrate: async () => {
    if (get().hydrated) return;
    const themeId = await getSetting("themeId", "neon-dark");
    const fontSize = await getSetting("fontSize", 12.5);
    const tabSize = await getSetting("tabSize", 2);
    const vimMode = await getSetting("vimMode", false);
    const wordWrap = await getSetting("wordWrap", true);
    const autocompleteEnabled = await getSetting("autocompleteEnabled", true);
    const autocompleteMode = await getSetting<AutocompleteMode>("autocompleteMode", "both");
    const autocompleteProvider = await getSetting<ProviderConfig | null>("autocompleteProvider", null);
    const defaultShell = await getSetting("defaultShell", "/bin/bash");
    const terminalFontSize = await getSetting("terminalFontSize", 12);
    const keybindingPreset = await getSetting<"vim-terminal" | "vscode">("keybindingPreset", "vim-terminal");

    set({
      themeId,
      fontSize,
      tabSize,
      vimMode,
      wordWrap,
      autocompleteEnabled,
      autocompleteMode,
      autocompleteProvider,
      defaultShell,
      terminalFontSize,
      keybindingPreset,
      hydrated: true,
    });
  },

  setThemeId: (id) => {
    set({ themeId: id });
    void setSetting("themeId", id);
  },

  setFontSize: (size) => {
    set({ fontSize: size });
    void setSetting("fontSize", size);
  },

  setTabSize: (size) => {
    set({ tabSize: size });
    void setSetting("tabSize", size);
  },

  setVimMode: (enabled) => {
    set({ vimMode: enabled });
    void setSetting("vimMode", enabled);
  },

  setWordWrap: (enabled) => {
    set({ wordWrap: enabled });
    void setSetting("wordWrap", enabled);
  },


  setAutocompleteEnabled: (enabled) => {
    set({ autocompleteEnabled: enabled });
    void setSetting("autocompleteEnabled", enabled);
  },

  setAutocompleteMode: (mode) => {
    set({ autocompleteMode: mode });
    void setSetting("autocompleteMode", mode);
  },

  setAutocompleteProvider: (provider) => {
    set({ autocompleteProvider: provider });
    void setSetting("autocompleteProvider", provider);
  },

  setDefaultShell: (shell) => {
    set({ defaultShell: shell });
    void setSetting("defaultShell", shell);
  },

  setTerminalFontSize: (size) => {
    set({ terminalFontSize: size });
    void setSetting("terminalFontSize", size);
  },

  setKeybindingPreset: (preset) => {
    set({ keybindingPreset: preset });
    void setSetting("keybindingPreset", preset);
  },
}));
