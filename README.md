# Antler Coder

> A lightweight, open-source universal agent shell for developers.

**Antler Coder** is not an AI agent — it is a developer environment that hosts external CLI agents (Claude Code, Gemini CLI, Aider, Pi, Hermes, etc.). You bring your own agent, and Antler Coder provides the terminal, editor, file explorer, and preview pane they operate in.

## Philosophy

- **Shell, not agent.** Antler Coder does not reason, plan, or write code. It spawns your chosen agent in a PTY and gets out of the way.
- **BYOA (Bring Your Own Agent).** Auto-discovers installed CLI agents. Supports custom agents via configuration.
- **BYOK (Bring Your Own Key).** Inline editor autocomplete connects to your OpenAI-compatible endpoint or provider API key.
- **Power-user UX.** Monospace everywhere. Vim/terminal keybindings by default. Dark neon aesthetic. Dense, keyboard-first interface.
- **WSL-first.** Built for remote development. Agents discover and spawn inside WSL seamlessly.

## Features

| Feature | Status |
|---------|--------|
| Multi-tab floating agent popup (PTY terminal) | 🚧 Phase 4 |
| Auto-discovery of CLI agents (Claude, Gemini, Aider, etc.) | 🚧 Phase 4 |
| Inline editor autocomplete (BYOK) | 🚧 Phase 3 |
| CodeMirror 6 editor with Vim mode | 🚧 Phase 1 |
| File explorer with monochrome icons | 🚧 Phase 1 |
| Terminal tabs (xterm.js) | 🚧 Phase 1 |
| Global ripgrep search | 🚧 Phase 6 |
| Side-by-side diff viewer | 🚧 Phase 6 |
| Web + Markdown preview | 🚧 Phase 6 |

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand
- **Editor:** CodeMirror 6 (with Vim mode via `@replit/codemirror-vim`)
- **Terminal:** xterm.js
- **Backend:** Tauri v2 + Rust
- **PTY:** portable-pty
- **Package Manager:** pnpm

## Development

```bash
# Install dependencies
pnpm install

# Run in dev mode (Tauri window)
pnpm tauri-dev

# Build for production
pnpm tauri-build

# Lint
pnpm lint

# Test
pnpm test
```

## License

MIT
