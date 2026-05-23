import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import WindowChrome from "./WindowChrome";
import { usePanelSize, usePanelSizeVertical, resetPanelLayout } from "@/hooks/usePanelSize";
import { PanelSplitter } from "@/components/ui/PanelSplitter";
import { FileExplorer } from "@/modules/explorer";
import { ThemeProvider } from "@/modules/theme/ThemeProvider";

// Lazy-load heavy editor + terminal (CodeMirror + xterm.js ~500kB combined)
const EditorPane = lazy(() => import("@/modules/editor/EditorPane"));
const TerminalTabs = lazy(() => import("@/modules/terminal/TerminalTabs"));

import { useGlobalShortcuts } from "@/modules/shortcuts/hooks/useGlobalShortcuts";
import { registerCommand } from "@/modules/shortcuts/shortcuts";
import { openSettingsWindow } from "@/modules/settings/openSettingsWindow";
import { AgentPopup } from "@/modules/agent-shell";
import { useWorkspaceEnvStore, type WorkspaceEnv } from "@/modules/workspace";
import WorkspacePicker from "@/modules/workspace/components/WorkspacePicker";
import SearchPanel from "@/modules/search/SearchPanel";
import OnboardingWizard from "@/modules/onboarding/OnboardingWizard";
import { invoke } from "@tauri-apps/api/core";
import { loadSession, saveSession, type SessionData } from "@/lib/session";
import { useAgentShellStore } from "@/modules/agent-shell/store";

// Lazy-load preview panel (react-markdown ~160 kB)
const PreviewPanel = lazy(() => import("@/modules/preview/PreviewPanel"));
// Lazy-load diff viewer (CodeMirror merge ~50 kB)
const DiffView = lazy(() => import("@/modules/diff/DiffView"));

interface OpenFile {
  path: string;
  name: string;
}

function getWorkspaceRootPath(env: WorkspaceEnv): string {
  if (env.kind === "local") return env.rootPath;
  // For WSL on Windows, paths are UNC: \\wsl.localhost\{distro}\...
  // Since we're developing on Linux, we can't construct real WSL UNC paths here.
  // The Rust backend handles WSL path resolution.
  return env.rootPath;
}

