import { useState } from "react";
import { useTheme } from "@/modules/theme/ThemeProvider";
import { GeneralSection } from "./sections/GeneralSection";
import { ModelsSection } from "./sections/ModelsSection";
import { AgentsSection } from "./sections/AgentsSection";
import { ShortcutsSection } from "./sections/ShortcutsSection";
import { ThemesSection } from "./sections/ThemesSection";
import { AboutSection } from "./sections/AboutSection";

const TABS = [
  { id: "general", label: "General" },
  { id: "models", label: "Models" },
  { id: "agents", label: "Agents" },
  { id: "shortcuts", label: "Shortcuts" },
  { id: "themes", label: "Themes" },
  { id: "about", label: "About" },
] as const;

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState("general");
  const { tokens } = useTheme();

  const content = {
    general: <GeneralSection />,
    models: <ModelsSection />,
    agents: <AgentsSection />,
    shortcuts: <ShortcutsSection />,
    themes: <ThemesSection />,
    about: <AboutSection />,
  }[activeTab];

  return (
    <div
      className="flex h-screen w-screen font-mono overflow-hidden"
      style={{ backgroundColor: tokens.background, color: tokens.foreground }}
    >
      {/* Sidebar */}
      <aside
        className="w-40 shrink-0 border-r flex flex-col py-2"
        style={{ borderColor: tokens.border }}
      >
        <div
          className="px-3 py-2 text-[10px] font-medium tracking-wide uppercase"
          style={{ color: tokens.mutedForeground }}
        >
          Settings
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="text-left px-2 py-1.5 text-[11px] rounded transition-colors"
              style={{
                backgroundColor:
                  activeTab === tab.id ? tokens.accent : "transparent",
                color:
                  activeTab === tab.id
                    ? tokens.foreground
                    : tokens.mutedForeground,
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {content}
      </main>
    </div>
  );
}
