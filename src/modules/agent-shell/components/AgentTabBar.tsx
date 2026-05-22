import { cn } from "@/lib/utils";
import { useTheme } from "@/modules/theme/useTheme";
import { useAgentShellStore } from "../store";

interface AgentTabBarProps {
  onAddTab: () => void;
}

export default function AgentTabBar({ onAddTab }: AgentTabBarProps) {
  const { tokens } = useTheme();
  const { tabs, activeTabId, setActiveTab, closeTab } = useAgentShellStore();

  return (
    <div
      className="flex items-center h-8 shrink-0 border-b"
      style={{ borderColor: tokens.border, backgroundColor: tokens.muted }}
    >
      <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 text-[10px] shrink-0 transition-colors select-none"
            )}
            style={{
              backgroundColor:
                tab.id === activeTabId ? tokens.card : "transparent",
              color:
                tab.id === activeTabId
                  ? tokens.foreground
                  : tokens.mutedForeground,
              borderTop:
                tab.id === activeTabId
                  ? `2px solid ${tokens.neonCyan}`
                  : "2px solid transparent",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  tab.status === "running"
                    ? tokens.neonGreen
                    : tab.status === "error"
                    ? tokens.neonRed
                    : tokens.mutedForeground,
              }}
            />
            <span className="truncate max-w-32">{tab.title}</span>
            {tabs.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                style={{ color: tokens.mutedForeground }}
              >
                ×
              </span>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={onAddTab}
        className="w-8 h-8 flex items-center justify-center text-[12px] shrink-0 transition-colors"
        style={{ color: tokens.mutedForeground }}
        title="Open agent picker"
      >
        +
      </button>
    </div>
  );
}
