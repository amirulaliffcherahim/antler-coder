import { useState } from "react";
import WindowChrome from "./WindowChrome";

function App() {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground font-mono">
      <WindowChrome
        workspacePath={workspacePath}
        agentStatus={null}
      />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-card/30 flex flex-col">
          <div className="px-3 py-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase border-b border-border">
            Explorer
          </div>
          <div className="flex-1 overflow-auto p-2">
            {workspacePath ? (
              <div className="text-[11px] text-muted-foreground">
                <div className="mb-1 truncate">{workspacePath}</div>
                <div className="pl-2 border-l border-border">
                  {/* File tree will be rendered here */}
                  <span className="opacity-50">No files scanned yet</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[11px] text-muted-foreground gap-2">
                <span>No workspace open</span>
                <button
                  onClick={() => setWorkspacePath("/home/user/projects")}
                  className="text-neon-cyan hover:underline"
                >
                  Open folder...
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Editor area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Editor placeholder */}
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-[12px]">
            <div className="text-center space-y-3">
              <div className="text-neon-cyan font-bold text-lg">ANTLER CODER</div>
              <div className="opacity-60">v0.1.0 — Universal Agent Shell</div>
              <div className="text-[10px] opacity-40 mt-4">
                Space+e Explorer · Space+t Terminal · Space+a Agent
              </div>
            </div>
          </div>

          {/* Terminal area */}
          <div className="h-48 shrink-0 border-t border-border bg-card/30">
            <div className="flex items-center gap-1 px-2 h-7 border-b border-border bg-muted/30">
              <span className="text-[10px] text-muted-foreground">Terminal</span>
              <span className="flex-1" />
              <span className="text-[10px] text-muted-foreground">bash</span>
            </div>
            <div className="p-2 text-[11px] text-muted-foreground">
              Terminal will appear here...
            </div>
          </div>
        </main>
      </div>

      {/* Status bar */}
      <footer className="h-6 shrink-0 border-t border-border bg-muted/20 flex items-center px-3 gap-4 text-[10px] text-muted-foreground">
        <span>{workspacePath ? "READY" : "NO WORKSPACE"}</span>
        <span className="flex-1" />
        <span>UTF-8</span>
        <span>LF</span>
        <span>Tab: 2</span>
      </footer>
    </div>
  );
}

export default App;
