import { EditorView } from "@codemirror/view";

export const antlerDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "hsl(0 0% 92%)",
    fontFamily: "JetBrains Mono, Fira Code, monospace",
    fontSize: "12.5px",
    lineHeight: "1.6",
  },
  ".cm-content": {
    caretColor: "hsl(186 100% 50%)",
    padding: "8px 0",
  },
  "&.cm-focused .cm-content": {
    caretColor: "hsl(186 100% 50%)",
  },
  ".cm-gutters": {
    backgroundColor: "hsl(0 0% 6%)",
    borderRight: "1px solid hsl(0 0% 14%)",
    color: "hsl(0 0% 40%)",
    fontSize: "11px",
    paddingRight: "8px",
    paddingLeft: "4px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "hsl(0 0% 12%)",
    color: "hsl(0 0% 60%)",
  },
  ".cm-activeLine": {
    backgroundColor: "hsl(0 0% 10% / 0.5)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "hsl(186 100% 50% / 0.15)",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "hsl(186 100% 50% / 0.25)",
  },
  ".cm-matchingBracket": {
    backgroundColor: "hsl(186 100% 50% / 0.15)",
    borderBottom: "1px solid hsl(186 100% 50% / 0.4)",
  },
  ".cm-nonmatchingBracket": {
    backgroundColor: "hsl(349 100% 60% / 0.15)",
  },
  ".cm-cursor": {
    borderLeftColor: "hsl(186 100% 50%)",
  },
}, { dark: true });

// Syntax highlighting colors for the dark neon theme
export const antlerHighlightStyle = EditorView.baseTheme({
  ".tok-keyword": { color: "hsl(280 80% 70%)" },
  ".tok-typeName": { color: "hsl(186 100% 65%)" },
  ".tok-variableName": { color: "hsl(0 0% 88%)" },
  ".tok-literal": { color: "hsl(30 100% 60%)" },
  ".tok-string": { color: "hsl(120 60% 55%)" },
  ".tok-comment": { color: "hsl(0 0% 40%)", fontStyle: "italic" },
  ".tok-function": { color: "hsl(200 80% 65%)" },
  ".tok-number": { color: "hsl(30 100% 60%)" },
  ".tok-operator": { color: "hsl(0 0% 70%)" },
  ".tok-punctuation": { color: "hsl(0 0% 60%)" },
  ".tok-propertyName": { color: "hsl(200 70% 65%)" },
  ".tok-className": { color: "hsl(186 100% 65%)" },
  ".tok-namespace": { color: "hsl(280 60% 65%)" },
});
