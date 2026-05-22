# Antler-Coder — Architecture & Implementation Plan

> **Status**: Draft — awaiting review before scaffolding  
> **Date**: 2026-05-22  
> **Author**: amirulaliffcherahim  
> **Guiding Principle**: Robust but lightweight.

---

## 1. Executive Summary

**Antler-Coder** is a lightweight, open-source (MIT) developer environment built for power users. It is *not* an AI agent itself — it is a **universal agent shell** that hosts external CLI agents (Claude Code, Gemini CLI, Aider, Pi, Hermes, etc.) inside a multi-tab floating terminal popup. The app provides a focused IDE-like environment (editor, file explorer, terminal, preview) while all intelligence comes from the user's chosen external agent.

**Key differentiators from Terax:**
- No built-in chat AI — the app is purely an environment, not an agent
- Hacker/power-user aesthetic: dark, neon-accented, monospace everywhere, sharp edges
- Terminal-native keybindings (Space prefix, Ctrl+W navigation)
- BYOA (Bring Your Own Agent) — auto-discovery of CLI agents + manual configuration
- BYOK (Bring Your Own Key) — inline autocomplete powered by user's OpenAI-compatible endpoint or provider API key
- WSL-first remote development

---

## 2. Tech Stack

### 2.1 Frontend

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | React | ^18 | Mature, excellent TypeScript support |
| Bundler | Vite | ^5 | Fast HMR, native ESM, Tauri default |
| Language | TypeScript | ^5.4 | Strict mode, path mapping |
| Styling | Tailwind CSS | ^3.4 | Utility-first, dark mode native |
| Components | shadcn/ui | latest | Accessible primitives, customizable |
| State | Zustand | ^4.5 | Lightweight, no boilerplate, Tauri Store sync |
| Editor | CodeMirror 6 | latest | Modular, Vim mode, Lezer highlighting |
| Terminal | xterm.js | ^5 | Battle-tested, ANSI support, addon ecosystem |
| Icons | Lucide React | latest | Minimal, monochrome, consistent |
| Package Mgr | pnpm | latest | Fast, disk-efficient, strict peers |

### 2.2 Backend (Rust)

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Tauri v2 | ^2 | Native windowing, IPC, updater, v2 async commands |
| PTY | portable-pty | ^0.8 | Cross-platform PTY spawning (macOS/Linux/Windows) |
| Async | tokio | ^1 | Async runtime for file watcher, networking |
| File Watch | notify | ^6 | Rust-side filesystem events |
| Process | shared_child | ^0.4 | Process management for background tasks |
| Serialization | serde | ^1 | Config persistence, IPC |

### 2.3 DevOps & Distribution

- **CI/CD**: GitHub Actions — build matrix (macOS, Linux, Windows)
- **Updater**: Tauri auto-updater → GitHub Releases + `.sig` signatures
- **Crash Reports**: Sentry Rust SDK, opt-in only
- **Code Quality**: ESLint, Prettier, Rustfmt, Clippy
- **Testing**: Vitest (frontend), cargo test (backend)

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  [Custom Title Bar]  ~/projects/myapp (main) ● claude | CPU │
├──────────┬──────────────────────────────┬─────────────────────┤
│          │                              │                     │
│ Explorer │       Editor (CodeMirror 6)  │  [Agent Popup]      │
│  (tree)  │       ├─ splits, minimap   │  ┌──────────────┐   │
│          │       ├─ Vim mode          │  │ Terminal     │   │
│          │       └─ inline completion │  │ ┌────┬─────┐ │   │
│          │                              │  │Claude│Gemini│ │   │
│          │                              │  └────┴─────┘ │   │
├──────────┴──────────────────────────────┴─────────────────────┤
│  Terminal Tabs (xterm.js)                                   │
│  [tab1] [tab2] [tab3]                                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Core Principles

