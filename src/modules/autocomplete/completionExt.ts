import {
  ViewPlugin,
  type PluginValue,
  type ViewUpdate,
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
  type KeyBinding,
  keymap,
} from "@codemirror/view";
import { StateEffect, StateField, type Extension } from "@codemirror/state";
import { fetchInlineCompletion } from "./provider";
import type { ProviderConfig } from "../settings/preferences";

// ── State ──────────────────────────────────────────────────────

const setGhostEffect = StateEffect.define<string | null>();
const acceptGhostEffect = StateEffect.define<null>();

const ghostField = StateField.define<string | null>({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setGhostEffect)) return e.value;
      if (e.is(acceptGhostEffect)) return null;
    }
    return value;
  },
});

// ── Decoration ─────────────────────────────────────────────────

const ghostDeco = (text: string) =>
  Decoration.widget({
    widget: new GhostWidget(text),
    side: 1,
  });

class GhostWidget extends WidgetType {
  constructor(readonly text: string) { super(); }
  eq(other: WidgetType) {
    return other instanceof GhostWidget && other.text === this.text;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-ghost-text";
    span.textContent = this.text;
    span.style.opacity = "0.35";
    span.style.pointerEvents = "none";
    return span;
  }
  updateDOM() { return false; }
  get estimatedHeight() { return -1; }
  ignoreEvent() { return true; }
  coordsAt() { return null; }
}

const ghostDecoField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(_value, tr) {
    const ghostText = tr.state.field(ghostField, false);
    if (!ghostText) return Decoration.none;
    const pos = tr.state.selection.main.head;
    return Decoration.set([ghostDeco(ghostText).range(pos)]);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ── Plugin ──────────────────────────────────────────────────────

class CompletionPlugin implements PluginValue {
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private currentCompletion: string | null = null;

  constructor(private view: EditorView) {}

  update(update: ViewUpdate) {
    // Skip if no doc/selection changes
    if (!update.docChanged && !update.selectionSet) return;

    // Clear existing ghost on any change
    if (this.currentCompletion) {
      this.currentCompletion = null;
      this.view.dispatch({ effects: setGhostEffect.of(null) });
    }

    // Don't trigger on single-character navigation/small edits
    if (!update.docChanged) return;

    // Start debounce timer
    this.scheduleCompletion();
  }

  private scheduleCompletion() {
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
    this.pendingTimer = setTimeout(() => this.fetchAndShow(), 400);
  }

  private async fetchAndShow() {
    const view = this.view;
    const pos = view.state.selection.main.head;
    const doc = view.state.doc.toString();

    // Don't fetch if cursor is at start or end and line is empty
    const line = view.state.doc.lineAt(pos);
    if (line.length === 0) return;

    const prefix = doc.slice(0, pos);
    const suffix = doc.slice(pos);

    // Don't fetch if we already have a completion for this context
    if (this.currentCompletion) return;

    // Get provider config from the view's state — stored via a facet or the plugin's companion
    // We use a simple module-level variable set by the extension factory
    const provider = getActiveProvider();
    if (!provider) return;

    const language = guessLanguage(view.state);

    try {
      const completion = await fetchInlineCompletion(
        { prefix, suffix, language },
        provider,
      );
      if (!completion) return;

      // Check cursor hasn't moved
      if (view.state.selection.main.head !== pos) return;

      // Only show if completion is reasonable length
      if (completion.length > 200) return;

      this.currentCompletion = completion;
      view.dispatch({ effects: setGhostEffect.of(completion) });
    } catch {
      // Silently fail
    }
  }

  destroy() {
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
  }
}

// ── Accept keybinding ──────────────────────────────────────────

const acceptKeyBinding: KeyBinding = {
  key: "Tab",
  run: (view) => {
    const ghost = view.state.field(ghostField, false);
    if (!ghost) return false;

    const pos = view.state.selection.main.head;
    view.dispatch({
      changes: { from: pos, insert: ghost },
      effects: acceptGhostEffect.of(null),
    });
    return true;
  },
};

// ── Helpers ────────────────────────────────────────────────────

let _activeProvider: ProviderConfig | null = null;

export function setActiveProvider(provider: ProviderConfig | null) {
  _activeProvider = provider;
}

function getActiveProvider(): ProviderConfig | null {
  return _activeProvider;
}

function guessLanguage(state: { doc: { toString(): string } }): string {
  const firstLine = state.doc.toString().split("\n")[0] ?? "";
  if (firstLine.includes("import") || firstLine.includes("export")) return "typescript";
  if (firstLine.includes("#include") || firstLine.includes("int main")) return "cpp";
  if (firstLine.includes("package ") || firstLine.includes("import java")) return "java";
  if (firstLine.includes("def ") || firstLine.includes("import ")) return "python";
  if (firstLine.includes("fn ") || firstLine.includes("fn main")) return "rust";
  if (firstLine.includes("<!DOCTYPE html") || firstLine.includes("<html")) return "html";
  if (firstLine.includes("{") || firstLine.includes(":")) return "css";
  return "javascript";
}

// ── Extension builder ──────────────────────────────────────────

export function inlineCompletionExtension(): Extension {
  return [
    ghostField,
    ghostDecoField,
    ViewPlugin.define((view) => new CompletionPlugin(view)),
    keymap.of([acceptKeyBinding]),
  ];
}
