import { NextResponse } from "next/server";

import { GEMINI_IMAGE_MODEL, getApiKey, withRetry } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

type InlineData = { mimeType?: string; mime_type?: string; data: string };
type Part = { inlineData?: InlineData; inline_data?: InlineData };

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Please describe the image you want." },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

    const image = await withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }

      const parts: Part[] = data?.candidates?.[0]?.content?.parts ?? [];
      const inline = parts
        .map((p) => p.inlineData ?? p.inline_data)
        .find(Boolean);

      if (!inline?.data) {
        throw new Error("The model did not return an image. Try a different prompt.");
      }

      const mime = inline.mimeType ?? inline.mime_type ?? "image/png";
      return `data:${mime};base64,${inline.data}`;
    });

    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: `Image generation failed: ${(error as Error).message}` },
      { status: 502 }
    );
  }
}
