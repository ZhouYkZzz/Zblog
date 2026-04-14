export type QwenChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type QwenChatOptions = {
  messages: QwenChatMessage[];
  stream?: boolean;
  temperature?: number;
};

type QwenChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  output_text?: string;
};

export function getQwenConfig() {
  const apiKey = process.env.API_KEY || process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const model = process.env.QWEN_MODEL || "qwen3-max";

  return { apiKey, baseUrl, model };
}

export async function createQwenChatResponse({ messages, stream = false, temperature = 0.4 }: QwenChatOptions) {
  const { apiKey, baseUrl, model } = getQwenConfig();

  if (!apiKey) {
    throw new Error("未配置 API_KEY，无法调用通义千问 API。请先在 .env 中填写 API_KEY。");
  }

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream
    })
  });
}

export async function completeQwenText(messages: QwenChatMessage[], temperature = 0.2) {
  const response = await createQwenChatResponse({ messages, temperature });

  if (!response.ok) {
    throw new Error(`通义千问 API request failed: ${response.status}`);
  }

  const data = (await response.json()) as QwenChatCompletion;
  return data.choices?.[0]?.message?.content?.trim() || data.output_text?.trim() || "";
}
