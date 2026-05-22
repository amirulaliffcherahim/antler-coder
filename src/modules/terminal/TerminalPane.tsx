import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useTerminalSession } from "./lib/useTerminalSession";

export interface TerminalPaneHandle {
  write: (data: string) => void;
  focus: () => void;
  getBuffer: (maxLines?: number) => string;
}

interface TerminalPaneProps {
  cwd: string;
  visible: boolean;
}

const TerminalPane = forwardRef<TerminalPaneHandle, TerminalPaneProps>(
  function TerminalPane({ cwd, visible }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const session = useTerminalSession(containerRef, cwd);

    useEffect(() => {
      if (visible && session) {
        setTimeout(() => session.fitAddon.fit(), 50);
      }
    }, [visible, session]);

    useImperativeHandle(
      ref,
      () => ({
        write: (data: string) => session?.write(data),
        focus: () => session?.focus(),
        getBuffer: (maxLines?: number) => session?.getBuffer(maxLines) ?? "",
      }),
      [session]
    );

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
);

export default TerminalPane;
