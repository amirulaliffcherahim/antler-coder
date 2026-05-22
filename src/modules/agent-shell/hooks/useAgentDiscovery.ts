import { useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAgentShellStore } from "../store";
import type { DetectedAgent, ExternalAgentConfig } from "../lib/types";

export function useAgentDiscovery() {
  const { discovered, setDiscovered, isDiscovering, setIsDiscovering, configs, setConfigs } =
    useAgentShellStore();

  const discover = useCallback(async () => {
    setIsDiscovering(true);
    try {
      const agents = await invoke<DetectedAgent[]>("agent_discover", {
        workspace: { kind: "local" },
      });
      setDiscovered(agents);

      // Convert discovered agents to configs
      const newConfigs: ExternalAgentConfig[] = agents.map((agent) => ({
        id: `auto:${agent.id}`,
        name: agent.name,
        binary: agent.path,
        args: [],
        env: {},
        icon: agent.id as ExternalAgentConfig["icon"],
        source: "auto-detected",
        detectedPath: agent.path,
      }));

      // Merge with existing custom configs
      const customConfigs = configs.filter((c) => c.source === "custom");
      setConfigs([...newConfigs, ...customConfigs]);
    } catch (e) {
      console.error("Agent discovery failed:", e);
    } finally {
      setIsDiscovering(false);
    }
  }, [setIsDiscovering, setDiscovered, setConfigs, configs]);

  // Auto-discover on mount
  useEffect(() => {
    if (configs.length === 0 && !isDiscovering) {
      discover();
    }
  }, []);

  return { discover, isDiscovering, discovered };
}
