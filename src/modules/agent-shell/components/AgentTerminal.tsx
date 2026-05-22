import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { invoke, Channel } from "@tauri-apps/api/core";
import "@xterm/xterm/css/xterm.css";
import { useTheme } from "@/modules/theme/ThemeProvider";

interface AgentTerminalProps {
  ptyId: number;
  visible: boolean;
  onExit?: () => void;
}

export default function AgentTerminal({ ptyId, visible, onExit }: AgentTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tokens } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      fontFamily: "JetBrains Mono, Fira Code, monospace",
      fontSize: 12,
      cursorBlink: true,
      cursorStyle: "block",
      theme: {
        background: tokens.background,
        foreground: tokens.foreground,
        cursor: tokens.neonCyan,
        selectionBackground: `${tokens.neonCyan}30`,
        black: tokens.background,
        red: tokens.neonRed,
        green: tokens.neonGreen,
        yellow: tokens.neonAmber,
        blue: tokens.neonCyan,
        magenta: tokens.neonPurple,
        cyan: tokens.neonCyan,
        white: tokens.foreground,
        brightBlack: tokens.muted,
        brightRed: tokens.neonRed,
        brightGreen: tokens.neonGreen,
        brightYellow: tokens.neonAmber,
        brightBlue: tokens.neonCyan,
        brightMagenta: tokens.neonPurple,
        brightCyan: tokens.neonCyan,
        brightWhite: tokens.foreground,
      },
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current);
    fitAddon.fit();

    // Wire PTY data → terminal
    const onData = new Channel<ArrayBuffer>();
    const onExitChannel = new Channel<number>();

    onData.onmessage = (buf) => {
      term.write(new Uint8Array(buf));
    };
    onExitChannel.onmessage = (code) => {
      term.writeln(`\r\nProcess exited with code ${code}`);
      onExit?.();
    };

    // Set up data channel binding
    (async () => {
      try {
        await invoke("agent_pty_open", {
          command: "",
          args: [],
          env: {},
          cwd: null,
          workspace: { kind: "local" },
          cols: fitAddon.proposeDimensions()?.cols ?? 80,
          rows: fitAddon.proposeDimensions()?.rows ?? 24,
          onData,
          onExit: onExitChannel,
        });
      } catch {
        // PTY already opened externally; we'll receive data via the channel
      }
    })();

    // Terminal input → PTY
    term.onData((data) => {
      invoke("agent_pty_write", { id: ptyId, data }).catch(console.error);
    });

    // Resize
    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        invoke("agent_pty_resize", {
          id: ptyId,
          cols: dims.cols,
          rows: dims.rows,
        }).catch(console.error);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      term.dispose();
    };
  }, [ptyId, tokens, onExit]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
        padding: "4px",
      }}
    />
  );
}
