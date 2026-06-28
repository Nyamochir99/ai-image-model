import { NextResponse } from "next/server";

import { FLUX_IMAGE_MODEL, withRetry } from "@/lib/huggingface";

export const runtime = "nodejs";
export const maxDuration = 60;

const HF_IMAGE_URL = "https://router.huggingface.co/nscale/v1/images/generations";

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Please describe the image you want." },
        { status: 400 }
      );
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "HF_TOKEN is not set. Add it to .env." },
        { status: 500 }
      );
    }

    const image = await withRetry(async () => {
      const res = await fetch(HF_IMAGE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response_format: "b64_json",
          prompt,
          model: FLUX_IMAGE_MODEL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.error || `HTTP ${res.status}`);
      }

      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("The model did not return an image. Try a different prompt.");
      }

      return `data:image/png;base64,${b64}`;
    });

    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: `Image generation failed: ${(error as Error).message}` },
      { status: 502 }
    );
  }
}
