import { lineNumbers } from "@codemirror/view";
import { EditorState, type Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { antlerDarkTheme } from "./themes";

export function createBaseExtensions(): Extension[] {
  return [
    lineNumbers(),
    keymap.of(defaultKeymap),
    antlerDarkTheme,
    EditorState.tabSize.of(2),
    EditorState.allowMultipleSelections.of(true),
  ];
}
