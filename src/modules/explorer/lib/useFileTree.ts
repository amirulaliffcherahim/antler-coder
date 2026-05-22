import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export type DirEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified?: number;
};

export function useFileTree() {
  const [entries, setEntries] = useState<Record<string, DirEntry[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const loadDir = useCallback(async (path: string) => {
    setLoading((prev) => new Set(prev).add(path));
    try {
      const result = await invoke<DirEntry[]>("fs_list_dir", { path });
      setEntries((prev) => ({ ...prev, [path]: result }));
    } catch (e) {
      console.error("Failed to list dir:", path, e);
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }, []);

  return { entries, loading, loadDir };
}
