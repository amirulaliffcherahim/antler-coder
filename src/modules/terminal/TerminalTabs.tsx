import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import TerminalPane, { type TerminalPaneHandle } from "./TerminalPane";

interface TerminalTab {
  id: string;
  name: string;
  cwd: string;
}

interface TerminalTabsProps {
  defaultCwd: string;
}

export default function TerminalTabs({ defaultCwd }: TerminalTabsProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "t-1", name: "bash", cwd: defaultCwd },
  ]);
  const [activeId, setActiveId] = useState("t-1");
  const nextId = useRef(2);
  const paneRefs = useRef<Record<string, React.RefObject<TerminalPaneHandle>>>({});

  const getPaneRef = useCallback(
    (id: string) => {
      if (!paneRefs.current[id]) {
        paneRefs.current[id] = { current: null };
      }
      return paneRefs.current[id];
    },
    []
  );

  const addTab = useCallback(() => {
    const id = `t-${nextId.current++}`;
    const tab: TerminalTab = {
      id,
      name: `bash ${nextId.current - 1}`,
      cwd: defaultCwd,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveId(id);
  }, [defaultCwd]);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((t) => t.id !== id);
        if (activeId === id) {
          const idx = prev.findIndex((t) => t.id === id);
          const newActive = prev[idx === 0 ? 1 : idx - 1];
          setActiveId(newActive.id);
        }
        return next;
      });
    },
    [activeId]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center h-7 shrink-0 border-b border-border bg-muted/20">
        <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-7 text-[10px] shrink-0 transition-colors motion-safe:transition-all motion-safe:duration-100",
                tab.id === activeId
                  ? "bg-card text-foreground border-t-2 border-t-neon-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
              )}
            >
              <span>$</span>
              <span className="truncate max-w-32">{tab.name}</span>
              {tabs.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={addTab}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground text-[12px] shrink-0"
          title="New terminal"
        >
          +
        </button>
      </div>

      {/* Terminal panes */}
      <div className="flex-1 min-h-0 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: tab.id === activeId ? "block" : "none" }}
          >
            <TerminalPane
              ref={getPaneRef(tab.id)}
              cwd={tab.cwd}
              visible={tab.id === activeId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
