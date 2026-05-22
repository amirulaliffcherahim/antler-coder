# Antler Coder

> A lightweight, open-source universal agent shell for developers.

**Antler Coder** is not an AI agent — it is a developer environment that hosts external CLI agents (Claude Code, Gemini CLI, Aider, Pi, Hermes, etc.). You bring your own agent, and Antler Coder provides the terminal, editor, file explorer, and preview pane they operate in.

## Philosophy

- **Shell, not agent.** Antler Coder does not reason, plan, or write code. It spawns your chosen agent in a PTY and gets out of the way.
- **BYOA (Bring Your Own Agent).** Auto-discovers installed CLI agents. Supports custom agents via configuration.
- **BYOK (Bring Your Own Key).** Inline editor autocomplete connects to your OpenAI-compatible endpoint or provider API key.
- **Power-user UX.** Keyboard-first with Space-prefix chords. Muted zinc/teal aesthetic. Resizable panels, zen mode.
- **WSL-first.** Built for remote development. Agents discover and spawn inside WSL seamlessly.

## Features

| Feature | Status |
|---------|--------|
| Multi-tab floating agent popup (PTY terminal) | ✅ |
| Auto-discovery of CLI agents (Claude, Gemini, Aider, etc.) | ✅ |
| Inline editor autocomplete (BYOK) | ✅ Ghost-text via OpenAI/Anthropic |
| CodeMirror 6 editor | ✅ Vim mode toggle, lazy language loading |
| File explorer | ✅ Recursive tree, expand/collapse |
| Terminal tabs | ✅ xterm.js, multi-tab, PTY I/O |
| Drag-resizable panels | ✅ Sidebar + terminal, persisted to localStorage |
| Global ripgrep search | ✅ With regex/case toggle |
| Settings window | ✅ General, Models, Agents, Shortcuts, Themes, About |
| Onboarding wizard | ✅ 4-step first-run |
| Theme system | ✅ Zinc Dark (teal) + Zinc Blue themes |
| WSL integration | ✅ Distro picker, WSL PATH scan, wsl.exe spawn |
| Session restore | ✅ Files, terminals, agent tabs persisted |
| Agent exit notification | ✅ Tauri Channel callback (no polling) |
| Zen mode | ✅ Hides all chrome for focused editing |
| Window controls | ✅ Min/max/close wired to Tauri API |
| ARIA accessibility | ✅ Roles, labels, focus indicators |
| Auto-collapse | ✅ Sidebar <600px, terminal <400px |
| Performance | ✅ main.js 77 kB (CodeMirror/xterm lazy-loaded) |
| Side-by-side diff viewer | ⏳ |
| Web + Markdown preview | ⏳ |

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Editor:** CodeMirror 6 (Vim mode + inline autocomplete)
- **Terminal:** xterm.js
- **Backend:** Tauri v2 + Rust
- **PTY:** portable-pty
- **Secrets:** OS keyring (keyring crate)
- **Persistence:** LazyStore (tauri-plugin-store)
- **Animations:** CSS-only via Tailwind utilities

## Development

### Prerequisites

| Platform | Required Packages |
|----------|-------------------|
| macOS | Xcode Command Line Tools, Rust, Node.js 20+ |
| Linux (Fedora) | `sudo dnf install dbus-devel webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel file-devel openssl-devel gtk3-devel pkgconf-pkg-config` |
| Linux (Ubuntu/Debian) | `sudo apt install libdbus-1-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev libssl-dev libgtk-3-dev pkg-config` |
| Windows | Visual Studio Build Tools, Rust, Node.js 20+ |

### Quick Start

```bash
# 1. Install pnpm (if not already)
sudo npm install -g pnpm@9

# 2. Install frontend dependencies
pnpm install

# 3. Install Rust dependencies (first time only)
cd src-tauri && cargo fetch

# 4. Run in dev mode (opens Tauri window with HMR)
pnpm tauri-dev

# 5. Or just the frontend (browser, no Rust backend)
pnpm dev
```

### Available Commands

```bash
pnpm dev              # Frontend only — Vite dev server (port 1420)
pnpm tauri-dev        # Full app — Vite + Tauri + Rust (recommended)
pnpm tauri-build      # Production build — creates .deb/.rpm
pnpm build            # Frontend production build only
pnpm lint             # ESLint check
pnpm format           # Prettier format
pnpm test             # Vitest run
```

### First Build

The first `pnpm tauri-dev` will compile all Rust dependencies — this takes **3-10 minutes** depending on your machine. Subsequent builds are incremental and much faster.

### Linux Display

If running on WSL or a headless Linux box, ensure a display server is available:

```bash
# WSL with Windows host (uses Windows display)
export DISPLAY=:0

# Native Linux with X11
export DISPLAY=:0

# Native Linux with Wayland
export WAYLAND_DISPLAY=wayland-0
```

## Default Keybindings

| Action | Binding |
|--------|---------|
| Toggle Explorer | `Space+e` |
| Toggle Terminal | `Space+t` |
| Agent Popup | `Space+a` |
| Zen Mode | `Space+z` |
| Close Tab | `Space+q` |
| Settings | `Space+,` |
| Search Files | `Shift+Space+f` |

VS Code preset available in Settings → Shortcuts.

## License

MIT
