import { useTheme } from "@/modules/theme/ThemeProvider";
import { useAgentShellStore } from "@/modules/agent-shell";

export function AgentsSection() {
  const { tokens } = useTheme();
  const { configs } = useAgentShellStore();

  const autoConfigs = configs.filter((c) => c.source === "auto-detected");
  const customConfigs = configs.filter((c) => c.source === "custom");

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        Agents
      </h2>

      <p className="text-[11px]" style={{ color: tokens.mutedForeground }}>
        External CLI agents that Antler Coder can spawn in the popup terminal.
        Auto-detected agents are found by scanning your PATH.
      </p>

      {/* Auto-detected */}
      {autoConfigs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wide" style={{ color: tokens.mutedForeground }}>
            Auto-detected ({autoConfigs.length})
          </h3>
          <div className="flex flex-col gap-1">
            {autoConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded"
                style={{ backgroundColor: tokens.muted }}
              >
                <span style={{ color: tokens.neonCyan }}>$</span>
                <span className="font-medium">{config.name}</span>
                <span className="ml-auto text-[10px] truncate max-w-40" style={{ color: tokens.mutedForeground }}>
                  {config.detectedPath}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom */}
      {customConfigs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wide" style={{ color: tokens.mutedForeground }}>
            Custom ({customConfigs.length})
          </h3>
          <div className="flex flex-col gap-1">
            {customConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded"
                style={{ backgroundColor: tokens.muted }}
              >
                <span style={{ color: tokens.neonPurple }}>$</span>
                <span className="font-medium">{config.name}</span>
                <span className="ml-auto text-[10px] truncate max-w-40" style={{ color: tokens.mutedForeground }}>
                  {config.binary}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {autoConfigs.length === 0 && customConfigs.length === 0 && (
        <div
          className="rounded border p-4 text-[11px] text-center"
          style={{ borderColor: tokens.border, color: tokens.mutedForeground }}
        >
          No agents configured yet. Use the agent popup (Space+a) to scan for agents.
        </div>
      )}
    </div>
  );
}
