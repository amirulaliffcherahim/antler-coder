import { useState, useCallback } from "react";
import WindowChrome from "./WindowChrome";
import { FileExplorer } from "@/modules/explorer";
import { EditorPane } from "@/modules/editor";
import { TerminalTabs } from "@/modules/terminal";

interface OpenFile {
  path: string;
  name: string;
}

function App() {
  const [workspacePath] = useState<string>("/home/aleph");
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);

  const handleFileClick = useCallback((path: string) => {
    const name = path.split("/").pop() ?? path;
    setOpenFiles((prev) => {
      if (prev.some((f) => f.path === path)) {
        setActiveFilePath(path);
        return prev;
      }
      const next = [...prev, { path, name }];
      return next;
    });
    setActiveFilePath(path);
  }, []);

  const closeFile = useCallback(
    (path: string) => {
      setOpenFiles((prev) => {
        const idx = prev.findIndex((f) => f.path === path);
        const next = prev.filter((f) => f.path !== path);
        if (activeFilePath === path) {
          const newActive = prev[idx === 0 ? 1 : idx - 1];
          setActiveFilePath(newActive?.path ?? null);
        }
        return next;
      });
    },
    [activeFilePath]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground font-mono">
      <WindowChrome
        workspacePath={workspacePath}
        agentStatus={null}
        onToggleExplorer={() => setShowExplorer((v) => !v)}
      />

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: Explorer */}
        {showExplorer && (
          <aside className="w-56 shrink-0 border-r border-border flex flex-col overflow-hidden">
            <FileExplorer
              rootPath={workspacePath}
              onFileClick={handleFileClick}
            />
          </aside>
        )}

        {/* Editor area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Editor tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center h-8 shrink-0 border-b border-border bg-muted/20 overflow-x-auto no-scrollbar">
              {openFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className={
                    "flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none " +
                    (file.path === activeFilePath
                      ? "bg-card text-foreground border-t-2 border-t-neon-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20")
                  }
                >
                  <span>{file.name}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                    className="ml-1 opacity-0 hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Editor content */}
          <div className="flex-1 min-h-0 relative">
            {activeFilePath ? (
              <EditorPane filePath={activeFilePath} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-[12px]">
                <div className="text-center space-y-3">
                  <div className="text-neon-cyan font-bold text-lg">
                    ANTLER CODER
                  </div>
                  <div className="opacity-60">v0.1.0 — Universal Agent Shell</div>
                  <div className="text-[10px] opacity-40 mt-4 space-y-1">
                    <div>Space+e Explorer · Space+t Terminal · Space+a Agent</div>
                    <div>Click a file in the explorer to start editing</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="h-48 shrink-0 border-t border-border">
            <TerminalTabs defaultCwd={workspacePath} />
          </div>
        </main>
      </div>

      {/* Status bar */}
      <footer className="h-6 shrink-0 border-t border-border bg-muted/20 flex items-center px-3 gap-4 text-[10px] text-muted-foreground">
        <span className="text-neon-cyan">
          {activeFilePath ? activeFilePath.split("/").pop() : "READY"}
        </span>
        <span className="flex-1" />
        <span>{openFiles.length > 0 ? `${openFiles.length} tabs` : ""}</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Tab: 2</span>
      </footer>
    </div>
  );
}

export default App;
