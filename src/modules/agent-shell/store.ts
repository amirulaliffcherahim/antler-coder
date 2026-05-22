import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ExternalAgentConfig, AgentTab, DetectedAgent } from "./lib/types";

interface AgentShellState {
  // Configs
  configs: ExternalAgentConfig[];
  setConfigs: (configs: ExternalAgentConfig[]) => void;
  addCustomConfig: (config: ExternalAgentConfig) => void;
  removeCustomConfig: (id: string) => void;

  // Tabs
  tabs: AgentTab[];
  activeTabId: string | null;
  openTab: (configId: string, ptyId: number, title: string) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabStatus: (tabId: string, status: AgentTab["status"]) => void;

  // Discovery
  discovered: DetectedAgent[];
  setDiscovered: (agents: DetectedAgent[]) => void;
  isDiscovering: boolean;
  setIsDiscovering: (v: boolean) => void;
}

let tabCounter = 0;

export const useAgentShellStore = create<AgentShellState>((set, get) => ({
  configs: [],
  setConfigs: (configs) => set({ configs }),
  addCustomConfig: (config) =>
    set((s) => ({ configs: [...s.configs, config] })),
  removeCustomConfig: (id) =>
    set((s) => ({ configs: s.configs.filter((c) => c.id !== id) })),

  tabs: [],
  activeTabId: null,
  openTab: (configId, ptyId, title) => {
    const id = `agent-tab-${++tabCounter}`;
    const tab: AgentTab = {
      id,
      configId,
      ptyId,
      status: "running",
      title,
      createdAt: Date.now(),
    };
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: id }));
    return id;
  },
  closeTab: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (tab) {
      invoke("agent_pty_close", { id: tab.ptyId }).catch(console.error);
    }
    set((s) => {
      const next = s.tabs.filter((t) => t.id !== tabId);
      return {
        tabs: next,
        activeTabId:
          s.activeTabId === tabId
            ? next[next.length - 1]?.id ?? null
            : s.activeTabId,
      };
    });
  },
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  updateTabStatus: (tabId, status) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, status } : t)),
    })),

  discovered: [],
  setDiscovered: (agents) => set({ discovered: agents }),
  isDiscovering: false,
  setIsDiscovering: (v) => set({ isDiscovering: v }),
}));
