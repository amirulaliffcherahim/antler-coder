export function AboutSection() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold text-neon-cyan">
        About
      </h2>

      <div className="flex flex-col gap-2">
        <div className="text-[24px] font-bold text-neon-cyan">
          ANTLER CODER
        </div>
        <div className="text-[11px] text-muted-foreground">
          v0.1.0 — Universal Agent Shell
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-foreground">
        Antler Coder is a lightweight, open-source developer environment built for power users.
        It is not an AI agent — it is a universal agent shell that hosts external CLI agents
        (Claude Code, Gemini CLI, Aider, Pi, Hermes, etc.) inside a multi-tab floating terminal popup.
      </p>

      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
        <div>License: MIT</div>
        <div>Repository: github.com/amirulaliffcherahim/antler-coder</div>
      </div>
    </div>
  );
}
