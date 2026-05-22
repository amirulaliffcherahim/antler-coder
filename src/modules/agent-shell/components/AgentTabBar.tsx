import { cn } from "@/lib/utils";
import { useAgentShellStore } from "../store";

interface AgentTabBarProps {
  onAddTab: () => void;
}

export default function AgentTabBar({ onAddTab }: AgentTabBarProps) {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAgentShellStore();

  return (
    <div
      className="flex items-center h-8 shrink-0 border-b border-border bg-muted"
    >
      <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none",
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
      >
        +
      </button>
    </div>
  );
}
