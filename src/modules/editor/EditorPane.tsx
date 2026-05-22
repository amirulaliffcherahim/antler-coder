import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { invoke } from "@tauri-apps/api/core";
import { createBaseExtensions } from "./lib/extensions";
import { loadLanguageForFile } from "./lib/languageResolver";
import { usePreferencesStore } from "../../modules/settings/preferences";
import { inlineCompletionExtension, setActiveProvider } from "../../modules/autocomplete/completionExt";

export interface EditorPaneHandle {
  getContent: () => string;
  setContent: (text: string) => void;
  focus: () => void;
}

interface EditorPaneProps {
  filePath: string;
}

const EditorPane = forwardRef<EditorPaneHandle, EditorPaneProps>(
  function EditorPane({ filePath }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const vimMode = usePreferencesStore((s) => s.vimMode);
    const autocompleteEnabled = usePreferencesStore((s) => s.autocompleteEnabled);
    const autocompleteProvider = usePreferencesStore((s) => s.autocompleteProvider);

    // Load file content
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      invoke<string>("fs_read_file", { path: filePath })
        .then((text) => {
          if (!cancelled) {
            setContent(text);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setContent(`// Error loading file: ${String(e)}`);
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [filePath]);

    // Create CodeMirror instance
    useEffect(() => {
      if (!containerRef.current || loading) return;

      let cancelled = false;

      (async () => {
        const langExt = await loadLanguageForFile(filePath);
        if (cancelled) return;

        const extensions = [...createBaseExtensions({ vimMode })];
        if (langExt) extensions.push(langExt);

        // Autocomplete
        setActiveProvider(autocompleteProvider ?? null);
        if (autocompleteEnabled && autocompleteProvider) {
          extensions.push(inlineCompletionExtension());
        }

        const state = EditorState.create({
          doc: content,
          extensions,
        });

        const view = new EditorView({
          state,
          parent: containerRef.current!,
        });

        viewRef.current = view;
      })();

      return () => {
        cancelled = true;
        viewRef.current?.destroy();
        viewRef.current = null;
      };
    }, [content, loading, filePath, vimMode, autocompleteEnabled, autocompleteProvider]);

    useImperativeHandle(ref, () => ({
      getContent: () => viewRef.current?.state.doc.toString() ?? "",
      setContent: (text: string) => {
        if (viewRef.current) {
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: viewRef.current.state.doc.length,
              insert: text,
            },
          });
        }
      },
      focus: () => viewRef.current?.focus(),
    }));

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground">
          Loading {filePath.split("/").pop()}…
        </div>
      );
    }

    return <div ref={containerRef} className="h-full w-full overflow-auto" />;
  }
);

export default EditorPane;
