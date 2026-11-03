import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  extractSessionTokenFromCookieHeader,
} from "@/lib/auth/session";
import { generateKnowledgeEngineResponse } from "@/lib/assistant/knowledge-engine";
import type { AssistantContextState } from "@/lib/assistant/assistant-types";
import { DESTINATIONS } from "@/lib/destinations-data";
import {
  buildUnifiedTripContext,
  formatUnifiedContextForPrompt,
} from "@/lib/adaptive/unified-context";
import { formatGlobalContextForPrompt } from "@/lib/assistant/global-travel-context";

interface ChatRequestBody {
  messages: Array<{ sender: "user" | "assistant"; text: string }>;
  context?: AssistantContextState;
}

// In-memory rate limiting map: userId -> lastRequestTimestamp
const rateLimitMap = new Map<string, number>();
const MIN_REQUEST_INTERVAL_MS = 500; // Minimum 500ms between queries per user

export async function POST(req: Request) {
  try {
    // 1. Session Verification
    let token = extractSessionTokenFromCookieHeader(req.headers.get("cookie"));
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
      } catch {
        // Outside Next.js request context
      }
    }
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access the AI companion." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session. Please log in again." },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check
    const now = Date.now();
    const lastRequest = rateLimitMap.get(session.userId) || 0;
    if (now - lastRequest < MIN_REQUEST_INTERVAL_MS) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment before sending another query." },
        { status: 429 }
      );
    }
    rateLimitMap.set(session.userId, now);

    // 3. Payload Validation
    let body: ChatRequestBody;
    try {
      body = (await req.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { messages, context } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required." },
        { status: 400 }
      );
    }

    if (messages.length > 50) {
      return NextResponse.json(
        { success: false, error: "Conversation history exceeds maximum permitted length (50 messages)." },
        { status: 400 }
      );
    }

    const safeContext: AssistantContextState = context || {
      language: "en",
    };

    const latestUserMessage =
      [...messages].reverse().find((m) => m.sender === "user")?.text || "";

    if (!latestUserMessage || latestUserMessage.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Latest user message cannot be empty." },
        { status: 400 }
      );
    }

    if (latestUserMessage.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum allowed character length (2000 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // TIER 2: If GEMINI_API_KEY is configured on the server, call Gemini 1.5 Flash
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const destinationSummary = DESTINATIONS.map(
          (d) =>
            `- ${d.name} (${d.kannadaName}): ${d.region}, ${d.district} District. Category: ${d.categoryLabel}. Best Season: ${d.bestSeason}. Daily Budget: ${d.estimatedDailyBudget}. Highlights: ${d.highlights.join(", ")}. Transit: ${d.transitTip}.`
        ).join("\n");

        const isKn = safeContext.language === "kn";

        const tripBriefing = safeContext.globalContext
          ? formatGlobalContextForPrompt(safeContext.globalContext, safeContext.language || "en")
          : safeContext.unifiedContext
          ? formatUnifiedContextForPrompt(safeContext.unifiedContext, safeContext.language || "en")
          : safeContext.itinerary
          ? formatUnifiedContextForPrompt(
              buildUnifiedTripContext({
                itinerary: safeContext.itinerary,
                preferences: safeContext.plannerPrefs,
                routePlan: safeContext.routePlan,
                budgetPlan: safeContext.budgetPlan,
                groupState: safeContext.groupState,
                savedGemIds: safeContext.savedGemIds,
              }),
              safeContext.language || "en"
            )
          : "";

        const systemPrompt = `You are Yatrion AI, a premier AI travel assistant for the Indian state of Karnataka.
You are embedded in the Yatrion travel platform.

Ground your answers strictly in the following 11 verified Karnataka destinations:
${destinationSummary}
${tripBriefing ? `\nCURRENT USER TRIP INTELLIGENCE CONTEXT:\n${tripBriefing}\n` : ""}
CRITICAL ANTI-HALLUCINATION & SAFETY RULES:
1. Do NOT invent exact monument entry ticket prices, exact opening hours, real-time train/bus schedules, live hotel availability, or unverified live weather.
2. Citing Weather: Weather forecasts are provided via Open-Meteo under CC BY 4.0; clearly distinguish forecasts from confirmed observations.
3. Citing Disruptions: Verified disruption alerts come from Karnataka PWD / KSDMA. If none exist in context, state that no official closures are reported; never claim a route is safe solely based on absence of notices.
4. User Autonomy: You cannot directly alter the user's itinerary or approve replanning proposals. All itinerary changes must be confirmed by the user in the Replanning Review interface.
5. Label all travel times and budget ranges as planning estimates based on standard Karnataka transit corridors (NH 48, NH 66, NH 75).
6. If asked about a destination not in Yatrion's verified directory, state that fact honestly and redirect to nearby supported hubs.
7. Maintain a warm, cultured, respectful tone inspired by Karnataka's hospitality (Athithi Devo Bhava).
8. Language: ${
          isKn
            ? "Respond in natural, grammatically correct, authentic Kannada (ಕನ್ನಡ)."
            : "Respond in clear, editorial-grade English with authentic Kannada names in parentheses where helpful."
        }
9. Keep responses structured, concise, and easy to read on mobile devices with bullet points and bold headers.`;

        const contents = [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${latestUserMessage}` }],
          },
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText && typeof candidateText === "string") {
            // Also generate contextual action buttons from knowledge engine
            const fallbackActions = generateKnowledgeEngineResponse(
              latestUserMessage,
              safeContext
            ).actions;

            return NextResponse.json({
              text: candidateText.trim(),
              source: "cloud-gemini",
              sourceDescription: isKn
                ? "Google Gemini 1.5 Flash ಕ್ಲೌಡ್ AI ಮಾದರಿಯಿಂದ ರಚಿಸಲಾಗಿದೆ."
                : "Generated using Google Gemini 1.5 Flash via secure serverless API.",
              actions: fallbackActions,
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to Knowledge Engine:", geminiError);
      }
    }

    // TIER 3: Deterministic Grounded Knowledge Engine (Fallback)
    const knowledgeResponse = generateKnowledgeEngineResponse(
      latestUserMessage,
      safeContext
    );

    return NextResponse.json(knowledgeResponse);
  } catch (error) {
    console.error("API /api/chat error:", error);
    return NextResponse.json(
      {
        text:
          "An error occurred while processing your travel query. Please check your network and try again.",
        source: "knowledge-engine",
        sourceDescription: "Fallback response due to server error.",
        isError: true,
      },
      { status: 500 }
    );
  }
}
