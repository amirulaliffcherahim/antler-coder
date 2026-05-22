import { useTheme } from "@/modules/theme/ThemeProvider";

export function AgentsSection() {
  const { tokens } = useTheme();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        Agents
      </h2>
      <p className="text-[11px]" style={{ color: tokens.mutedForeground }}>
        Agent configuration will be available in Phase 4 (BYOA Agent Shell).
      </p>
      <div
        className="rounded border p-4 text-[11px]"
        style={{ borderColor: tokens.border, color: tokens.mutedForeground }}
      >
        Auto-detected agents and custom agent configuration will appear here.
      </div>
    </div>
  );
}
