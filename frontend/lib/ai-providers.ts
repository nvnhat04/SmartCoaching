export type AIProvider = "gemini" | "groq";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

/**
 * Groq API - FREE, rất nhanh với Llama models
 * Sign up: https://console.groq.com/
 * Free tier: 14,400 requests/day
 */
async function callGroqAPI(
  messages: ChatMessage[],
  apiKey: string,
  model: string = "llama-3.1-70b-versatile"
): Promise<AIResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || "Groq API error");
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || "No response",
  };
}

/**
 * Gemini API
 */
async function callGeminiAPI(
  messages: ChatMessage[],
  apiKey: string,
  model: string = "gemini-1.5-flash"
): Promise<AIResponse> {
  // Gemini không hỗ trợ "system" role, cần chuyển system message thành user message đầu tiên
  const contents: any[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    // Nếu là system message, chuyển thành user message
    if (msg.role === "system") {
      contents.push({
        role: "user",
        parts: [{ text: msg.content }],
      });
      // Thêm một model response giả để tạo context
      if (i === 0) {
        contents.push({
          role: "model",
          parts: [{ text: "Đã hiểu. Tôi sẽ giúp bạn với tư vấn fitness và dinh dưỡng." }],
        });
      }
    } else {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Tăng lên để có thể trả về kế hoạch dài
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    console.error("Gemini API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(errorData.error?.message || "Gemini API error");
  }

  const data = await response.json();
  
  // Debug logging
  console.log("Gemini API Response:", JSON.stringify(data, null, 2));
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    console.error("Gemini API: No text in response", data);
    throw new Error("Gemini API returned empty response");
  }
  
  return {
    content: text,
  };
}

/**
 * Main function to call AI provider
 */
export async function callAIProvider(
  messages: ChatMessage[],
  config: AIProviderConfig
): Promise<AIResponse> {
  const { provider, apiKey, model } = config;

  if (!apiKey) {
    throw new Error(`${provider} API key not configured`);
  }

  try {
    switch (provider) {
      case "groq":
        return await callGroqAPI(
          messages,
          apiKey,
          model || process.env.AI_MODEL || "llama-3.1-70b-versatile"
        );
      case "gemini":
        return await callGeminiAPI(
          messages,
          apiKey,
          model || process.env.AI_MODEL || "gemini-1.5-flash"
        );
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error: any) {
    return {
      content: "",
      error: error.message || "AI provider error",
    };
  }
}

/**
 * Get default provider from environment
 */
export function getDefaultProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase() as AIProvider;
  return provider === "gemini" ? "gemini" : "groq";
}

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: AIProvider): string {
  if (provider === "gemini") {
    return process.env.AI_MODEL || "gemini-1.5-flash";
  }
  return process.env.AI_MODEL || "llama-3.1-70b-versatile";
}

