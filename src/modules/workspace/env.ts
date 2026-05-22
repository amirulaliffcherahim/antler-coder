import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export type WorkspaceEnv =
  | { kind: "local"; rootPath: string }
  | { kind: "wsl"; distro: string; rootPath: string };

export type WslDistro = {
  name: string;
  default: boolean;
  running: boolean;
};

type State = {
  env: WorkspaceEnv;
  distros: WslDistro[];
  isWslAvailable: boolean;
  setEnv: (env: WorkspaceEnv) => void;
  refreshDistros: () => Promise<WslDistro[]>;
};

const LOCAL_DEFAULT: WorkspaceEnv = {
  kind: "local",
  rootPath: "/home/aleph",
};

export const useWorkspaceEnvStore = create<State>((set, get) => ({
  env: LOCAL_DEFAULT,
  distros: [],
  isWslAvailable: false,

  setEnv: (env) => {
    set({ env });
  },

  refreshDistros: async () => {
    try {
      const list = await invoke<WslDistro[]>("wsl_list_distros");
      const isAvailable = list.length > 0;
      set({ distros: list, isWslAvailable: isAvailable });

      // If currently on a WSL env but that distro no longer exists, switch to local
      const current = get().env;
      if (
        current.kind === "wsl" &&
        !list.some((d) => d.name === current.distro)
      ) {
        set({ env: LOCAL_DEFAULT });
      }

      return list;
    } catch {
      set({ distros: [], isWslAvailable: false });
      return [];
    }
  },
}));

export function currentWorkspaceEnv(): WorkspaceEnv {
  return useWorkspaceEnvStore.getState().env;
}

export function workspaceScopeKey(env: WorkspaceEnv): string {
  return env.kind === "wsl" ? `wsl:${env.distro}` : "local";
}

export function currentWorkspaceScopeKey(): string {
  return workspaceScopeKey(currentWorkspaceEnv());
}
