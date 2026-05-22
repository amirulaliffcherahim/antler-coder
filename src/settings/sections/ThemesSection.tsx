import { useTheme } from "@/modules/theme/useTheme";

export function ThemesSection() {
  const { tokens, themeId, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        Themes
      </h2>

      <div className="flex flex-col gap-2">
        <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
          Active theme
        </label>
        <button
          onClick={() => setTheme("neon-dark")}
          className="flex items-center gap-3 p-3 rounded border transition-colors text-left"
          style={{
            borderColor: themeId === "neon-dark" ? tokens.neonCyan : tokens.border,
            backgroundColor: themeId === "neon-dark" ? `${tokens.neonCyan}10` : tokens.card,
          }}
        >
          <div
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: "#0a0a0a", borderColor: "#222" }}
          >
            <div className="w-2 h-2 rounded-full m-1" style={{ backgroundColor: "#00f0ff" }} />
          </div>
          <div>
            <div className="text-[11px] font-medium" style={{ color: tokens.foreground }}>
              Neon Dark
            </div>
            <div className="text-[10px]" style={{ color: tokens.mutedForeground }}>
              Default hacker aesthetic
            </div>
          </div>
        </button>
      </div>

      <div className="text-[11px]" style={{ color: tokens.mutedForeground }}>
        More themes coming in future updates.
      </div>
    </div>
  );
}