1. **The app is a shell, not an agent.** No built-in AI reasoning, no chat loop, no tool approval cards.
2. **PTY for agents, background processes for daemons.** Interactive agents need stdin + TTY emulation. Background processes (dev servers) use the simpler `shell_bg_spawn` pattern.
3. **WSL is a first-class citizen.** Agent discovery, PTY spawning, file I/O all handle WSL transparently.
4. **Everything is a file.** Settings stored in JSON. No SQLite database. Simple to inspect, version, and debug.
5. **Keyboard-first, mouse-second.** Every action has a default keybinding. The UI is dense and information-rich.

---

## 4. Module Breakdown

### 4.1 Frontend Modules (`src/`)

```
src/
├── app/
│   ├── App.tsx                 # Root layout, providers, command palette
│   ├── WindowChrome.tsx        # Custom title bar with system info
│   └── main.tsx                # Entry point
├── modules/
│   ├── agent-shell/             # BYOA — external agent system (NEW)
│   │   ├── components/
│   │   │   ├── AgentPopup.tsx        # Floating terminal popup
│   │   │   ├── AgentTabBar.tsx       # Multi-tab bar inside popup
│   │   │   ├── AgentTerminal.tsx     # xterm.js instance per tab
│   │   │   └── AgentPicker.tsx       # Dropdown to pick/open agents
│   │   ├── hooks/
│   │   │   ├── useAgentDiscovery.ts  # Auto-scan for agents
│   │   │   └── useAgentPty.ts        # PTY lifecycle per tab
│   │   ├── lib/
│   │   │   ├── types.ts             # ExternalAgentConfig, AgentTab
│   │   │   ├── pty-bridge.ts        # openAgentPty() wrapper
│   │   │   └── discovery.ts         # Client-side discovery helpers
│   │   └── store/
│   │       └── agentShellStore.ts   # Zustand: tabs, configs, active
│   ├── autocomplete/            # BYOK — inline editor completion (NEW)
│   │   ├── lib/
│   │   │   ├── provider.ts          # CodeMirror inline completion ext
│   │   │   ├── prompt.ts            # Prompt builder for completion
│   │   │   └── fetch.ts             # OpenAI-compatible fetch
│   │   └── hooks/
│   │       └── useAutocomplete.ts   # Model/key config
│   ├── command-palette/         # Global command palette (NEW)
│   │   ├── CommandPalette.tsx
│   │   └── lib/
│   │       └── commands.ts          # Command registry
│   ├── editor/                  # CodeMirror 6 editor
│   │   ├── EditorPane.tsx
│   │   ├── EditorGroup.tsx        # Split view management
│   │   ├── lib/
│   │   │   ├── extensions.ts      # Base CM6 extensions
│   │   │   ├── vim.ts             # Vim mode integration
│   │   │   ├── minimap.ts         # Minimap extension
│   │   │   ├── languageResolver.ts
│   │   │   └── themes.ts          # Editor themes matching app theme
│   │   └── hooks/
│   │       └── useEditorDocument.ts
│   ├── explorer/                # File tree
│   │   ├── FileExplorer.tsx
│   │   ├── lib/
│   │   │   ├── fileIcons.ts       # Minimal monochrome icons
│   │   │   └── useFileTree.ts
│   │   └── components/
│   │       └── TreeRow.tsx
│   ├── terminal/                # xterm.js terminal tabs
│   │   ├── TerminalPane.tsx
│   │   ├── TerminalTabs.tsx
│   │   └── lib/
│   │       ├── pty-bridge.ts      # openPty() Tauri wrapper
│   │       ├── useTerminalSession.ts
│   │       └── keymap.ts
│   ├── preview/                 # Web + Markdown preview
│   │   ├── WebPreviewPane.tsx
│   │   ├── MarkdownPreviewPane.tsx
│   │   └── lib/
│   │       └── urlUtils.ts
│   ├── diff/                    # Side-by-side diff viewer (NEW)
│   │   ├── DiffPane.tsx
│   │   └── lib/
│   │       └── diffEngine.ts
│   ├── search/                  # Global ripgrep search (NEW)
│   │   ├── SearchPanel.tsx
│   │   └── lib/
│   │       └── ripgrep.ts
│   ├── settings/                # Settings window + store
│   │   ├── SettingsApp.tsx
│   │   ├── openSettingsWindow.ts
│   │   ├── store.ts               # LazyStore persistence
│   │   ├── preferences.ts         # Zustand preferences slice
│   │   └── sections/
│   │       ├── AgentsSection.tsx      # External agent config
│   │       ├── ModelsSection.tsx      # BYOK model/provider config
│   │       ├── ShortcutsSection.tsx   # Keybinding editor
│   │       ├── ThemesSection.tsx
│   │       └── GeneralSection.tsx
│   ├── theme/                   # Theming system
│   │   ├── ThemeProvider.tsx
│   │   ├── applyTheme.ts
│   │   └── themes/
│   │       └── neon-dark.ts       # Default hacker theme
│   ├── workspace/               # Workspace env (Local / WSL)
│   │   ├── env.ts
│   │   └── lib/
│   │       └── wsl.ts
│   ├── shortcuts/               # Global keyboard shortcuts
│   │   ├── shortcuts.ts
│   │   └── hooks/
│   │       └── useGlobalShortcuts.ts
│   └── plugin-api/              # Extension system (stubs for future)
│       ├── ExtensionHost.tsx
│       └── lib/
│           └── types.ts
├── components/
│   └── ui/                      # shadcn/ui primitives
├── lib/
│   ├── utils.ts                 # cn(), formatters
│   └── fonts.ts                 # Monospace font loading
└── styles/
    ├── globals.css
    └── tokens.ts                # CSS custom properties for theming
```

