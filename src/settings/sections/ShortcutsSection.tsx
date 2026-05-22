import { useTheme } from "@/modules/theme/ThemeProvider";
import { usePreferencesStore } from "@/modules/settings/preferences";
import { getAllCommands, getBinding } from "@/modules/shortcuts/shortcuts";

export function ShortcutsSection() {
  const { tokens } = useTheme();
  const { keybindingPreset, setKeybindingPreset } = usePreferencesStore();
  const commands = getAllCommands();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        Shortcuts
      </h2>

      <div className="flex flex-col gap-2">
        <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
          Keybinding preset
        </label>
        <div className="flex gap-2">
          {(["vim-terminal", "vscode"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setKeybindingPreset(preset)}
              className="px-3 py-1.5 text-[11px] rounded border transition-colors"
              style={{
                borderColor: keybindingPreset === preset ? tokens.neonCyan : tokens.border,
                backgroundColor: keybindingPreset === preset ? `${tokens.neonCyan}10` : "transparent",
                color: tokens.foreground,
              }}
            >
              {preset === "vim-terminal" ? "Vim / Terminal" : "VS Code"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            className="flex items-center justify-between py-1.5 px-2 rounded"
            style={{ backgroundColor: tokens.muted }}
          >
            <div className="flex flex-col">
              <span className="text-[11px]" style={{ color: tokens.foreground }}>
                {cmd.name}
              </span>
              <span className="text-[10px]" style={{ color: tokens.mutedForeground }}>
                {cmd.description}
              </span>
            </div>
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ml-4"
              style={{
                backgroundColor: tokens.card,
                border: `1px solid ${tokens.border}`,
                color: tokens.mutedForeground,
              }}
            >
              {getBinding(cmd.id) || "—"}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
