import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export type SettingsTab =
  | "general"
  | "models"
  | "agents"
  | "shortcuts"
  | "themes"
  | "about";

export async function openSettingsWindow(initialTab: SettingsTab = "general") {
  const existing = await WebviewWindow.getByLabel("settings");
  if (existing) {
    await existing.setFocus();
    return;
  }

  const win = new WebviewWindow("settings", {
    url: `/settings.html?tab=${initialTab}`,
    title: "Settings",
    width: 720,
    height: 560,
    resizable: true,
    center: true,
  });

  win.once("tauri://created", () => {
    console.log("Settings window created");
  });
  win.once("tauri://error", (e) => {
    console.error("Failed to create settings window:", e);
  });
}