### 4.2 Backend Modules (`src-tauri/src/`)

```
src-tauri/src/
├── main.rs                      # Tauri builder, plugin init
├── lib.rs                       # Module declarations, command exports
└── modules/
    ├── agent_shell/             # NEW: BYOA agent system
    │   ├── mod.rs               # Tauri commands: agent_discover, agent_pty_open, agent_pty_write, agent_pty_resize, agent_pty_close
    │   ├── discovery.rs         # PATH scanning (local + WSL)
    │   └── spawn.rs             # PTY spawning with custom command/env
    ├── pty/                     # Existing PTY system (reuse)
    │   ├── mod.rs
    │   └── session.rs
    ├── shell/                   # Background process + session system (reuse)
    │   ├── mod.rs
    │   ├── background.rs
    │   └── session.rs
    ├── fs/                      # File operations (reuse)
    │   └── mod.rs
    ├── git/                     # Git process wrapper (reuse)
    │   └── process.rs
    ├── workspace/               # WSL support (reuse)
    │   └── mod.rs
    ├── search/                  # ripgrep wrapper (NEW)
    │   └── mod.rs
    ├── watcher/                 # File watcher (NEW)
    │   └── mod.rs
    └── updater/                 # Update check (stub)
        └── mod.rs
```

---

## 5. Data Flow

### 5.1 Opening an External Agent

```
User clicks "Open Agent" or presses Space+a
    → AgentPicker shows available agents (auto-detected + custom)
    → User selects "Claude Code"
        → Frontend: agentShellStore.openTab("claude")
            → Backend: invoke("agent_pty_open", { command: "claude", cwd, workspace })
                → Rust: spawn.rs builds PTY with command
                    → WSL? → wsl.exe -d <distro> --cd <cwd> --exec claude
                    → Local? → direct PTY spawn
                → Returns pty_id
            → Frontend: new xterm.js instance attached to PTY
                → onData: xterm.write(bytes)
                → onKey: invoke("agent_pty_write", { id, data })
    → Popup opens with terminal stream
        → User types → keystrokes forwarded to PTY stdin
        → Agent stdout → xterm.js renders ANSI sequences
        → Agent spawns vim → TTY emulation handles cursor control
```

