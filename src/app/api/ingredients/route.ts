import { NextResponse } from "next/server";

import { getGeminiModel, withRetry } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Please describe the food first." },
        { status: 400 }
      );
    }

    const prompt = `You are a culinary assistant. From the following description, identify the food ingredients used and present them as a concise bulleted list. If a specific dish is named, mention it in one short sentence first.\n\nDescription:\n"""${text}"""`;

    const model = getGeminiModel();
    const result = await withRetry(() => model.generateContent(prompt));

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
