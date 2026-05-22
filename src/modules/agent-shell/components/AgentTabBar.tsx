import { cn } from "@/lib/utils";
import { useAgentShellStore } from "../store";

interface AgentTabBarProps {
  onAddTab: () => void;
}

export default function AgentTabBar({ onAddTab }: AgentTabBarProps) {
  const tabs = useAgentShellStore((s) => s.tabs);
  const activeTabId = useAgentShellStore((s) => s.activeTabId);
  const setActiveTab = useAgentShellStore((s) => s.setActiveTab);
  const closeTab = useAgentShellStore((s) => s.closeTab);

  return (
    <div
      className="flex items-center h-8 shrink-0 border-b border-border bg-muted"
      role="tablist"
    >
      <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTabId}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none motion-safe:transition-all motion-safe:duration-100",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              tab.id === activeTabId
                ? "bg-card text-foreground border-t-2 border-t-neon-cyan"
                : "bg-transparent text-muted-foreground border-t-2 border-t-transparent"
            )}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tab.status === "running"
                  ? "bg-green-400"
                  : tab.status === "error"
                  ? "bg-destructive"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="truncate max-w-32">{tab.title}</span>
            {tabs.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 opacity-0 hover:opacity-100 cursor-pointer transition-opacity text-muted-foreground"
                role="button"
                aria-label="Close tab"
              >
                ×
              </span>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={onAddTab}
        className="w-8 h-8 flex items-center justify-center text-[12px] shrink-0 transition-colors text-muted-foreground"
        title="Open agent picker"
        aria-label="Add agent"
      >
        +
      </button>
    </div>
  );
}