### 5.2 Inline Autocomplete (BYOK)

```
User types in editor
    → CodeMirror inline completion extension triggers
        → Debounced (150ms) or manual (Ctrl+Space)
        → Fetch: POST to user's configured endpoint
            → Headers: Authorization: Bearer <user_key>
            → Body: { model, prompt, suffix, max_tokens }
        → Response: { choices: [{ text }] }
    → Ghost text rendered inline
    → Tab to accept → text inserted at cursor
    → Esc to dismiss → ghost text removed
```

### 5.3 File Change Detection

```
Agent writes file outside editor
    → Rust notify watcher detects change
    → Tauri event "fs:changed" emitted
    → Frontend receives event
    → If file is open in editor:
        → Show "Modified externally" indicator on tab
        → If user has unsaved changes: prompt "Keep yours / Reload"
        → If no unsaved changes: auto-reload content
```

---

## 6. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No built-in AI agent | Removed entirely | App is a shell, not an agent. Avoids competing with Claude/Gemini. |
| PTY for agents | `portable-pty` | stdin support + TUI compatibility (vim, interactive prompts). Background processes (`Stdio::null()`) cannot do this. |
| WSL discovery | `wsl.exe -d <distro> --exec sh -lc "command -v ..."` | Scans WSL PATH, not Windows PATH. Mirrors existing shell PTY WSL pattern. |
| Auto-detect + manual | Both | Convenience for common agents, flexibility for custom scripts. |
| Popup kill behavior | Ask user each time | Prevents accidental data loss (agent had state) while avoiding zombie processes. |
| BYOK only for autocomplete | No chat AI | Autocomplete is the only AI primitive. Everything else is external agent territory. |
| OpenAI-compatible endpoint | Supported alongside providers | Users can run local models (Ollama, vLLM, LM Studio) or custom proxies. |
| Monospace everywhere | UI font = editor font | Reinforces hacker aesthetic. Consistent, dense, information-rich. |
| Vim/terminal keybindings | Space prefix defaults | Target audience knows terminal. VS Code preset available in settings. |
| Full session restore | Files + terminals + agents | Power users expect state continuity. Agents optionally restore (user choice per agent). |
| No SQLite | JSON files only | Lighter, inspectable, debuggable, no schema migrations. |
| Plugin architecture | Traits + hooks, not loading | Future-proofed. No actual plugin loading now, but core has extension points. |
| Agent API key injection | Auto-inject from BYOK config | If user configured Anthropic key for autocomplete, spawn Claude Code with `ANTHROPIC_API_KEY` auto-set. Seamless, no manual `.bashrc` needed. |
| Git backend | libgit2 + CLI fallback | git2 crate for status/diff (fast, no subprocess). Shell out to `git` CLI for rebase, merge, hooks, advanced ops. |
| File watching | Recursive + ignore patterns | notify crate watches workspace root, respects .gitignore + hardcoded exclusions (node_modules, target, .git, build dirs). |
| Error UX | Terminal output + minimal toast | Recoverable errors print to relevant terminal + brief top-right toast. No modal dialogs for routine failures. |

---

## 7. Implementation Phases

### Phase 0: Project Scaffolding
**Goal**: Working Tauri v2 app with React, build passes, dev server runs.
**Files**: `package.json`, `vite.config.ts`, `tsconfig.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src/main.tsx`, `.github/workflows/ci.yml`
**Success Criteria**:
- [ ] `pnpm install` succeeds
- [ ] `pnpm tauri dev` opens a window
- [ ] CI builds on macOS, Linux, Windows

### Phase 1: Core IDE Shell
**Goal**: File explorer, editor, terminal — the basic environment.
**Files**: `src/modules/explorer/`, `src/modules/editor/`, `src/modules/terminal/`, `src/app/App.tsx`
**Success Criteria**:
- [ ] Can open a folder and see file tree
- [ ] Can open files in CodeMirror 6 editor
- [ ] Can open terminal tabs and run commands
- [ ] Editor has syntax highlighting

