import { useTheme } from "@/modules/theme/useTheme";

export function ThemesSection() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold text-neon-cyan">
        Themes
      </h2>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] text-muted-foreground">
          Active theme
        </label>
        <button
          onClick={() => setTheme("neon-dark")}
          className={`flex items-center gap-3 p-3 rounded border transition-colors text-left ${
            themeId === "neon-dark" ? "border-neon-cyan bg-neon-cyan/10" : "border-border bg-card"
          }`}
        >
          <div
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: "#0a0a0a", borderColor: "#222" }}
          >
            <div className="w-2 h-2 rounded-full m-1" style={{ backgroundColor: "#00f0ff" }} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-foreground">
              Neon Dark
            </div>
            <div className="text-[10px] text-muted-foreground">
              Default hacker aesthetic
            </div>
          </div>
        </button>
      </div>

      <div className="text-[11px] text-muted-foreground">
        More themes coming in future updates.
      </div>
    </div>
  );
}
