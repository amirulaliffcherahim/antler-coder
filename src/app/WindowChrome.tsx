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
  return (
    <header
      data-tauri-drag-region
      className="h-8 shrink-0 flex items-center bg-muted/40 border-b border-border select-none"
    >
      {/* Left: menu + title */}
      <div className="flex items-center gap-2 px-3">
        <button
          onClick={onToggleExplorer}
          className="text-muted-foreground hover:text-foreground text-[10px] w-4 text-center"
          title="Toggle explorer"
        >
          ≡
        </button>
        <span className="text-[10px] font-medium tracking-wide opacity-70">
          ANTLER CODER
        </span>
      </div>

      {/* Center: workspace path */}
      <div className="flex-1 flex justify-center">
        <span className="text-[10px] text-muted-foreground truncate max-w-md">
          {workspacePath ?? "No workspace"}
          {agentStatus && (
            <span className="ml-2">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                  agentStatus.running ? "bg-neon-green" : "bg-muted-foreground"
                }`}
              />
              {agentStatus.name}
            </span>
          )}
        </span>
      </div>

      {/* Right: window controls */}
      <div className="flex items-center">
        <WindowButton>─</WindowButton>
        <WindowButton>□</WindowButton>
        <WindowButton className="hover:bg-destructive hover:text-destructive-foreground">
          ×
        </WindowButton>
      </div>
    </header>
  );
}

function WindowButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`w-10 h-8 flex items-center justify-center text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