### Phase 2: Theming & Keybindings
**Goal**: Hacker aesthetic applied, keyboard shortcuts wired.
**Files**: `src/modules/theme/`, `src/modules/shortcuts/`, `src/styles/`
**Success Criteria**:
- [ ] Dark neon theme applied (dark bg, cyan accents)
- [ ] Custom title bar renders with workspace path
- [ ] Space+e opens explorer, Space+t focuses terminal
- [ ] UI uses monospace font throughout

### Phase 3: Settings & BYOK Infrastructure
**Goal**: Settings window, model/provider config, keyring for API keys.
**Files**: `src/modules/settings/`, `src/modules/autocomplete/`, `src-tauri/src/modules/secrets/` (keyring)
**Success Criteria**:
- [ ] Settings window opens with tabs: General, Models, Agents, Shortcuts, Themes
- [ ] Can add OpenAI-compatible endpoint with URL + optional key
- [ ] Can add provider API keys (stored in OS keychain)
- [ ] Autocomplete fetches from configured endpoint

### Phase 4: BYOA Agent Shell
**Goal**: Agent discovery, PTY popup, multi-tab agent runner.
**Files**: `src/modules/agent-shell/`, `src-tauri/src/modules/agent_shell/`, `src/modules/diff/`
**Success Criteria**:
- [ ] Auto-detect finds installed CLI agents on PATH
- [ ] Clicking agent opens popup with PTY terminal
- [ ] Can type into popup, agent receives stdin
- [ ] Multiple agent tabs can run simultaneously
- [ ] Closing tab asks "Kill process? Yes / No / Cancel"
- [ ] Agent stdout renders correctly with ANSI colors

### Phase 5: WSL Integration
**Goal**: Agent discovery and spawning work in WSL workspaces.
**Files**: `src-tauri/src/modules/agent_shell/discovery.rs`, `src/modules/workspace/`
**Success Criteria**:
- [ ] Switching to WSL workspace re-runs agent discovery in WSL PATH
- [ ] Spawning agent in WSL uses `wsl.exe -d <distro>`
- [ ] File explorer shows WSL files correctly
- [ ] Terminal opens in WSL home directory

### Phase 6: Polish & Power-User Features
**Goal**: Search, diff, preview, session restore, zen mode, onboarding.
**Files**: `src/modules/search/`, `src/modules/preview/`, `src/modules/command-palette/`, `src-tauri/src/modules/watcher/`
**Success Criteria**:
- [ ] Ctrl+Shift+F opens ripgrep search with results
- [ ] Web preview pane loads localhost URLs
- [ ] Markdown preview renders .md files
- [ ] Side-by-side diff viewer works for git diffs
- [ ] Full session restore on reopen
- [ ] Zen mode hides all chrome
- [ ] Setup wizard on first launch

### Phase 7: Distribution
**Goal**: Auto-updater, signed builds, crash reporting opt-in.
**Files**: `.github/workflows/release.yml`, `src-tauri/src/modules/updater/`
**Success Criteria**:
- [ ] CI produces signed .dmg, .AppImage, .msi
- [ ] Auto-updater checks GitHub releases
- [ ] Crash reporting prompt on first run (opt-in)

---

## 8. Configuration

### 8.1 Global Config (`~/.config/antler-coder/`)

```
~/.config/antler-coder/
├── settings.json          # Global preferences
├── keybindings.json       # Custom shortcuts
├── agents.json            # Custom agent configurations
├── themes/                # User-defined themes
│   └── custom-neon.json
└── crash.log              # Local crash logs
```

### 8.2 Project Config (`.antler-coder.json` in workspace root)

