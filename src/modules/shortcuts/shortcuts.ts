export interface Command {
  id: string;
  name: string;
  description: string;
  defaultBinding: string;
  action: () => void;
}

export type KeybindingPreset = "vim-terminal" | "vscode";

const PRESETS: Record<KeybindingPreset, Record<string, string>> = {
  "vim-terminal": {
    "command-palette": "Shift+Space+p",
    "quick-open": "Space+p",
    "toggle-explorer": "Space+e",
    "toggle-terminal": "Space+t",
    "agent-popup": "Space+a",
    "focus-left": "Ctrl+w+h",
    "focus-right": "Ctrl+w+l",
    "focus-up": "Ctrl+w+k",
    "focus-down": "Ctrl+w+j",
    "zen-mode": "Space+z",
    "search-files": "Shift+Space+f",
    "settings": "Space+,",
    "close-tab": "Space+q",
    "new-terminal": "Space+Shift+t",
  },
  vscode: {
    "command-palette": "Ctrl+Shift+P",
    "quick-open": "Ctrl+P",
    "toggle-explorer": "Ctrl+Shift+E",
    "toggle-terminal": "Ctrl+`",
    "agent-popup": "Ctrl+Shift+A",
    "focus-left": "Ctrl+K+H",
    "focus-right": "Ctrl+K+L",
    "focus-up": "Ctrl+K+K",
    "focus-down": "Ctrl+K+J",
    "zen-mode": "Ctrl+K+Z",
    "search-files": "Ctrl+Shift+F",
    "settings": "Ctrl+,",
    "close-tab": "Ctrl+W",
    "new-terminal": "Ctrl+Shift+`",
  },
};

const commands = new Map<string, Command>();
let currentPreset: KeybindingPreset = "vim-terminal";
let spaceChordActive = false;
let spaceTimeout: ReturnType<typeof setTimeout> | null = null;

export function registerCommand(cmd: Command) {
  commands.set(cmd.id, cmd);
}

export function getCommand(id: string): Command | undefined {
  return commands.get(id);
}

export function getAllCommands(): Command[] {
  return Array.from(commands.values());
}

export function setPreset(preset: KeybindingPreset) {
  currentPreset = preset;
}

export function getPreset(): KeybindingPreset {
  return currentPreset;
}

export function getBinding(commandId: string): string {
  return PRESETS[currentPreset][commandId] ?? "";
}

export function setBinding(commandId: string, binding: string) {
  PRESETS[currentPreset][commandId] = binding;
}

function matchBinding(binding: string, e: KeyboardEvent): boolean {
  const keys = binding.split("+");
  const modifiers = keys.filter((k) => ["Ctrl", "Alt", "Shift", "Meta"].includes(k));
  const key = keys.find((k) => !["Ctrl", "Alt", "Shift", "Meta"].includes(k));

  if (key && e.key !== key && e.key.toLowerCase() !== key.toLowerCase()) return false;

  const hasCtrl = modifiers.includes("Ctrl");
  const hasAlt = modifiers.includes("Alt");
  const hasShift = modifiers.includes("Shift");
  const hasMeta = modifiers.includes("Meta");

  return (
    e.ctrlKey === hasCtrl &&
    e.altKey === hasAlt &&
    e.shiftKey === hasShift &&
    e.metaKey === hasMeta
  );
}

export function handleKeydown(e: KeyboardEvent): boolean {
  // Space chord handling for Vim-terminal preset
  if (currentPreset === "vim-terminal") {
    if (e.key === " " && !spaceChordActive && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      spaceChordActive = true;
      if (spaceTimeout) clearTimeout(spaceTimeout);
      spaceTimeout = setTimeout(() => {
        spaceChordActive = false;
      }, 1000);
      e.preventDefault();
      return true;
    }

    if (spaceChordActive) {
      const chord = e.shiftKey ? `Shift+Space+${e.key.toLowerCase()}` : `Space+${e.key.toLowerCase()}`;
      for (const [id, binding] of Object.entries(PRESETS[currentPreset])) {
        if (binding === chord) {
          spaceChordActive = false;
          if (spaceTimeout) clearTimeout(spaceTimeout);
          e.preventDefault();
          const cmd = commands.get(id);
          if (cmd) {
            cmd.action();
          }
          return true;
        }
      }
      // If no match, cancel chord
      spaceChordActive = false;
      if (spaceTimeout) clearTimeout(spaceTimeout);
    }
  }

  // Standard chord handling
  for (const [id, binding] of Object.entries(PRESETS[currentPreset])) {
    if (matchBinding(binding, e)) {
      e.preventDefault();
      const cmd = commands.get(id);
      if (cmd) {
        cmd.action();
      }
      return true;
    }
  }

  return false;
}

export function resetSpaceChord() {
  spaceChordActive = false;
  if (spaceTimeout) clearTimeout(spaceTimeout);
}
