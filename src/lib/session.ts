import { LazyStore } from "@tauri-apps/plugin-store";

const STORE = new LazyStore("antler-coder-session.json", { defaults: {}, autoSave: 200 });

const SESSION_KEY = "session";

export interface OpenFileEntry {
  path: string;
  name: string;
}

export interface TerminalTabEntry {
  id: string;
  name: string;
  cwd: string;
}

export interface AgentTabEntry {
  id: string;
  configId: string;
  ptyId: number;
  status: "running" | "exited" | "error";
  title: string;
  createdAt: number;
}

export interface SessionData {
  version: number;
  openFiles: OpenFileEntry[];
  activeFilePath: string | null;
  terminalTabs: TerminalTabEntry[];
  activeTerminalId: string;
  agentTabs: AgentTabEntry[];
  activeAgentTabId: string | null;
}

const CURRENT_VERSION = 1;

/**
 * Save the current session to persistent storage.
 * Debounced writes are handled by LazyStore's autoSave (200ms).
 */
export async function saveSession(data: SessionData): Promise<void> {
  try {
    await STORE.set(SESSION_KEY, { ...data, version: CURRENT_VERSION });
  } catch {
    // Storage may be unavailable during development or first runs
  }
}

/**
 * Load a previously saved session.
 * Returns null if no session exists or version is incompatible.
 */
export async function loadSession(): Promise<SessionData | null> {
  try {
    const raw = await STORE.get<SessionData>(SESSION_KEY);
    if (!raw || raw.version !== CURRENT_VERSION) return null;
    return raw;
  } catch {
    return null;
  }
}

/**
 * Clear all persisted session data.
 */
export async function clearSession(): Promise<void> {
  try {
    await STORE.delete(SESSION_KEY);
  } catch {
    // ignore
  }
}