```json
{
  "settings": {
    "autocomplete.model": "local-ollama",
    "editor.tabSize": 2,
    "terminal.defaultShell": "/bin/zsh"
  },
  "agents": {
    "defaultArgs": ["--yolo"],
    "env": {
      "ANTHROPIC_API_KEY": "${KEYRING:anthropic}"
    }
  }
}
```

### 8.3 Default Shortcuts

| Action | Default | VS Code Preset |
|--------|---------|----------------|
| Command Palette | `Space` + `Shift` + `P` | `Ctrl` + `Shift` + `P` |
| Quick Open File | `Space` + `P` | `Ctrl` + `P` |
| Toggle Explorer | `Space` + `E` | `Ctrl` + `Shift` + `E` |
| Toggle Terminal | `Space` + `T` | `` Ctrl` + ` `` |
| Agent Popup | `Space` + `A` | `Ctrl` + `Shift` + `A` |
| Focus Left | `Ctrl` + `W` + `H` | `Ctrl` + `K` + `Ctrl` + `H` |
| Focus Right | `Ctrl` + `W` + `L` | `Ctrl` + `K` + `Ctrl` + `L` |
| Zen Mode | `Space` + `Z` | — |
| Search Files | `Space` + `Shift` + `F` | `Ctrl` + `Shift` + `F` |
| Settings | `Space` + `,` | `Ctrl` + `,` |

---

## 9. Rust API Surface (Tauri Commands)

### 9.1 Agent Shell

```rust
#[tauri::command]
async fn agent_discover(
    workspace: WorkspaceEnv,
) -> Result<Vec<DetectedAgent>, String>;

#[tauri::command]
async fn agent_pty_open(
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    cwd: Option<String>,
    workspace: WorkspaceEnv,
    cols: u16,
    rows: u16,
    on_data: Channel<Vec<u8>>,
    on_exit: Channel<i32>,
) -> Result<u32, String>;

#[tauri::command]
async fn agent_pty_write(id: u32, data: String) -> Result<(), String>;

#[tauri::command]
async fn agent_pty_resize(id: u32, cols: u16, rows: u16) -> Result<(), String>;

#[tauri::command]
async fn agent_pty_close(id: u32) -> Result<(), String>;
```

### 9.2 File System & Search

```rust
#[tauri::command]
async fn fs_read_file(path: String, workspace: WorkspaceEnv) -> Result<String, String>;

#[tauri::command]
async fn fs_write_file(path: String, content: String, workspace: WorkspaceEnv) -> Result<(), String>;

#[tauri::command]
async fn fs_list_dir(path: String, workspace: WorkspaceEnv) -> Result<Vec<DirEntry>, String>;

#[tauri::command]
async fn search_ripgrep(
    query: String,
    path: String,
    regex: bool,
    case_sensitive: bool,
    workspace: WorkspaceEnv,
) -> Result<Vec<SearchResult>, String>;
```

### 9.3 Secrets (Keyring)

```rust
#[tauri::command]
async fn secret_get(key: String) -> Result<Option<String>, String>;

#[tauri::command]
async fn secret_set(key: String, value: String) -> Result<(), String>;

#[tauri::command]
async fn secret_delete(key: String) -> Result<(), String>;
```

---

## 10. Frontend Store Architecture (Zustand)

### 10.1 Store Slices

