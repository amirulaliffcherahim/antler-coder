import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useFileTree } from "./lib/useFileTree";
import TreeRow from "./components/TreeRow";

interface FileExplorerProps {
  rootPath: string;
  onFileClick: (path: string) => void;
}

export default function FileExplorer({ rootPath, onFileClick }: FileExplorerProps) {
  const { entries, loading, loadDir } = useFileTree();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (rootPath && !loadedRef.current) {
      loadedRef.current = true;
      loadDir(rootPath);
    }
  }, [rootPath, loadDir]);

  const rootEntries = entries[rootPath] ?? [];

  return (
    <div className={cn("flex flex-col h-full overflow-auto")}>
      <div className="px-2 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase border-b border-border shrink-0">
        Explorer
      </div>
      <div className="flex-1 overflow-auto py-1">
        {rootEntries.length === 0 ? (
          <div className="px-2 py-4 text-[10px] text-muted-foreground/50 text-center">
            {loading.has(rootPath) ? "Loading…" : "Empty directory"}
          </div>
        ) : (
          rootEntries.map((entry) => (
            <TreeRow
              key={entry.path}
              entry={entry}
              depth={0}
              entries={entries}
              loading={loading}
              loadDir={loadDir}
              onFileClick={onFileClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
