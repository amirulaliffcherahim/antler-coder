import { useTheme } from "@/modules/theme/useTheme";

interface ThemeOption {
  id: "neon-dark" | "zinc-dark";
  name: string;
  description: string;
  bg: string;
  border: string;
  accent: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "neon-dark",
    name: "Zinc Dark",
    description: "Muted zinc with teal accents — calm, workspace-focused",
    bg: "#09090b",
    border: "#27272a",
    accent: "#2dd4bf",
  },
  {
    id: "zinc-dark",
    name: "Zinc Blue",
    description: "Same zinc base with blue primary accent",
    bg: "#09090b",
    border: "#27272a",
    accent: "#3b82f6",
  },
];

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
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-3 p-3 rounded border transition-colors text-left ${
              themeId === opt.id ? "border-neon-cyan bg-neon-cyan/10" : "border-border bg-card"
            }`}
          >
            <div
              className="w-8 h-8 rounded border shrink-0"
              style={{ backgroundColor: opt.bg, borderColor: opt.border }}
            >
              <div
                className="w-2 h-2 rounded-full m-1"
                style={{ backgroundColor: opt.accent }}
              />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-medium text-foreground">
                {opt.name}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {opt.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
