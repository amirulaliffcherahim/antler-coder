import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTheme } from "@/modules/theme/ThemeProvider";
import { useAgentShellStore } from "../store";
import type { ExternalAgentConfig } from "../lib/types";
import type { WorkspaceEnv } from "@/modules/workspace";
import AgentTabBar from "./AgentTabBar";
import AgentTerminal from "./AgentTerminal";
import AgentPicker from "./AgentPicker";

interface AgentPopupProps {
  open: boolean;
  onClose: () => void;
  workspaceEnv: WorkspaceEnv;
}

function toRustWorkspace(env: WorkspaceEnv): { kind: "local" } | { kind: "wsl"; distro: string } {
  if (env.kind === "local") return { kind: "local" };
  return { kind: "wsl", distro: env.distro };
}

export default function AgentPopup({ open, onClose, workspaceEnv }: AgentPopupProps) {
  const { tokens } = useTheme();
  const { tabs, activeTabId, openTab, updateTabStatus } = useAgentShellStore();
  const [showPicker, setShowPicker] = useState(false);

  const spawnAgent = useCallback(
    async (config: ExternalAgentConfig) => {
      try {
        const ptyId = await invoke<number>("agent_pty_open", {
          command: config.binary,
          args: config.args,
          env: config.env,
          cwd: config.cwd ?? null,
          workspace: toRustWorkspace(workspaceEnv),
          cols: 80,
          rows: 24,
          onData: null,
          onExit: null,
        });

        const tabId = openTab(config.id, ptyId, config.name);
        setShowPicker(false);

        // Monitor for exit
        const checkInterval = setInterval(async () => {
          try {
            // We'll rely on the terminal's onExit for status updates
            // This is simplified for Phase 4
          } catch {
            clearInterval(checkInterval);
            updateTabStatus(tabId, "exited");
          }
        }, 5000);
      } catch (e) {
        console.error("Failed to spawn agent:", e);
      }
    },
    [openTab, updateTabStatus, workspaceEnv]
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed right-4 bottom-8 z-50 flex flex-col overflow-hidden rounded border shadow-2xl"
        style={{
          width: "min(40rem, calc(100vw - 2rem))",
          height: "min(36rem, calc(100vh - 6rem))",
          backgroundColor: tokens.card,
          borderColor: tokens.border,
          boxShadow: `0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px ${tokens.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex h-9 items-center justify-between px-3 border-b shrink-0"
          style={{ borderColor: tokens.border }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium"
              style={{ color: tokens.neonCyan }}
            >
              Agent Terminal
            </span>
            {tabs.length > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: tokens.muted,
                  color: tokens.mutedForeground,
                }}
              >
                {tabs.length} tab{tabs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-[12px] w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <AgentTabBar onAddTab={() => setShowPicker(true)} />

        {/* Terminal area */}
        <div className="flex-1 min-h-0 relative">
          {tabs.length === 0 ? (
            <div
              className="flex items-center justify-center h-full text-[11px]"
              style={{ color: tokens.mutedForeground }}
            >
              <div className="text-center space-y-2">
                <div>No agent running</div>
                <button
                  onClick={() => setShowPicker(true)}
                  className="px-3 py-1 text-[10px] rounded transition-colors"
                  style={{
                    backgroundColor: tokens.neonCyan,
                    color: tokens.background,
                  }}
                >
                  Open agent
                </button>
              </div>
            </div>
          ) : (
            tabs.map((tab) => (
              <div
                key={tab.id}
                className="absolute inset-0"
                style={{ display: tab.id === activeTabId ? "block" : "none" }}
              >
                <AgentTerminal
                  ptyId={tab.ptyId}
                  visible={tab.id === activeTabId}
                  onExit={() => updateTabStatus(tab.id, "exited")}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent picker modal */}
      {showPicker && (
        <AgentPicker
          onSelect={spawnAgent}
          onClose={() => setShowPicker(false)}
          workspaceEnv={workspaceEnv}
        />
      )}
    </>
  );
}
