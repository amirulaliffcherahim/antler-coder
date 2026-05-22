import { usePreferencesStore } from "@/modules/settings/preferences";
import { getAllCommands, getBinding } from "@/modules/shortcuts/shortcuts";

export function ShortcutsSection() {
  const { keybindingPreset, setKeybindingPreset } = usePreferencesStore();
  const commands = getAllCommands();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold text-neon-cyan">
        Shortcuts
      </h2>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] text-muted-foreground">
          Keybinding preset
        </label>
        <div className="flex gap-2">
          {(["vim-terminal", "vscode"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setKeybindingPreset(preset)}
              className={`px-3 py-1.5 text-[11px] rounded border transition-colors text-foreground ${keybindingPreset === preset ? "border-neon-cyan bg-neon-cyan/10" : "border-border bg-transparent"}`}
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
            className="flex items-center justify-between py-1.5 px-2 rounded bg-muted"
          >
            <div className="flex flex-col">
              <span className="text-[11px] text-foreground">
                {cmd.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cmd.description}
              </span>
            </div>
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ml-4 bg-card border border-border text-muted-foreground"
            >
              {getBinding(cmd.id) || "—"}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
