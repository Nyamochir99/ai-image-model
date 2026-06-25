"use client";

import { useState } from "react";
import { ImageIcon, RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultSection, type ResultState } from "./result-section";

export function ImageCreator() {
  const [text, setText] = useState("");
  const [state, setState] = useState<ResultState>("empty");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (!text.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setImage(data.image);
      setState("result");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
    }
  }

  function reset() {
    setText("");
    setImage("");
    setError("");
    setState("empty");
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-foreground" strokeWidth={1.75} />
            <h2 className="text-xl font-semibold text-foreground">
              Food image creator
            </h2>
          </div>
          <Button size="icon" className="size-10" onClick={reset}>
            <RotateCw />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          What food image do you want? Describe it briefly.
        </p>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A delicious plate of spaghetti carbonara..."
          className="min-h-[130px] resize-none"
        />

        <div className="flex justify-end">
          <Button
            disabled={!text.trim() || state === "loading"}
            onClick={generate}
          >
            Generate
          </Button>
        </div>
      </div>

      <ResultSection
        icon={ImageIcon}
        title="Result"
        state={state}
        emptyText="First, enter your text to generate an image."
        errorMessage={error}
      >
        <p className="text-sm font-medium text-foreground">{text}</p>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={text}
            className="mt-2 size-[360px] max-w-full rounded-md object-cover"
          />
        )}
      </ResultSection>
    </div>
  );
}
