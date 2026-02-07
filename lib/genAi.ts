import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function callLLM(prompt: string) {
  const res = await client.chat.completions.create({
    model: "llama-3.1-8b-instant", // fast + free
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  return res.choices[0].message.content!;
}