```typescript
// workspaceStore.ts — Active workspace, WSL distro
interface WorkspaceState {
  env: WorkspaceEnv;            // { kind: "local" } | { kind: "wsl", distro: string }
  distros: WslDistro[];
  setEnv: (env: WorkspaceEnv) => void;
  refreshDistros: () => Promise<WslDistro[]>;
}

// agentShellStore.ts — External agent configuration + running tabs
interface AgentShellState {
  configs: ExternalAgentConfig[];      // Persistent: auto-detected + custom
  tabs: AgentTab[];                    // Ephemeral: running PTY sessions
  activeTabId: string | null;
  openTab: (configId: string) => Promise<void>;
  closeTab: (tabId: string, kill: boolean) => Promise<void>;
  addCustomConfig: (config: ExternalAgentConfig) => void;
  removeCustomConfig: (id: string) => void;
}

// editorStore.ts — Open files, splits, scroll positions
interface EditorState {
  groups: EditorGroup[];               // Split groups
  activeGroupId: string;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActive: (groupId: string, path: string) => void;
}

// terminalStore.ts — Terminal tabs
interface TerminalState {
  tabs: TerminalTab[];
  activeTabId: string | null;
  addTab: (cwd?: string) => Promise<void>;
  closeTab: (id: string) => void;
}

// preferencesStore.ts — Settings
interface PreferencesState {
  theme: string;
  fontSize: number;
  tabSize: number;
  vimMode: boolean;
  autocompleteEnabled: boolean;
  autocompleteMode: "ghost" | "manual" | "both";
  autocompleteProvider: ProviderConfig;
  // ... persisted via LazyStore
}
```

---

## 11. BYOK Autocomplete Architecture

### 11.1 Provider Configuration

Users configure one of:
1. **Cloud provider** (OpenAI, Anthropic, Google, etc.) → API key from keyring
2. **OpenAI-compatible endpoint** → Base URL + optional API key
3. **Local server** (Ollama, LM Studio, vLLM) → Base URL, no key

### 11.2 CodeMirror Extension

```typescript
// Inline ghost text + manual trigger
const autocompleteExtension = inlineCompletionPlugin({
  mode: "both", // "ghost" | "manual" | "both"
  debounceMs: 150,
  fetch: async (context: CompletionContext) => {
    const config = usePreferencesStore.getState().autocompleteProvider;
    const response = await fetch(config.baseUrl + "/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.modelId,
        prompt: context.prefix,
        suffix: context.suffix,
        max_tokens: 64,
        temperature: 0.2,
      }),
    });
    return response.json();
  },
});
```

### 11.3 Prompt Engineering

```
# Context-aware completion prompt
<|fim_prefix|>{prefix}
<|fim_suffix|>{suffix}
<|fim_middle|>
```

Uses the standard `fim` (fill-in-the-middle) format supported by most completion APIs.

---

## 12. BYOA Agent Shell Architecture

### 12.1 Agent Configuration Schema

```typescript
interface ExternalAgentConfig {
  id: string;                    // "claude", "gemini", "custom:my-script"
  name: string;                  // "Claude Code"
  binary: string;                // "claude" (PATH-resolved) or absolute path
  args: string[];               // ["--yolo"]
  env: Record<string, string>;  // { "ANTHROPIC_API_KEY": "..." }
  cwd?: string;                 // Override working directory
  icon: AgentIconId;            // "claude" | "gemini" | "terminal" | ...
  source: "auto-detected" | "custom";
  detectedPath?: string;        // Full path from discovery
}

interface AgentTab {
  id: string;                   // Tab ID
  configId: string;             // References ExternalAgentConfig
  ptyId: number;              // Tauri PTY handle
  status: "running" | "exited" | "error";
  title: string;                // Usually config.name
  createdAt: number;
}
```

### 12.2 Discovery Algorithm

```rust
// Local
fn discover_local() -> Vec<DetectedAgent> {
    let known = ["claude", "gemini", "aider", "opencode", "pi", "codex", "goose"];
    known.iter()
        .filter_map(|name| which::which(name).ok())
        .map(|path| DetectedAgent { name, path, source: "local" })
        .collect()
}

// WSL
fn discover_wsl(distro: &str) -> Result<Vec<DetectedAgent>, String> {
    let script = r#"
        for cmd in claude gemini aider opencode pi codex goose; do
            if path=$(command -v "$cmd" 2>/dev/null); then
                echo "$cmd:$path"
            fi
        done
    "#;
    let out = wsl_exec_capture(distro, "sh", &["-c", script])?;
    parse_discovery_output(&out)
}
```

### 12.3 WSL Spawning

