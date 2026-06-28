import { NextResponse } from "next/server";

import { generateContent } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT = `You are a food image analyst. Look at this image and provide a breakdown of the food items and ingredients you can see. Group them by category (e.g. Vegetables, Proteins, Fruits, Grains/Seeds, Snacks) as a bulleted list, then add one short summary sentence at the end.`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image first." },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

    const result = await generateContent([
      { text: PROMPT },
      { inlineData: { data: base64, mimeType: file.type || "image/jpeg" } },
    ]);

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json(
      { error: `Image analysis failed: ${(error as Error).message}` },
      { status: 502 }
    );
  }
}