function AppContent() {
  const { env: workspaceEnv } = useWorkspaceEnvStore();
  const workspacePath = getWorkspaceRootPath(workspaceEnv);

  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [terminalState, setTerminalState] = useState<{ tabs: { id: string; name: string; cwd: string }[]; activeId: string } | null>(null);
  const agentTabs = useAgentShellStore((s) => s.tabs);
  const activeAgentTabId = useAgentShellStore((s) => s.activeTabId);
  // Panel resize state (persisted)
  const [sidebarPx, sidebarDrag] = usePanelSize("sidebar", 224, 160, 400);
  const [terminalPx, terminalDrag] = usePanelSizeVertical("terminal", 192, 80, 600);

  const [showExplorer, setShowExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 600);
  const [isShort, setIsShort] = useState(window.innerHeight < 400);

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 600);
      setIsShort(window.innerHeight < 400);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [agentPopupOpen, setAgentPopupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffData, setDiffData] = useState<{ original: string; modified: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has completed onboarding before
    try {
      return localStorage.getItem("antler:onboarding") !== "done";
    } catch {
      return true;
    }
  });

  useGlobalShortcuts();

  // Register commands
  useEffect(() => {
  // Load session on mount
  useEffect(() => {
    loadSession().then((s) => {
      if (s) {
        setOpenFiles(s.openFiles);
        setActiveFilePath(s.activeFilePath);
        if (s.terminalTabs.length > 0) {
          setTerminalState({ tabs: s.terminalTabs, activeId: s.activeTerminalId });
        }
      }
      setSessionReady(true);
    });
  }, []);

  // Save session on changes (debounced via LazyStore auto-save)
  useEffect(() => {
    if (!sessionReady) return;
    const timeout = setTimeout(() => {
      const s: Omit<SessionData, "version"> = {
        openFiles,
        activeFilePath,
        terminalTabs: terminalState?.tabs ?? [{ id: "t-1", name: "bash", cwd: workspacePath }],
        activeTerminalId: terminalState?.activeId ?? "t-1",
        agentTabs,
        activeAgentTabId,
      };
      void saveSession(s as SessionData);
    }, 500);
    return () => clearTimeout(timeout);
  }, [openFiles, activeFilePath, terminalState, agentTabs, activeAgentTabId, sessionReady, workspacePath]);

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
    registerCommand({
      id: "settings",
      name: "Settings",
      description: "Open settings window",
      defaultBinding: "Space+,",
      action: () => void openSettingsWindow("general"),
    });
    registerCommand({
      id: "search-files",
      name: "Search Files",
      description: "Search across files",
      defaultBinding: "Shift+Space+f",
      action: () => setSearchOpen(true),
    });
    registerCommand({
      id: "reset-layout",
      name: "Reset Layout",
      description: "Reset panel sizes to defaults",
      defaultBinding: "",
      action: () => {
        resetPanelLayout();
        window.location.reload();
      },
    });
    registerCommand({
      id: "toggle-diff",
      name: "Toggle Diff",
      description: "Open git diff for the active file",
      defaultBinding: "Space+d",
      action: async () => {
        if (!activeFilePath) return;
        if (diffOpen) {
          setDiffOpen(false);
          return;
        }
        try {
          const [original, modified] = await Promise.all([
            invoke<string>("git_show", { path: activeFilePath }),
            invoke<string>("fs_read_file", { path: activeFilePath }),
          ]);
          if (original === modified) {
            // No changes — show empty diff or skip
          }
          setDiffData({ original, modified });
          setDiffOpen(true);
        } catch (e) {
          console.error("Failed to load diff:", e);
        }
      },
    });
    registerCommand({
      id: "toggle-preview",
      name: "Toggle Preview",
      description: "Toggle preview panel for Markdown files",
      defaultBinding: "Space+p",
      action: () => setPreviewOpen((v) => !v),
    });
    registerCommand({
      id: "preview-url",
      name: "Preview URL",
      description: "Open a URL in the preview panel",
      defaultBinding: "",
      action: () => {
        const url = window.prompt("Enter URL to preview:", "http://localhost:1420");
        if (url) {
          setPreviewUrl(url);
          setPreviewOpen(true);
        }
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const workspaceLabel =
    workspaceEnv.kind === "local"
      ? workspacePath
      : `WSL:${workspaceEnv.distro} → ${workspacePath}`;

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden font-mono bg-background text-foreground"
    >
      {!zenMode && (
        <WindowChrome
          workspaceLabel={workspaceLabel}
          workspaceEnv={workspaceEnv}
          agentStatus={null}
          onToggleExplorer={() => setShowExplorer((v) => !v)}
        />
      )}

      <div className="flex flex-1 min-h-0">
        {showExplorer && !zenMode && !isNarrow && (
          <aside
            className="shrink-0 border-r border-border flex flex-col overflow-hidden"
            style={{ width: sidebarPx }}
          >
            <FileExplorer
              rootPath={workspacePath}
              onFileClick={handleFileClick}
            />
          </aside>
        )}

        {showExplorer && !zenMode && !isNarrow && (
          <PanelSplitter orientation="vertical" onMouseDown={sidebarDrag.onMouseDown} />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          {openFiles.length > 0 && !zenMode && (
            <div
              className="flex items-center h-8 shrink-0 border-b border-border bg-muted overflow-x-auto no-scrollbar"
            >
              {openFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className={`flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none ${
                    file.path === activeFilePath
                      ? "bg-card text-foreground border-t-2 border-t-neon-cyan"
                      : "bg-transparent text-muted-foreground border-t-2 border-t-transparent"
                  }`}
                >
                  <span>{file.name}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                    className="ml-1 opacity-0 hover:opacity-100 cursor-pointer text-muted-foreground"
                  >
                    ×
                  </span>
                </button>
              ))}
              {/* Diff toggle */}
              {activeFilePath && (
                <button
                  onClick={() => {
                    if (diffOpen) { setDiffOpen(false); return; }
                    Promise.all([
                      invoke<string>("git_show", { path: activeFilePath }),
                      invoke<string>("fs_read_file", { path: activeFilePath }),
                    ]).then(([original, modified]) => {
                      setDiffData({ original, modified });
                      setDiffOpen(true);
                    }).catch(console.error);
                  }}
                  className={`px-2 h-8 text-[10px] shrink-0 transition-colors ${
                    diffOpen
                      ? "text-neon-cyan border-l border-border bg-card"
                      : "text-muted-foreground hover:text-foreground border-l border-border"
                  }`}
                  title="Git diff"
                  aria-label="Git diff"
                >
                  {diffOpen ? "▸ Edit" : "◂ Diff"}
                </button>
              )}
              {/* Preview toggle */}
              {activeFilePath && /\.md$/i.test(activeFilePath) && (
                <button
                  onClick={() => setPreviewOpen((v) => !v)}
                  className={`px-2 h-8 text-[10px] shrink-0 transition-colors ${
                    previewOpen
                      ? "text-neon-cyan border-l border-border bg-card"
                      : "text-muted-foreground hover:text-foreground border-l border-border"
                  }`}
                  title="Toggle preview"
                  aria-label="Toggle preview"
                >
                  {previewOpen ? "▸ Editor" : "◂ Preview"}
                </button>
              )}
            </div>
          )}

          <div className="flex-1 flex min-h-0">
            {/* Editor column */}
            <div className="flex-1 flex flex-col min-w-0">
            {activeFilePath ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col gap-2 w-64">
                    <div className="h-3 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              }>
                <EditorPane filePath={activeFilePath} />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground animate-fade-in"
              >
                <div className="text-center space-y-3">
                  <div className="font-bold text-lg text-neon-cyan">
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

            {showTerminal && !zenMode && !isShort && (
              <PanelSplitter orientation="horizontal" onMouseDown={terminalDrag.onMouseDown} />
            )}
            {showTerminal && !zenMode && !isShort && (
              <div
                className="shrink-0 border-t border-border"
                style={{ height: terminalPx }}
              >
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center text-muted-foreground text-[10px]">
                    Loading terminal…
                  </div>
                }>
                  <TerminalTabs
                    defaultCwd={workspacePath}
                    initialTabs={terminalState?.tabs}
                    initialActiveId={terminalState?.activeId}
                    onSessionChange={(tabs, activeId) => setTerminalState({ tabs, activeId })}
                  />
                </Suspense>
              </div>
            )}
            </div>

          {/* Diff panel */}
          {diffOpen && !zenMode && diffData && (
            <div className="flex-1 shrink-0 border-l border-border flex flex-col min-w-0">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full text-muted-foreground text-[11px]">
                  Loading diff…
                </div>
              }>
                <DiffView
                  original={diffData.original}
                  modified={diffData.modified}
                  filePath={activeFilePath ?? ""}
                  onClose={() => { setDiffOpen(false); setDiffData(null); }}
                />
              </Suspense>
            </div>
          )}

          {/* Preview panel */}
          {previewOpen && !zenMode && (
            <div className="w-96 shrink-0 border-l border-border flex flex-col">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full text-muted-foreground text-[11px]">
                  Loading preview…
                </div>
              }>
                <PreviewPanel
                  filePath={activeFilePath}
                  previewUrl={previewUrl}
                  onClose={() => { setPreviewOpen(false); setPreviewUrl(null); }}
                />
              </Suspense>
            </div>
          )}
          </div>
        </main>
      </div>

      {!zenMode && (
        <footer
          className="h-6 shrink-0 border-t border-border bg-muted text-muted-foreground flex items-center px-3 gap-4 text-[10px]"
        >
          <WorkspacePicker />
          <span className="w-px h-3 bg-border" />
          <span className="text-neon-cyan">
            {activeFilePath ? activeFilePath.split("/").pop() : "READY"}
          </span>
          <span className="flex-1" />
          <span>{openFiles.length > 0 ? `${openFiles.length} tabs` : ""}</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>Tab: 2</span>
        </footer>
      )}

      {/* Agent popup */}
      <AgentPopup
        open={agentPopupOpen}
        onClose={() => setAgentPopupOpen(false)}
        workspaceEnv={workspaceEnv}
      />

      {/* Search panel */}
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onFileClick={handleFileClick}
      />

      {/* Onboarding wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => {
            setShowOnboarding(false);
            try {
              localStorage.setItem("antler:onboarding", "done");
            } catch {
              // ignore
            }
          }}
        />
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
