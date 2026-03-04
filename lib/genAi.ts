import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function callLLM(prompt: string) {
  const res = await client.chat.completions.create({
    model: "llama-3.1-8b-instant", // fast + free
    messages: [
      { role: "system", content: "You extract structured financial data." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const structured = JSON.parse(res.choices[0].message.content!);

  return structured;
}
