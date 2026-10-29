import { buildItineraryPrompt, buildRecommendationPrompt, renderPromptText } from "./prompts.js";

export async function maybeGenerateWithLlm(kind, payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt =
    kind === "recommend"
      ? buildRecommendationPrompt(payload.preferences)
      : buildItineraryPrompt(payload);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.instructions },
        { role: "user", content: renderPromptText(prompt) }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content);
}
