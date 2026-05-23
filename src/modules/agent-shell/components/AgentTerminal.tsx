import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { invoke } from "@tauri-apps/api/core";
import "@xterm/xterm/css/xterm.css";
import { useTheme } from "@/modules/theme/useTheme";

interface AgentTerminalProps {
  ptyId: number;
  visible: boolean;
  onExit?: () => void;
  /** Shared ref for the parent to push PTY data */
  dataSink?: React.MutableRefObject<((data: Uint8Array) => void) | null>;
}

export default function AgentTerminal({ ptyId, visible, onExit, dataSink }: AgentTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
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

    termRef.current = term;

    // Wire data sink: parent writes PTY output → terminal
    if (dataSink) {
      dataSink.current = (data: Uint8Array) => {
        term.write(data);
      };
    }

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
      termRef.current = null;
      if (dataSink) {
        dataSink.current = null;
      }
    };
  }, [ptyId, tokens, onExit, dataSink]);

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
