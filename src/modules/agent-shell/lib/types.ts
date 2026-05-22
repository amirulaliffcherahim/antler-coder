export interface ExternalAgentConfig {
  id: string;
  name: string;
  binary: string;
  args: string[];
  env: Record<string, string>;
  cwd?: string;
  icon: AgentIconId;
  source: "auto-detected" | "custom";
  detectedPath?: string;
}

export type AgentIconId =
  | "claude"
  | "gemini"
  | "aider"
  | "opencode"
  | "pi"
  | "codex"
  | "goose"
  | "continue"
  | "supermaven"
  | "hermes"
  | "terminal";

export interface AgentTab {
  id: string;
  configId: string;
  ptyId: number;
  status: "running" | "exited" | "error";
  title: string;
  createdAt: number;
}

export interface DetectedAgent {
  id: string;
  name: string;
  path: string;
  version?: string;
  source: string;
}
