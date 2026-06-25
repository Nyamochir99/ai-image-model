import { NextResponse } from "next/server";

import { getGeminiModel, withRetry } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessage = { role: "assistant" | "user"; text: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages?: IncomingMessage[] };

    const contents = (messages ?? [])
      .filter((m) => m.text?.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

    // Gemini requires the conversation to start with a user turn.
    while (contents.length && contents[0].role === "model") contents.shift();

    if (!contents.length) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const model = getGeminiModel();
    const result = await withRetry(() => model.generateContent({ contents }));

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
