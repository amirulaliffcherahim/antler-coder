import { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { lineNumbers } from "@codemirror/view";
import { MergeView } from "@codemirror/merge";
import { antlerDarkTheme } from "@/modules/editor/lib/themes";

interface DiffViewProps {
  original: string;
  modified: string;
  filePath: string;
  onClose: () => void;
}

export default function DiffView({ original, modified, filePath, onClose }: DiffViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const parent = containerRef.current;

    const readonlyExt = [
      lineNumbers(),
      keymap.of(defaultKeymap),
      antlerDarkTheme,
      EditorView.editable.of(false),
    ];

    const view = new MergeView({
      a: {
        doc: original,
        extensions: readonlyExt,
      },
      b: {
        doc: modified,
        extensions: readonlyExt,
      },
      orientation: "a-b",
      parent,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [original, modified]);

  const fileName = filePath.split("/").pop() ?? filePath;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between h-8 shrink-0 px-3 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-neon-cyan">Diff</span>
          <span className="text-[10px] text-muted-foreground">—</span>
          <span className="text-[10px] text-muted-foreground">{fileName}</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-[12px] w-5 h-5 flex items-center justify-center"
          aria-label="Close diff"
        >
          ×
        </button>
      </div>

      {/* Merge view */}
      <div ref={containerRef} className="flex-1 overflow-auto" />
    </div>
  );
}
