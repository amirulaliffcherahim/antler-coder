import { invoke } from "@tauri-apps/api/core";
import type { DetectedAgent } from "./types";

export async function discoverAgents(): Promise<DetectedAgent[]> {
  return invoke("agent_discover", {
    workspace: { kind: "local" },
  });
}
