import { useAgentShellStore } from "@/modules/agent-shell";

export function AgentsSection() {
  const { configs } = useAgentShellStore();

  const autoConfigs = configs.filter((c) => c.source === "auto-detected");
  const customConfigs = configs.filter((c) => c.source === "custom");

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold text-neon-cyan">
        Agents
      </h2>

      <p className="text-[11px] text-muted-foreground">
        External CLI agents that Antler Coder can spawn in the popup terminal.
        Auto-detected agents are found by scanning your PATH.
      </p>

      {/* Auto-detected */}
      {autoConfigs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Auto-detected ({autoConfigs.length})
          </h3>
          <div className="flex flex-col gap-1">
            {autoConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded bg-muted"
              >
                <span className="text-neon-cyan">$</span>
                <span className="font-medium">{config.name}</span>
                <span className="ml-auto text-[10px] truncate max-w-40 text-muted-foreground">
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
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Custom ({customConfigs.length})
          </h3>
          <div className="flex flex-col gap-1">
            {customConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center gap-2 px-2 py-1.5 text-[11px] rounded bg-muted"
              >
                <span className="text-violet-400">$</span>
                <span className="font-medium">{config.name}</span>
                <span className="ml-auto text-[10px] truncate max-w-40 text-muted-foreground">
                  {config.binary}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {autoConfigs.length === 0 && customConfigs.length === 0 && (
        <div
          className="rounded border border-border p-4 text-[11px] text-center text-muted-foreground"
        >
          No agents configured yet. Use the agent popup (Space+a) to scan for agents.
        </div>
      )}
    </div>
  );
}
