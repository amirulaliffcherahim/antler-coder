import { useEffect, useState } from "react";

import { useWorkspaceEnvStore } from "../env";

export default function WorkspacePicker() {

  const { env, distros, isWslAvailable, setEnv, refreshDistros } =
    useWorkspaceEnvStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void refreshDistros();
  }, [refreshDistros]);

  const handleSelectLocal = () => {
    setEnv({ kind: "local", rootPath: "/home/aleph" });
    setOpen(false);
  };

  const handleSelectWsl = (distro: string) => {
    setEnv({ kind: "wsl", distro, rootPath: "/home/aleph" });
    setOpen(false);
  };

  const label =
    env.kind === "local"
      ? "Local"
      : `WSL: ${env.distro}`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded transition-colors bg-muted text-muted-foreground border border-border"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${env.kind === "local" ? "bg-neon-cyan" : "bg-neon-green"}`}
        />
        <span>{label}</span>
        <span className="opacity-50">▾</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[70]"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-full left-0 mt-1 w-48 rounded border border-border shadow-xl z-[80] overflow-hidden bg-card animate-fade-in"
          >
            <div
              className="px-2 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Workspace
            </div>

            {/* Local */}
            <button
              onClick={handleSelectLocal}
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-[11px] transition-colors text-foreground ${env.kind === "local" ? "bg-accent" : ""}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
              />
              <span>Local filesystem</span>
            </button>

            {/* WSL */}
            {isWslAvailable && distros.length > 0 && (
              <>
                <div
                  className="mx-2 my-1 h-px bg-border"
                />
                <div
                  className="px-2 py-1 text-[10px] text-muted-foreground"
                >
                  WSL distros
                </div>
                {distros.map((distro) => (
                  <button
                    key={distro.name}
                    onClick={() => handleSelectWsl(distro.name)}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 text-[11px] transition-colors text-foreground ${env.kind === "wsl" && env.distro === distro.name ? "bg-accent" : ""}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${distro.running ? "bg-neon-green" : "bg-muted-foreground"}`}
                    />
                    <span>{distro.name}</span>
                    {distro.default && (
                      <span
                        className="ml-auto text-[9px] px-1 rounded bg-muted text-muted-foreground"
                      >
                        default
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}

            {!isWslAvailable && (
              <div
                className="px-2 py-2 text-[10px] text-muted-foreground"
              >
                WSL not available on this platform.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
