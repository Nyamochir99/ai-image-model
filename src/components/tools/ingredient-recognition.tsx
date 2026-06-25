"use client";

import { useState } from "react";
import { FileText, RotateCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultSection, type ResultState } from "./result-section";

export function IngredientRecognition() {
  const [text, setText] = useState("");
  const [state, setState] = useState<ResultState>("empty");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (!text.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setResult(data.text);
      setState("result");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
    }
  }

  function reset() {
    setText("");
    setResult("");
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
              Ingredient recognition
            </h2>
          </div>
          <Button size="icon" className="size-10" onClick={reset}>
            <RotateCw />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Describe the food, and AI will detect the ingredients.
        </p>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your dish..."
          className="min-h-[124px] resize-none"
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
        icon={FileText}
        title="Identified Ingredients"
        state={state}
        emptyText="First, enter your text to recognize an ingredients."
        loadingText="Working on your text just wait for moment"
        errorMessage={error}
      >
        <p className="whitespace-pre-line text-sm text-foreground">{result}</p>
      </ResultSection>
    </div>
  );
}
