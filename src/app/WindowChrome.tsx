import { useTheme } from "@/modules/theme/ThemeProvider";

interface WindowChromeProps {
  workspacePath: string | null;
  agentStatus: { name: string; running: boolean } | null;
  onToggleExplorer?: () => void;
}

export default function WindowChrome({
  workspacePath,
  agentStatus,
  onToggleExplorer,
}: WindowChromeProps) {
  const { tokens } = useTheme();

  return (
    <header
      data-tauri-drag-region
      className="h-8 shrink-0 flex items-center select-none"
      style={{
        backgroundColor: tokens.muted,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      {/* Left: menu + title */}
      <div className="flex items-center gap-2 px-3">
        <button
          onClick={onToggleExplorer}
          className="text-[10px] w-4 text-center hover:opacity-100 opacity-70 transition-opacity"
          style={{ color: tokens.mutedForeground }}
          title="Toggle explorer"
        >
          ≡
        </button>
        <span
          className="text-[10px] font-medium tracking-wide"
          style={{ color: tokens.mutedForeground }}
        >
          ANTLER CODER
        </span>
      </div>

      {/* Center: workspace path */}
      <div className="flex-1 flex justify-center">
        <span
          className="text-[10px] truncate max-w-md"
          style={{ color: tokens.mutedForeground }}
        >
          {workspacePath ?? "No workspace"}
          {agentStatus && (
            <span className="ml-2">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{
                  backgroundColor: agentStatus.running
                    ? tokens.neonGreen
                    : tokens.mutedForeground,
                }}
              />
              {agentStatus.name}
            </span>
          )}
        </span>
      </div>

      {/* Right: window controls */}
      <div className="flex items-center">
        <WindowButton tokens={tokens}>─</WindowButton>
        <WindowButton tokens={tokens}>□</WindowButton>
        <WindowButton
          tokens={tokens}
          hoverBg={tokens.destructive}
          hoverColor={tokens.destructiveForeground}
        >
          ×
        </WindowButton>
      </div>
    </header>
  );
}

function WindowButton({
  children,
  tokens,
  hoverBg,
  hoverColor,
}: {
  children: React.ReactNode;
  tokens: { mutedForeground: string; foreground: string; accent: string };
  hoverBg?: string;
  hoverColor?: string;
}) {
  return (
    <button
      className="w-10 h-8 flex items-center justify-center text-[10px] transition-colors"
      style={{
        color: tokens.mutedForeground,
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        btn.style.backgroundColor = hoverBg ?? tokens.accent;
        btn.style.color = hoverColor ?? tokens.foreground;
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.backgroundColor = "transparent";
        btn.style.color = tokens.mutedForeground;
      }}
    >
      {children}
    </button>
  );
}
