import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { invoke } from "@tauri-apps/api/core";

interface PreviewPanelProps {
  filePath: string | null;
  previewUrl: string | null;
  onClose: () => void;
}

type PreviewMode = "markdown" | "url" | null;

export default function PreviewPanel({ filePath, previewUrl, onClose }: PreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>(null);
  const [mdContent, setMdContent] = useState("");
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState<string | null>(null);

  // Detect mode
  useEffect(() => {
    if (previewUrl) {
      setMode("url");
      return;
    }
    if (filePath && /\.md$/i.test(filePath)) {
      setMode("markdown");
      return;
    }
    setMode(null);
  }, [filePath, previewUrl]);

  // Load Markdown content
  useEffect(() => {
    if (mode !== "markdown" || !filePath) return;
    setMdLoading(true);
    setMdError(null);
    invoke<string>("fs_read_file", { path: filePath })
      .then((text) => {
        setMdContent(text);
        setMdLoading(false);
      })
      .catch((e) => {
        setMdError(String(e));
        setMdLoading(false);
      });
  }, [mode, filePath]);

  if (!mode) return null;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between h-8 shrink-0 px-3 border-b border-border bg-muted">
        <span className="text-[10px] font-medium text-neon-cyan">
          {mode === "markdown" ? "Markdown Preview" : "Web Preview"}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-[12px] w-5 h-5 flex items-center justify-center"
          aria-label="Close preview"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {mode === "markdown" && (
          <div className="p-4 text-[13px] text-foreground markdown-preview">
            {mdLoading && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-[11px]">
                Loading…
              </div>
            )}
            {mdError && (
              <div className="flex items-center justify-center h-full text-destructive text-[11px]">
                {mdError}
              </div>
            )}
            {!mdLoading && !mdError && mdContent && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {mdContent}
              </ReactMarkdown>
            )}
          </div>
        )}
        {mode === "url" && previewUrl && (
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title="Web Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
