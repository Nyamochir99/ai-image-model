"use client";

import { useRef, useState } from "react";
import { FileText, RotateCw, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResultSection, type ResultState } from "./ResultSection";

export function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<ResultState>("empty");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    setState("empty");
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setState("empty");
  }

  async function generate() {
    if (!file) return;
    setState("loading");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: form,
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
    clearImage();
    setResult("");
    setError("");
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-foreground" strokeWidth={1.75} />
            <h2 className="text-xl font-semibold text-foreground">
              Image analysis
            </h2>
          </div>
          <Button size="icon" className="size-10" onClick={reset}>
            <RotateCw />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Upload a food photo, and AI will detect the ingredients.
        </p>

        {preview ? (
          <div className="relative w-fit rounded-lg border border-border p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded food"
              className="h-[133px] w-[200px] rounded-md object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove image"
              className="absolute bottom-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:bg-accent"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <label className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-accent">
            <span className="font-medium text-foreground">Choose File</span>
            <span className="text-muted-foreground">JPG , PNG</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        )}

        <div className="flex justify-end">
          <Button disabled={!file || state === "loading"} onClick={generate}>
            Generate
          </Button>
        </div>
      </div>

      <ResultSection
        icon={FileText}
        title="Here is the summary"
        state={state}
        emptyText="First, enter your image to recognize an ingredients."
        errorMessage={error}
      >
        <p className="whitespace-pre-line text-sm text-foreground">{result}</p>
      </ResultSection>
    </div>
  );
}
