import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePreferencesStore, type ProviderConfig } from "@/modules/settings/preferences";
import { useTheme } from "@/modules/theme/ThemeProvider";

const BUILTIN_PROVIDERS: Omit<ProviderConfig, "apiKey">[] = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", modelId: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", modelId: "claude-sonnet-4-6" },
  { id: "google", name: "Google", baseUrl: "https://generativelanguage.googleapis.com/v1beta", modelId: "gemini-2.5-flash" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", modelId: "llama-3.3-70b-versatile" },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", modelId: "anthropic/claude-sonnet-4-6" },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", modelId: "deepseek-chat" },
];

export function ModelsSection() {
  const { tokens } = useTheme();
  const { autocompleteProvider, setAutocompleteProvider } = usePreferencesStore();
  const [selectedProvider, setSelectedProvider] = useState<string>(autocompleteProvider?.id ?? "");
  const [apiKey, setApiKey] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    let config: ProviderConfig;

    if (selectedProvider === "custom") {
      config = {
        id: "custom",
        name: "Custom",
        baseUrl: customUrl,
        apiKey: apiKey || undefined,
        modelId: customModel,
      };
    } else {
      const builtIn = BUILTIN_PROVIDERS.find((p) => p.id === selectedProvider);
      if (!builtIn) return;
      config = {
        ...builtIn,
        apiKey: apiKey || undefined,
      };
    }

    // Store API key in OS keyring
    if (apiKey) {
      await invoke("secret_set", {
        keyName: `provider:${config.id}`,
        value: apiKey,
      });
    }

    setAutocompleteProvider(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-[14px] font-semibold" style={{ color: tokens.neonCyan }}>
        Models
      </h2>

      <p className="text-[11px]" style={{ color: tokens.mutedForeground }}>
        Configure your AI provider for inline editor autocomplete. Your API key is stored in your OS keyring.
      </p>

      {/* Provider selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
          Provider
        </label>
        <div className="flex flex-col gap-1">
          {BUILTIN_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className="flex items-center gap-2 px-3 py-2 text-[11px] rounded border transition-colors text-left"
              style={{
                borderColor: selectedProvider === provider.id ? tokens.neonCyan : tokens.border,
                backgroundColor: selectedProvider === provider.id ? `${tokens.neonCyan}10` : "transparent",
                color: tokens.foreground,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: selectedProvider === provider.id ? tokens.neonCyan : tokens.border,
                }}
              />
              <span>{provider.name}</span>
              <span className="ml-auto text-[10px] opacity-50">{provider.baseUrl}</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedProvider("custom")}
            className="flex items-center gap-2 px-3 py-2 text-[11px] rounded border transition-colors text-left"
            style={{
              borderColor: selectedProvider === "custom" ? tokens.neonCyan : tokens.border,
              backgroundColor: selectedProvider === "custom" ? `${tokens.neonCyan}10` : "transparent",
              color: tokens.foreground,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: selectedProvider === "custom" ? tokens.neonCyan : tokens.border,
              }}
            />
            <span>OpenAI-compatible (custom)</span>
          </button>
        </div>
      </div>

      {/* API Key */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-... (leave empty for local models)"
          className="w-full h-8 px-3 text-[11px] rounded border bg-transparent font-mono"
          style={{ borderColor: tokens.border, color: tokens.foreground }}
        />
        <span className="text-[10px]" style={{ color: tokens.mutedForeground }}>
          Stored in OS keyring. Never written to disk.
        </span>
      </div>

      {/* Custom URL / Model */}
      {selectedProvider === "custom" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
              Base URL
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://localhost:1234/v1"
              className="w-full h-8 px-3 text-[11px] rounded border bg-transparent font-mono"
              style={{ borderColor: tokens.border, color: tokens.foreground }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px]" style={{ color: tokens.mutedForeground }}>
              Model ID
            </label>
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="e.g. qwen2.5-coder-7b-instruct"
              className="w-full h-8 px-3 text-[11px] rounded border bg-transparent font-mono"
              style={{ borderColor: tokens.border, color: tokens.foreground }}
            />
          </div>
        </>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-[11px] rounded transition-colors"
          style={{
            backgroundColor: tokens.neonCyan,
            color: tokens.background,
          }}
        >
          Save
        </button>
        {saved && (
          <span className="text-[11px]" style={{ color: tokens.neonGreen }}>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
