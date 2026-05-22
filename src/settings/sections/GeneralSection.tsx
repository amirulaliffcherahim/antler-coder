import { usePreferencesStore } from "@/modules/settings/preferences";
import { useTheme } from "@/modules/theme/ThemeProvider";

export function GeneralSection() {
  const { tokens } = useTheme();
  const {
    fontSize,
    setFontSize,
    tabSize,
    setTabSize,
    vimMode,
    setVimMode,
    wordWrap,
    setWordWrap,
    minimap,
    setMinimap,
    defaultShell,
    setDefaultShell,
    terminalFontSize,
    setTerminalFontSize,
  } = usePreferencesStore();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        General
      </h2>

      {/* Editor */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wide" style={{ color: tokens.mutedForeground }}>
          Editor
        </h3>

        <SettingRow label="Font size" tokens={tokens}>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 h-7 px-2 text-[11px] rounded border bg-transparent"
            style={{ borderColor: tokens.border, color: tokens.foreground }}
            min={8}
            max={32}
            step={0.5}
          />
        </SettingRow>

        <SettingRow label="Tab size" tokens={tokens}>
          <input
            type="number"
            value={tabSize}
            onChange={(e) => setTabSize(Number(e.target.value))}
            className="w-16 h-7 px-2 text-[11px] rounded border bg-transparent"
            style={{ borderColor: tokens.border, color: tokens.foreground }}
            min={1}
            max={8}
          />
        </SettingRow>

        <ToggleRow label="Vim mode" tokens={tokens} checked={vimMode} onChange={setVimMode} />
        <ToggleRow label="Word wrap" tokens={tokens} checked={wordWrap} onChange={setWordWrap} />
        <ToggleRow label="Minimap" tokens={tokens} checked={minimap} onChange={setMinimap} />
      </div>

      {/* Terminal */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wide" style={{ color: tokens.mutedForeground }}>
          Terminal
        </h3>

        <SettingRow label="Default shell" tokens={tokens}>
          <input
            type="text"
            value={defaultShell}
            onChange={(e) => setDefaultShell(e.target.value)}
            className="w-48 h-7 px-2 text-[11px] rounded border bg-transparent font-mono"
            style={{ borderColor: tokens.border, color: tokens.foreground }}
          />
        </SettingRow>

        <SettingRow label="Font size" tokens={tokens}>
          <input
            type="number"
            value={terminalFontSize}
            onChange={(e) => setTerminalFontSize(Number(e.target.value))}
            className="w-16 h-7 px-2 text-[11px] rounded border bg-transparent"
            style={{ borderColor: tokens.border, color: tokens.foreground }}
            min={8}
            max={32}
          />
        </SettingRow>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  tokens,
  children,
}: {
  label: string;
  tokens: { mutedForeground: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[11px] shrink-0" style={{ color: tokens.mutedForeground }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  tokens,
  checked,
  onChange,
}: {
  label: string;
  tokens: { mutedForeground: string; neonCyan: string; border: string };
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[11px] shrink-0" style={{ color: tokens.mutedForeground }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className="w-8 h-4 rounded-full transition-colors relative"
        style={{
          backgroundColor: checked ? tokens.neonCyan : tokens.border,
        }}
      >
        <span
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
          style={{ left: checked ? "calc(100% - 14px)" : "2px" }}
        />
      </button>
    </div>
  );
}
