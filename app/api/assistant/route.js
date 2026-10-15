import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Calls Google Gemini on the server so GEMINI_API_KEY never reaches the browser.
// Falls back to the lighter model when the first one is busy or over its free quota.
const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
const MAX_CONTEXT = 200_000;
const MAX_QUESTION = 4_000;

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set on the server." }, { status: 500 });
  }

  // Only signed-in users may spend the Gemini quota.
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: auth } = token ? await supabase.auth.getUser(token) : { data: null };
  if (!auth?.user) {
    return NextResponse.json({ error: "Please sign in to use the assistant." }, { status: 401 });
  }

  const { systemPrompt, question } = await req.json().catch(() => ({}));
  if (typeof question !== "string" || !question.trim() || question.length > MAX_QUESTION) {
    return NextResponse.json({ error: "Ask a question of up to 4,000 characters." }, { status: 400 });
  }
  if (typeof systemPrompt !== "string" || systemPrompt.length > MAX_CONTEXT) {
    return NextResponse.json({ error: "Inventory context is missing or too large." }, { status: 400 });
  }

  let lastError = "No model answered.";
  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const answer = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
      return NextResponse.json({ answer: answer || "No response received." });
    }
    lastError = data.error?.message || `Gemini returned ${res.status}`;
    if (res.status !== 429 && res.status < 500) break; // a bad request won't succeed on the other model
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
