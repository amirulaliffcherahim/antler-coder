import { invoke } from "@tauri-apps/api/core";
import type { ProviderConfig } from "../settings/preferences";

/**
 * Request an inline completion from the configured AI provider.
 * Uses OpenAI-compatible chat completions endpoint.
 */
export async function fetchInlineCompletion(
  context: { prefix: string; suffix: string; language: string },
  provider: ProviderConfig,
): Promise<string | null> {
  const apiKey =
    provider.apiKey ??
    (await invoke<string | null>("secret_get", { keyName: `provider:${provider.id}` }));

  if (!apiKey) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let body: unknown;

  if (provider.id === "anthropic") {
    // Anthropic Messages API
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model: provider.modelId,
      max_tokens: 64,
      system: "You are a code completion assistant. Complete the code at the cursor position. Output ONLY the completion text, no explanations.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Complete the code at <CURSOR> in this file:",
                "```" + context.language,
                context.prefix + "<CURSOR>" + context.suffix,
                "```",
                "Output only the completion text that replaces <CURSOR>.",
              ].join("\n"),
            },
          ],
        },
      ],
    };
  } else {
    // OpenAI-compatible chat completions
    headers["Authorization"] = `Bearer ${apiKey}`;

    // For FIM-capable providers, try the completions endpoint first
    if (provider.id === "deepseek") {
      // DeepSeek FIM endpoint
      body = {
        model: provider.modelId,
        prompt: context.prefix,
        suffix: context.suffix,
        max_tokens: 64,
        temperature: 0.2,
        stop: ["\n\n"],
      };

      const url = `${provider.baseUrl.replace(/\/+$/, "")}/completions`;
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) return null;
      const data = (await res.json()) as { choices: { text: string }[] };
      return data.choices?.[0]?.text?.trim() ?? null;
    }

    // Standard chat completions for most providers
    body = {
      model: provider.modelId,
      messages: [
        {
          role: "system",
          content: "You are a code completion engine. Complete the code at the cursor position. Output ONLY the completion text — no markdown, no backticks, no explanations.",
        },
        {
          role: "user",
          content: [
            "```" + context.language,
            context.prefix + "‖CURSOR_HERE‖" + context.suffix,
            "```",
            "Replace ‖CURSOR_HERE‖ with the completion. Output only the replacement text.",
          ].join("\n"),
        },
      ],
      max_tokens: 64,
      temperature: 0.2,
      stop: ["\n\n"],
    };
  }

  const url = `${provider.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices: { message?: { content: string }; text?: string }[];
    };
    const choice = data.choices?.[0];
    return (choice?.message?.content ?? choice?.text ?? "").trim() || null;
  } catch {
    return null;
  }
}