```rust
fn build_agent_command(
    binary: &str,
    args: &[String],
    workspace: &WorkspaceEnv,
    cwd: Option<&str>,
) -> Result<CommandBuilder, String> {
    match workspace {
        WorkspaceEnv::Local => {
            let mut cmd = CommandBuilder::new(binary);
            cmd.args(args);
            if let Some(cwd) = cwd { cmd.cwd(cwd); }
            Ok(cmd)
        }
        WorkspaceEnv::Wsl { distro } => {
            let mut cmd = CommandBuilder::new("wsl.exe");
            cmd.arg("-d").arg(distro);
            if let Some(cwd) = cwd {
                cmd.arg("--cd").arg(cwd);
            }
            cmd.arg("--exec").arg(binary);
            cmd.args(args);
            Ok(cmd)
        }
    }
}
```

---

## 13. Security Considerations

1. **Agent processes run as the OS user** — same privileges as the app. Document this clearly. No sandboxing by default.
2. **API keys in OS keyring** — never written to plain text. `secret_get`/`secret_set` use the OS-native keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).
3. **WSL distro validation** — `validate_wsl_distro_name()` rejects path traversal (`..`, `/`, `\`) before constructing any WSL command.
4. **CWD authorization** — All spawn commands check that the requested cwd is within the authorized workspace root. Prevents agents from escaping the project directory.
5. **No MCP server exposure** — External agents operate directly on the filesystem. Terax does not expose tools via MCP or any protocol. The app is a passive environment.
6. **Crash reports are opt-in** — Sentry only initializes if the user explicitly agrees during onboarding.

---

## 14. Testing Strategy

| Layer | Framework | Coverage Target |
|-------|-----------|-----------------|
| Rust backend | `cargo test` | PTY spawning, WSL command building, discovery parsing, file watcher |
| Frontend logic | Vitest | Store slices, command registry, keybinding resolution |
| Frontend components | React Testing Library | Settings forms, picker components, command palette |
| E2E | Playwright | Open workspace → open file → spawn agent → type in popup |

---

## 15. Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tauri v2 breaking changes | High | Pin exact versions, subscribe to Tauri release notes, maintain lockfiles |
| xterm.js performance with large agent output | Medium | Use `dormantRing` pattern (like Terax), limit scrollback buffer |
| WSL detection false negatives | Medium | Allow manual override for every auto-detected field |
| CodeMirror 6 + Vim mode + autocomplete conflicts | Medium | Test extensively, provide escape hatches (disable Vim or autocomplete) |
| PTY process leaks | High | `Drop` impl kills child, app exit handler enumerates and kills all PTYs |
| Plugin API never used | Low | Keep as traits/interfaces only, no runtime overhead |

---

## 16. Next Steps

1. **Review this plan** — Approve or request changes
2. **Scaffold Phase 0** — Initialize Tauri v2 + React + Vite project
3. **Implement Phase 1** — Core IDE shell (explorer, editor, terminal)
4. **Iterate through phases** — One phase at a time, with review gates

---

## 17. Appendix: Latest Follow-up Decisions (2026-05-22)

| Question | Decision |
|----------|----------|
| Agent API key injection | **Auto-inject from BYOK config** — spawning Claude Code automatically picks up the Anthropic key the user configured for autocomplete. No manual `.bashrc` edits. |
| Git backend | **Hybrid: libgit2 + CLI fallback** — `git2` crate for fast status/diff read-only ops. Shell out to `git` CLI for interactive/advanced operations (rebase, merge, hooks, config). |
| File watch large repos | **Recursive with ignore patterns** — `notify` + `ignore` crate watches workspace root, respects `.gitignore`, hardcoded exclusions: `.git/`, `node_modules/`, `target/`, `build/`, `dist/`, `*.log`. |
| Error UX | **Terminal output + minimal toast** — agent spawn fails → error in popup terminal + 3s toast top-right. No modals for recoverable errors. Modal only for critical/blocking issues. |

---

*End of Plan*
