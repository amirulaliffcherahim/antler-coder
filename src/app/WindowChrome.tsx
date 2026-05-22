
import { getCurrentWindow } from "@tauri-apps/api/window";
import WorkspacePicker from "@/modules/workspace/components/WorkspacePicker";
import type { WorkspaceEnv } from "@/modules/workspace";

interface WindowChromeProps {
  workspaceLabel: string;
  workspaceEnv: WorkspaceEnv;
  agentStatus: { name: string; running: boolean } | null;
  onToggleExplorer?: () => void;
}

export default function WindowChrome({
  workspaceLabel,
  agentStatus,
  onToggleExplorer,
}: WindowChromeProps) {


  return (
    <header
      data-tauri-drag-region
      className="h-8 shrink-0 flex items-center select-none bg-muted border-b border-border"
    >
      {/* Left: menu + title + workspace picker */}
      <div className="flex items-center gap-2 px-3">
        <button
          onClick={onToggleExplorer}
          className="text-[10px] w-4 text-center hover:opacity-100 opacity-70 transition-opacity text-muted-foreground"
          title="Toggle explorer"
          aria-label="Toggle explorer"
        >
          ≡
        </button>
        <span
          className="text-[10px] font-medium tracking-wide text-muted-foreground"
        >
          ANTLER CODER
        </span>
        <span className="text-[10px] opacity-30">|</span>
        <WorkspacePicker />
      </div>

      {/* Center: workspace path */}
      <div className="flex-1 flex justify-center">
        <span
          className="text-[10px] truncate max-w-md text-muted-foreground"
        >
          {workspaceLabel}
          {agentStatus && (
            <span className="ml-2">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                  agentStatus.running ? "bg-green-400" : "bg-muted-foreground"
                }`}
              />
              {agentStatus.name}
            </span>
          )}
        </span>
      </div>

      {/* Right: window controls */}
      <div className="flex items-center">
        <WindowButton onClick={() => { getCurrentWindow().minimize(); }} aria-label="Minimize">
          ─
        </WindowButton>
        <WindowButton onClick={() => { getCurrentWindow().toggleMaximize(); }} aria-label="Maximize">
          □
        </WindowButton>
        <WindowButton isClose onClick={() => { getCurrentWindow().close(); }} aria-label="Close">
          ×
        </WindowButton>
      </div>
    </header>
  );
}

function WindowButton({
  children,
  isClose,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  isClose?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-10 h-8 flex items-center justify-center text-[10px] text-muted-foreground transition-colors ${
        isClose
          ? "hover:bg-destructive hover:text-destructive-foreground"
          : "hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
