import type {
  AssistantContextState,
  AssistantMessage,
  AssistantResponse,
} from "./assistant-types";
import { generateKnowledgeEngineResponse } from "./knowledge-engine";
import { classifyTravelIntent, handleIntentWithContext } from "./intent-engine";

// Chrome Built-in Prompt API Type Declarations
interface ChromeLanguageModel {
  capabilities?: () => Promise<{ available: "no" | "readily" | "after-download" }>;
  availability?: () => Promise<"no" | "readily" | "after-download">;
  create?: (options?: { systemPrompt?: string }) => Promise<{
    prompt: (input: string) => Promise<string>;
    destroy?: () => void;
  }>;
}

interface WindowWithAI extends Window {
  ai?: {
    languageModel?: ChromeLanguageModel;
  };
}

/**
 * Dispatches a travel prompt through the 3-Tier Adaptive Architecture:
 * 1. Chrome Built-in AI (Gemini Nano on device)
 * 2. Next.js Serverless Route Handler (/api/chat)
 * 3. Grounded Offline Knowledge Engine (Deterministic Fallback)
 */
export async function sendAssistantQuery(
  userQuery: string,
  history: AssistantMessage[],
  context: AssistantContextState
): Promise<AssistantResponse> {
  const isKn = context.language === "kn";

  // ── TIER 1: Chrome Built-in Prompt API (Gemini Nano On-Device) ──
  if (typeof window !== "undefined") {
    const win = window as unknown as WindowWithAI;
    if (win.ai?.languageModel?.create) {
      try {
        let isAvailable = false;
        if (typeof win.ai.languageModel.capabilities === "function") {
          const caps = await win.ai.languageModel.capabilities();
          isAvailable = caps.available === "readily";
        } else if (typeof win.ai.languageModel.availability === "function") {
          const avail = await win.ai.languageModel.availability();
          isAvailable = avail === "readily";
        }

        if (isAvailable) {
          const systemPrompt = `You are Yatrion AI, a premier Karnataka travel companion.
Answer travel queries grounded in Karnataka, India.
Language: ${isKn ? "Respond in natural Kannada" : "Respond in English"}.
Never invent ticket prices, real-time bus/train schedules, or live hotel availability.
Keep responses concise, formatted with bullet points and bold titles.`;

          const session = await win.ai.languageModel.create({ systemPrompt });
          const onDeviceResponse = await session.prompt(userQuery);

          if (session.destroy) {
            session.destroy();
          }

          if (onDeviceResponse && onDeviceResponse.trim().length > 0) {
            // Contextual actions from knowledge engine
            const actions = generateKnowledgeEngineResponse(userQuery, context).actions;

            return {
              text: onDeviceResponse.trim(),
              source: "chrome-builtin",
              sourceDescription: isKn
                ? "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿರುವ Chrome Built-in AI (Gemini Nano) ಮೂಲಕ ನೇರವಾಗಿ ರಚಿಸಲಾಗಿದೆ."
                : "Generated directly on your device via Chrome Built-in AI (Gemini Nano).",
              actions,
            };
          }
        }
      } catch (err) {
        console.warn("Chrome Built-in AI probe failed, falling back to server route:", err);
      }
    }
  }

  // ── TIER 2: Serverless Route Handler (/api/chat) ──
  try {
    const messagesPayload = history.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));
    messagesPayload.push({ sender: "user", text: userQuery });

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messagesPayload,
        context,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as AssistantResponse;
      if (data.text) {
        return data;
      }
    }
  } catch (err) {
    console.warn("/api/chat fetch failed (offline or network error), using client knowledge engine:", err);
  }

  // ── TIER 3: Deterministic Grounded Knowledge & Intent Engine (Offline Fallback) ──
  if (context.globalContext) {
    const classification = classifyTravelIntent(userQuery, context.globalContext);
    const intentResponse = handleIntentWithContext(classification, userQuery, context.globalContext);
    if (intentResponse && intentResponse.text && !intentResponse.text.includes("Yatrion is Karnataka's verified secular") && !intentResponse.text.includes("ಯಾತ್ರಿಯಾನ್ ಕರ್ನಾಟಕದ 31")) {
      return intentResponse;
    }
  }

  return generateKnowledgeEngineResponse(userQuery, context);
}

