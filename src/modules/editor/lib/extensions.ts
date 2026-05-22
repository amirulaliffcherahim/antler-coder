import { lineNumbers } from "@codemirror/view";
import { EditorState, type Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { vim } from "@replit/codemirror-vim";
import { antlerDarkTheme } from "./themes";

export interface BaseExtensionsOptions {
  vimMode?: boolean;
}

export function createBaseExtensions({ vimMode }: BaseExtensionsOptions = {}): Extension[] {
  const extensions: Extension[] = [
    lineNumbers(),
    keymap.of(defaultKeymap),
    antlerDarkTheme,
    EditorState.tabSize.of(2),
    EditorState.allowMultipleSelections.of(true),
  ];

  if (vimMode) {
    extensions.push(vim({ status: true }));
  }

  return extensions;
}
