import { useState } from "react";
import { useAgentShellStore } from "../store";
import { useAgentDiscovery } from "../hooks/useAgentDiscovery";
import type { ExternalAgentConfig } from "../lib/types";
import type { WorkspaceEnv } from "@/modules/workspace";

interface AgentPickerProps {
  onSelect: (config: ExternalAgentConfig) => void;
  onClose: () => void;
  workspaceEnv: WorkspaceEnv;
}

export default function AgentPicker({ onSelect, onClose, workspaceEnv }: AgentPickerProps) {
  const { configs } = useAgentShellStore();
  const { discover, isDiscovering } = useAgentDiscovery(workspaceEnv);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBinary, setCustomBinary] = useState("");

  const autoConfigs = configs.filter((c) => c.source === "auto-detected");
  const customConfigs = configs.filter((c) => c.source === "custom");

  const handleCustomAdd = () => {
    if (!customName.trim() || !customBinary.trim()) return;
    const config: ExternalAgentConfig = {
      id: `custom:${Date.now()}`,
      name: customName.trim(),
      binary: customBinary.trim(),
      args: [],
      env: {},
      icon: "terminal",
      source: "custom",
    };
    onSelect(config);
    setShowCustom(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-[28rem] max-h-[32rem] flex flex-col rounded border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border"
        >
          <h3 className="text-[12px] font-semibold text-neon-cyan">
            Open Agent
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-[12px]"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Auto-detected */}
          {autoConfigs.length > 0 && (
            <div className="mb-3">
              <div
                className="text-[10px] font-medium uppercase tracking-wide mb-1.5 px-1 text-muted-foreground"
              >
                Auto-detected
              </div>
              <div className="flex flex-col gap-1">
                {autoConfigs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => onSelect(config)}
                    className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-colors text-left text-foreground hover:bg-accent"
                  >
                    <span className="text-neon-cyan">$</span>
                    <span className="font-medium">{config.name}</span>
                    <span
                      className="ml-auto text-[10px] truncate max-w-40 text-muted-foreground"
                    >
                      {config.detectedPath}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom */}
          {customConfigs.length > 0 && (
            <div className="mb-3">
              <div
                className="text-[10px] font-medium uppercase tracking-wide mb-1.5 px-1 text-muted-foreground"
              >
                Custom
              </div>
              <div className="flex flex-col gap-1">
                {customConfigs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => onSelect(config)}
                    className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-colors text-left text-foreground hover:bg-accent"
                  >
                    <span className="text-violet-400">$</span>
                    <span className="font-medium">{config.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {autoConfigs.length === 0 && customConfigs.length === 0 && (
            <div className="text-center py-6 text-[11px] text-muted-foreground">
              {isDiscovering ? "Scanning for agents…" : "No agents found"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-t border-border"
        >
          {!showCustom ? (
            <>
              <button
                onClick={() => setShowCustom(true)}
                className="px-3 py-1 text-[10px] rounded border border-border text-muted-foreground transition-colors"
              >
                Add custom…
              </button>
              <button
                onClick={discover}
                disabled={isDiscovering}
                className="px-3 py-1 text-[10px] rounded bg-neon-cyan text-background transition-colors"
              >
                {isDiscovering ? "Scanning…" : "Re-scan"}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="Agent name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full h-7 px-2 text-[11px] rounded border border-border bg-transparent text-foreground"
              />
              <input
                type="text"
                placeholder="Binary path (e.g. /usr/local/bin/claude)"
                value={customBinary}
                onChange={(e) => setCustomBinary(e.target.value)}
                className="w-full h-7 px-2 text-[11px] rounded border border-border bg-transparent text-foreground font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCustomAdd}
                  className="px-3 py-1 text-[10px] rounded bg-neon-cyan text-background transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustom(false)}
                  className="px-3 py-1 text-[10px] rounded border border-border text-muted-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
