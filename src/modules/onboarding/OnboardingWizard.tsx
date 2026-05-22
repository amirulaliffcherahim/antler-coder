import { useState, useEffect } from "react";

import { useWorkspaceEnvStore } from "@/modules/workspace";
import { useAgentDiscovery } from "@/modules/agent-shell";

interface OnboardingWizardProps {
  onComplete: () => void;
}

type Step = "welcome" | "workspace" | "agents" | "done";

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {

  const { env: workspaceEnv, setEnv } = useWorkspaceEnvStore();
  const { discover, isDiscovering, discovered } = useAgentDiscovery(workspaceEnv);
  const [step, setStep] = useState<Step>("welcome");
  const [workspacePath, setWorkspacePath] = useState("/home/aleph/projects");

  useEffect(() => {
    if (step === "agents" && discovered.length === 0 && !isDiscovering) {
      discover();
    }
  }, [step, discovered.length, isDiscovering, discover]);

  const handleWorkspaceConfirm = () => {
    setEnv({ kind: "local", rootPath: workspacePath });
    setStep("agents");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-fade-in"
    >
      <div className="w-[32rem] flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-[28px] font-bold text-neon-cyan">
            ANTLER CODER
          </div>
          <div className="text-[11px] text-muted-foreground">
            Universal Agent Shell
          </div>
        </div>

        {/* Step content */}
        <div
          className="rounded border border-border p-6 space-y-4 bg-card animate-slide-up"
        >
          {step === "welcome" && (
            <>
              <h2 className="text-[14px] font-semibold text-foreground">
                Welcome
              </h2>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Antler Coder is a developer environment for hosting external AI agents.
                Bring your own agent (Claude, Gemini, Aider, etc.) and your own API key.
              </p>
              <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
                <div>• Space+e — Explorer</div>
                <div>• Space+t — Terminal</div>
                <div>• Space+a — Agent popup</div>
                <div>• Space+, — Settings</div>
              </div>
              <button
                onClick={() => setStep("workspace")}
                className="w-full py-1.5 text-[11px] rounded transition-colors bg-neon-cyan text-background"
              >
                Get started
              </button>
            </>
          )}

          {step === "workspace" && (
            <>
              <h2 className="text-[14px] font-semibold text-foreground">
                Choose workspace
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Set your default project directory.
              </p>
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                className="w-full h-8 px-3 text-[11px] rounded border border-border bg-transparent font-mono text-foreground"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleWorkspaceConfirm}
                  className="flex-1 py-1.5 text-[11px] rounded transition-colors bg-neon-cyan text-background"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "agents" && (
            <>
              <h2 className="text-[14px] font-semibold text-foreground">
                Scan for agents
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Looking for installed CLI agents on your system…
              </p>

              {isDiscovering ? (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="animate-pulse">Scanning PATH…</span>
                </div>
              ) : discovered.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {discovered.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 px-2 py-1 text-[11px] rounded bg-muted"
                    >
                      <span className="text-neon-green">✓</span>
                      <span className="text-foreground">{agent.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {agent.path}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground">
                  No agents found. You can add them later in Settings → Agents.
                </div>
              )}

              <button
                onClick={() => setStep("done")}
                disabled={isDiscovering}
                className="w-full py-1.5 text-[11px] rounded transition-colors bg-neon-cyan text-background"
                style={{ opacity: isDiscovering ? 0.5 : 1 }}
              >
                Continue
              </button>
            </>
          )}

          {step === "done" && (
            <>
              <h2 className="text-[14px] font-semibold text-foreground">
                You&apos;re all set
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Workspace configured, agents scanned. Ready to code.
              </p>
              <div className="text-[10px] space-y-1 text-muted-foreground">
                <div>Space+a to open your agent</div>
                <div>Space+, to configure models and keys</div>
              </div>
              <button
                onClick={onComplete}
                className="w-full py-1.5 text-[11px] rounded transition-colors bg-neon-cyan text-background"
              >
                Start coding
              </button>
            </>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {(["welcome", "workspace", "agents", "done"] as Step[]).map((s) => (
            <span
              key={s}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${step === s ? "bg-neon-cyan" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
