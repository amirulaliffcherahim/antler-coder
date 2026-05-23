import { useCallback, useRef, useState } from "react";
import { invoke, Channel } from "@tauri-apps/api/core";
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
  const tabs = useAgentShellStore((s) => s.tabs);
  const activeTabId = useAgentShellStore((s) => s.activeTabId);
  const openTab = useAgentShellStore((s) => s.openTab);
  const updateTabStatus = useAgentShellStore((s) => s.updateTabStatus);
  const [showPicker, setShowPicker] = useState(false);
  // Shared ref map: ptyId → data sink registered by AgentTerminal
  const dataSinks = useRef<Record<number, ((data: Uint8Array) => void) | null>>({});
  const tabPtyMap = useRef<Record<string, number>>({});
  const ptyTabMap = useRef<Record<number, string>>({});

  const spawnAgent = useCallback(
    async (config: ExternalAgentConfig) => {
      try {
        const onData = new Channel<ArrayBuffer>();
        const onExit = new Channel<number>();
        let ptyId = 0;

        // Channel callbacks fire after invoke completes — ptyId will be set by then
        onData.onmessage = (buf: ArrayBuffer) => {
          const sink = dataSinks.current[ptyId];
          if (sink) sink(new Uint8Array(buf));
        };
        onExit.onmessage = (code) => {
          const tabId = ptyTabMap.current[ptyId];
          if (tabId) updateTabStatus(tabId, "exited");
          console.log(`Agent exited with code ${code}`);
        };

        ptyId = await invoke<number>("agent_pty_open", {
          command: config.binary,
          args: config.args,
          env: config.env,
          cwd: config.cwd ?? null,
          workspace: toRustWorkspace(workspaceEnv),
          cols: 80,
          rows: 24,
          onData,
          onExit,
        });

        const tabId = openTab(config.id, ptyId, config.name);
        tabPtyMap.current[tabId] = ptyId;
        ptyTabMap.current[ptyId] = tabId;
        dataSinks.current[ptyId] = null;
        setShowPicker(false);
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
        className="fixed right-4 bottom-8 z-50 flex flex-col overflow-hidden rounded border border-border bg-card shadow-2xl animate-slide-up"
        style={{
          width: "min(40rem, calc(100vw - 2rem))",
          height: "min(36rem, calc(100vh - 6rem))",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex h-9 items-center justify-between px-3 border-b border-border shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-neon-cyan">
              Agent Terminal
            </span>
            {tabs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
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
            <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground"
            >
              <div className="text-center space-y-2">
                <div>No agent running</div>
                <button
                  onClick={() => setShowPicker(true)}
                  className="px-3 py-1 text-[10px] rounded transition-colors bg-neon-cyan text-background"
                >
                  Open agent
                </button>
              </div>
            </div>
          ) : (
            tabs.map((tab) => {
              // Create a stable ref for data routing between spawnAgent and AgentTerminal
              if (!(tab as any)._dataSinkRef) {
                (tab as any)._dataSinkRef = {
                  get current() { return dataSinks.current[tab.ptyId] ?? null; },
                  set current(fn: ((data: Uint8Array) => void) | null) { dataSinks.current[tab.ptyId] = fn; },
                };
              }
              return (
                <div
                  key={tab.id}
                  className="absolute inset-0"
                  style={{ display: tab.id === activeTabId ? "block" : "none" }}
                >
                  <AgentTerminal
                    ptyId={tab.ptyId}
                    visible={tab.id === activeTabId}
                    onExit={() => updateTabStatus(tab.id, "exited")}
                    dataSink={(tab as any)._dataSinkRef}
                  />
                </div>
              );
            })
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
