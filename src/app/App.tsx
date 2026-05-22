import { useState, useCallback, useEffect } from "react";
import WindowChrome from "./WindowChrome";
import { FileExplorer } from "@/modules/explorer";
import { EditorPane } from "@/modules/editor";
import { TerminalTabs } from "@/modules/terminal";
import { ThemeProvider, useTheme } from "@/modules/theme/ThemeProvider";
import { useGlobalShortcuts } from "@/modules/shortcuts/hooks/useGlobalShortcuts";
import { registerCommand } from "@/modules/shortcuts/shortcuts";

interface OpenFile {
  path: string;
  name: string;
}

function AppContent() {
  const { tokens } = useTheme();
  const [workspacePath] = useState<string>("/home/aleph");
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [agentPopupOpen, setAgentPopupOpen] = useState(false);

  useGlobalShortcuts();

  // Register commands
  useEffect(() => {
    registerCommand({
      id: "toggle-explorer",
      name: "Toggle Explorer",
      description: "Show/hide file explorer sidebar",
      defaultBinding: "Space+e",
      action: () => setShowExplorer((v) => !v),
    });
    registerCommand({
      id: "toggle-terminal",
      name: "Toggle Terminal",
      description: "Show/hide terminal panel",
      defaultBinding: "Space+t",
      action: () => setShowTerminal((v) => !v),
    });
    registerCommand({
      id: "zen-mode",
      name: "Zen Mode",
      description: "Hide all chrome except editor",
      defaultBinding: "Space+z",
      action: () => setZenMode((v) => !v),
    });
    registerCommand({
      id: "agent-popup",
      name: "Agent Popup",
      description: "Open agent popup",
      defaultBinding: "Space+a",
      action: () => setAgentPopupOpen((v) => !v),
    });
    registerCommand({
      id: "close-tab",
      name: "Close Tab",
      description: "Close active editor tab",
      defaultBinding: "Space+q",
      action: () => {
        if (activeFilePath) closeFile(activeFilePath);
      },
    });
  }, [activeFilePath]);

  const handleFileClick = useCallback((path: string) => {
    const name = path.split("/").pop() ?? path;
    setOpenFiles((prev) => {
      if (prev.some((f) => f.path === path)) {
        setActiveFilePath(path);
        return prev;
      }
      return [...prev, { path, name }];
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
    <div
      className="flex h-screen w-screen flex-col overflow-hidden font-mono"
      style={{
        backgroundColor: tokens.background,
        color: tokens.foreground,
      }}
    >
      {!zenMode && (
        <WindowChrome
          workspacePath={workspacePath}
          agentStatus={null}
          onToggleExplorer={() => setShowExplorer((v) => !v)}
        />
      )}

      <div className="flex flex-1 min-h-0">
        {showExplorer && !zenMode && (
          <aside
            className="w-56 shrink-0 border-r flex flex-col overflow-hidden"
            style={{ borderColor: tokens.border }}
          >
            <FileExplorer
              rootPath={workspacePath}
              onFileClick={handleFileClick}
            />
          </aside>
        )}

        <main className="flex-1 flex flex-col min-w-0">
          {openFiles.length > 0 && !zenMode && (
            <div
              className="flex items-center h-8 shrink-0 border-b overflow-x-auto no-scrollbar"
              style={{ borderColor: tokens.border, backgroundColor: tokens.muted }}
            >
              {openFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className="flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none"
                  style={{
                    backgroundColor:
                      file.path === activeFilePath
                        ? tokens.card
                        : "transparent",
                    color:
                      file.path === activeFilePath
                        ? tokens.foreground
                        : tokens.mutedForeground,
                    borderTop:
                      file.path === activeFilePath
                        ? `2px solid ${tokens.neonCyan}`
                        : "2px solid transparent",
                  }}
                >
                  <span>{file.name}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                    className="ml-1 opacity-0 hover:opacity-100 cursor-pointer"
                    style={{ color: tokens.mutedForeground }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            {activeFilePath ? (
              <EditorPane filePath={activeFilePath} />
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: tokens.mutedForeground }}
              >
                <div className="text-center space-y-3">
                  <div
                    className="font-bold text-lg"
                    style={{ color: tokens.neonCyan }}
                  >
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

          {showTerminal && !zenMode && (
            <div
              className="h-48 shrink-0 border-t"
              style={{ borderColor: tokens.border }}
            >
              <TerminalTabs defaultCwd={workspacePath} />
            </div>
          )}
        </main>
      </div>

      {!zenMode && (
        <footer
          className="h-6 shrink-0 border-t flex items-center px-3 gap-4 text-[10px]"
          style={{
            borderColor: tokens.border,
            backgroundColor: tokens.muted,
            color: tokens.mutedForeground,
          }}
        >
          <span style={{ color: tokens.neonCyan }}>
            {activeFilePath ? activeFilePath.split("/").pop() : "READY"}
          </span>
          <span className="flex-1" />
          <span>{openFiles.length > 0 ? `${openFiles.length} tabs` : ""}</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>Tab: 2</span>
        </footer>
      )}

      {/* Agent popup placeholder */}
      {agentPopupOpen && (
        <div
          className="fixed right-4 bottom-8 z-50 flex flex-col overflow-hidden rounded border shadow-2xl"
          style={{
            width: "min(34rem, calc(100vw - 2rem))",
            height: "min(32rem, calc(100vh - 6rem))",
            backgroundColor: tokens.card,
            borderColor: tokens.border,
            boxShadow: `0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px ${tokens.border}`,
          }}
        >
          <div
            className="flex h-9 items-center justify-between px-3 border-b shrink-0"
            style={{ borderColor: tokens.border }}
          >
            <span className="text-[11px] font-medium" style={{ color: tokens.neonCyan }}>
              Agent Terminal
            </span>
            <button
              onClick={() => setAgentPopupOpen(false)}
              className="text-muted-foreground hover:text-foreground text-[10px]"
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-[11px]" style={{ color: tokens.mutedForeground }}>
            Agent popup — Phase 4 implementation
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
