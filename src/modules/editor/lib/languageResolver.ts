import type { Extension } from "@codemirror/state";

export type LanguageLoader = () => Promise<unknown>;

const languageMap: Record<string, LanguageLoader> = {
  js: () => import("@codemirror/lang-javascript"),
  jsx: () => import("@codemirror/lang-javascript"),
  mjs: () => import("@codemirror/lang-javascript"),
  ts: () => import("@codemirror/lang-javascript"),
  tsx: () => import("@codemirror/lang-javascript"),
  py: () => import("@codemirror/lang-python"),
  rs: () => import("@codemirror/lang-rust"),
  md: () => import("@codemirror/lang-markdown"),
};

export async function loadLanguageForFile(filename: string): Promise<Extension | null> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const loader = languageMap[ext];
  if (!loader) return null;

  try {
    const mod = await loader() as Record<string, unknown>;
    if (ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx" || ext === "mjs") {
      const fn = (mod as Record<string, (...args: unknown[]) => Extension>).javascript;
      if (fn) return fn({ jsx: ext.endsWith("x"), typescript: ext.startsWith("t") });
    }
    if (ext === "py") {
      const fn = (mod as Record<string, () => Extension>).python;
      if (fn) return fn();
    }
    if (ext === "rs") {
      const fn = (mod as Record<string, () => Extension>).rust;
      if (fn) return fn();
    }
    if (ext === "md") {
      const fn = (mod as Record<string, () => Extension>).markdown;
      if (fn) return fn();
    }
    return null;
  } catch {
    return null;
  }
}
