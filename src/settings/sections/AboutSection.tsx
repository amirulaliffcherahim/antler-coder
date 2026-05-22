import { useTheme } from "@/modules/theme/ThemeProvider";

export function AboutSection() {
  const { tokens } = useTheme();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        About
      </h2>

      <div className="flex flex-col gap-2">
        <div className="text-[24px] font-bold" style={{ color: tokens.neonCyan }}>
          ANTLER CODER
        </div>
        <div className="text-[11px]" style={{ color: tokens.mutedForeground }}>
          v0.1.0 — Universal Agent Shell
        </div>
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: tokens.foreground }}>
        Antler Coder is a lightweight, open-source developer environment built for power users.
        It is not an AI agent — it is a universal agent shell that hosts external CLI agents
        (Claude Code, Gemini CLI, Aider, Pi, Hermes, etc.) inside a multi-tab floating terminal popup.
      </p>

      <div className="flex flex-col gap-1 text-[11px]" style={{ color: tokens.mutedForeground }}>
        <div>License: MIT</div>
        <div>Repository: github.com/amirulaliffcherahim/antler-coder</div>
      </div>
    </div>
  );
}
