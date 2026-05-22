import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import { getFileIcon } from "../lib/fileIcons";
import type { DirEntry } from "../lib/useFileTree";

interface TreeRowProps {
  entry: DirEntry;
  depth?: number;
  entries: Record<string, DirEntry[]>;
  loading: Set<string>;
  loadDir: (path: string) => Promise<void>;
  onFileClick: (path: string) => void;
}

const TreeRow = memo(function TreeRow({
  entry,
  depth = 0,
  entries,
  loading,
  loadDir,
  onFileClick,
}: TreeRowProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = getFileIcon(entry.name, entry.is_dir);
  const isLoading = loading.has(entry.path);

  const handleClick = () => {
    if (entry.is_dir) {
      if (!expanded && !entries[entry.path]) {
        loadDir(entry.path);
      }
      setExpanded(!expanded);
    } else {
      onFileClick(entry.path);
    }
  };

  const children = entries[entry.path];

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center w-full gap-1.5 px-1 py-0.5 text-[11px] text-muted-foreground",
          "hover:text-foreground hover:bg-accent/30 transition-colors",
          "select-none cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <span className="w-3 text-center shrink-0 opacity-60 transition-transform duration-150">
          {entry.is_dir ? (expanded ? "▾" : "▸") : null}
        </span>
        <span className="w-3 text-center shrink-0 opacity-70">{icon}</span>
        <span className="truncate">{entry.name}</span>
        {isLoading && (
          <span className="text-[9px] opacity-50 ml-auto">…</span>
        )}
      </button>

      {expanded && children && (
        <div className="animate-fade-in">
          {children.map((child) => (
            <TreeRow
              key={child.path}
              entry={child}
              depth={depth + 1}
              entries={entries}
              loading={loading}
              loadDir={loadDir}
              onFileClick={onFileClick}
            />
          ))}
          {children.length === 0 && (
            <div
              className="text-[10px] text-muted-foreground/40 px-1 py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              empty
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default TreeRow;
