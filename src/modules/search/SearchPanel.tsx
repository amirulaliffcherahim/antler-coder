import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import { useWorkspaceEnvStore } from "@/modules/workspace";

interface SearchResult {
  path: string;
  line: number;
  column: number;
  text: string;
}

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  onFileClick: (path: string) => void;
}

export default function SearchPanel({ open, onClose, onFileClick }: SearchPanelProps) {

  const { env } = useWorkspaceEnvStore();
  const rootPath = env.kind === "local" ? env.rootPath : "/";

  const [query, setQuery] = useState("");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const runSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await invoke<SearchResult[]>("search_ripgrep", {
        query: query.trim(),
        path: rootPath,
        regex,
        caseSensitive,
      });
      setResults(res);
    } catch (e) {
      console.error("Search failed:", e);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query, regex, caseSensitive, rootPath]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-24 animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-[44rem] max-h-[32rem] flex flex-col rounded border border-border shadow-2xl overflow-hidden bg-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b border-border"
        >
          <span className="text-muted-foreground">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-[12px] outline-none text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          />
          <button
            onClick={runSearch}
            disabled={searching || !query.trim()}
            className="px-2 py-0.5 text-[10px] rounded transition-colors bg-neon-cyan text-background"
            style={{ opacity: searching || !query.trim() ? 0.5 : 1 }}
          >
            {searching ? "…" : "Search"}
          </button>
          <button
            onClick={onClose}
            className="text-[12px] px-1 text-muted-foreground"
          >
            ×
          </button>
        </div>

        {/* Options */}
        <div
          className="flex items-center gap-3 px-3 py-1.5 border-b border-border"
        >
          <ToggleOption
            label="Regex"
            checked={regex}
            onChange={setRegex}
          />
          <ToggleOption
            label="Case sensitive"
            checked={caseSensitive}
            onChange={setCaseSensitive}
          />
          <span className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {results.length > 0 ? `${results.length} results` : ""}
          </span>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !searching && query && (
            <div
            className="text-center py-8 text-[11px] text-muted-foreground animate-fade-in"
            >
              No results found
            </div>
          )}
          {results.map((result, idx) => (
            <button
              key={`${result.path}:${result.line}:${idx}`}
              onClick={() => {
                onFileClick(result.path);
                onClose();
              }}
              className="flex flex-col w-full px-3 py-1.5 text-left transition-colors border-b border-border hover:bg-accent animate-slide-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] truncate max-w-[16rem] text-neon-cyan"
                >
                  {result.path.split("/").pop()}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {result.path}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  :{result.line}:{result.column}
                </span>
              </div>
              <div
                className="text-[11px] truncate mt-0.5 font-mono text-foreground"
              >
                {result.text}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-1 text-[10px] transition-colors ${checked ? "text-neon-cyan" : "text-muted-foreground"}`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${checked ? "border-neon-cyan bg-neon-cyan" : "border-muted-foreground"}`}
      >
        {checked && <span className="text-[8px] text-background">✓</span>}
      </span>
      {label}
    </button>
  );
}
