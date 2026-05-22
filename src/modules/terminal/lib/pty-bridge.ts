import { invoke, Channel } from "@tauri-apps/api/core";

export interface PtySession {
  id: number;
  write: (data: string) => Promise<void>;
  resize: (cols: number, rows: number) => Promise<void>;
  close: () => Promise<void>;
}

export interface PtyHandlers {
  onData: (bytes: Uint8Array) => void;
  onExit?: (code: number) => void;
}

export async function openPty(
  cwd: string,
  cols: number,
  rows: number,
  handlers: PtyHandlers
): Promise<PtySession> {
  const onData = new Channel<ArrayBuffer>();
  const onExit = new Channel<number>();

  let released = false;
  const noop = () => {};
  const releaseHandlers = () => {
    if (released) return;
    released = true;
    onData.onmessage = noop;
    onExit.onmessage = noop;
  };

  onData.onmessage = (buf) => handlers.onData(new Uint8Array(buf));
  onExit.onmessage = (code) => {
    handlers.onExit?.(code);
    releaseHandlers();
  };

  const id = await invoke<number>("agent_pty_open", {
    command: "/bin/bash",
    args: ["-i"],
    env: {},
    cwd,
    workspace: { kind: "local" },
    cols,
    rows,
    onData,
    onExit,
  });

  let closed = false;

  return {
    id,
    write: (data) => invoke("agent_pty_write", { id, data }),
    resize: (c, r) => invoke("agent_pty_resize", { id, cols: c, rows: r }),
    close: async () => {
      if (closed) return;
      closed = true;
      try {
        await invoke("agent_pty_close", { id });
      } finally {
        releaseHandlers();
      }
    },
  };
}
