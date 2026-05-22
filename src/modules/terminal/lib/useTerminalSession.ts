import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import type { PtySession } from "./pty-bridge";
import { openPty } from "./pty-bridge";

export interface TerminalSession {
  terminal: Terminal;
  fitAddon: FitAddon;
  pty: PtySession | null;
  write: (data: string) => void;
  focus: () => void;
  getBuffer: (maxLines?: number) => string;
}

export function useTerminalSession(
  containerRef: React.RefObject<HTMLDivElement | null>,
  cwd: string
): TerminalSession | null {
  const [session, setSession] = useState<TerminalSession | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    const term = new Terminal({
      fontFamily: "JetBrains Mono, Fira Code, monospace",
      fontSize: 12,
      cursorBlink: true,
      cursorStyle: "block",
      theme: {
        background: "#0a0a0a",
        foreground: "#ebebeb",
        cursor: "#00f0ff",
        selectionBackground: "#00f0ff20",
        black: "#0a0a0a",
        red: "#ff3860",
        green: "#00ff88",
        yellow: "#ffb000",
        blue: "#00f0ff",
        magenta: "#bd93f9",
        cyan: "#00f0ff",
        white: "#ebebeb",
        brightBlack: "#3a3a3a",
        brightRed: "#ff6b8a",
        brightGreen: "#4dffa6",
        brightYellow: "#ffd24d",
        brightBlue: "#4df0ff",
        brightMagenta: "#d4b8fc",
        brightCyan: "#4df0ff",
        brightWhite: "#ffffff",
      },
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current);
    fitAddon.fit();

    let ptySession: PtySession | null = null;
    let active = true;

    // Spawn PTY
    (async () => {
      const dims = fitAddon.proposeDimensions();
      const cols = dims?.cols ?? 80;
      const rows = dims?.rows ?? 24;

      try {
        ptySession = await openPty(cwd, cols, rows, {
          onData: (bytes) => {
            if (active) term.write(bytes);
          },
          onExit: (code) => {
            if (active) {
              term.writeln(`\r\nProcess exited with code ${code}`);
            }
          },
        });
      } catch (e) {
        if (active) {
          term.writeln(`\r\nFailed to spawn PTY: ${String(e)}`);
        }
      }

      if (active) {
        term.onData((data) => {
          ptySession?.write(data).catch(console.error);
        });
      }
    })();

    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ptySession) {
        ptySession.resize(dims.cols, dims.rows).catch(console.error);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const s: TerminalSession = {
      terminal: term,
      fitAddon,
      pty: ptySession,
      write: (data) => term.write(data),
      focus: () => term.focus(),
      getBuffer: (maxLines = 1000) => {
        const lines: string[] = [];
        const total = Math.min(term.buffer.active.length, maxLines);
        for (let i = 0; i < total; i++) {
          lines.push(term.buffer.active.getLine(i)?.translateToString(true) ?? "");
        }
        return lines.join("\n");
      },
    };

    setSession(s);

    return () => {
      active = false;
      observer.disconnect();
      ptySession?.close().catch(console.error);
      term.dispose();
      initRef.current = false;
    };
  }, [containerRef, cwd]);

  return session;
}
