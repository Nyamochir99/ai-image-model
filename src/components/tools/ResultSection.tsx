"use client";

import { Loader2, type LucideIcon } from "lucide-react";

export type ResultState = "empty" | "loading" | "result" | "error";

type ResultSectionProps = {
  icon: LucideIcon;
  title: string;
  state: ResultState;
  emptyText: string;
  loadingText?: string;
  errorMessage?: string;
  /** When true, the result content is wrapped in a bordered card. */
  bordered?: boolean;
  children?: React.ReactNode;
};

export function ResultSection({
  icon: Icon,
  title,
  state,
  emptyText,
  loadingText = "Working on your image just wait for moment",
  errorMessage,
  bordered = true,
  children,
}: ResultSectionProps) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="size-6 text-foreground" strokeWidth={1.75} />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      {state === "empty" && (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}

      {state === "loading" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{loadingText}</p>
          <div className="flex justify-center py-2">
            <Loader2 className="size-6 animate-spin text-foreground" />
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {errorMessage ?? "Something went wrong. Please try again."}
        </div>
      )}

      {state === "result" &&
        (bordered ? (
          <div className="flex-1 overflow-y-auto rounded-lg border border-border p-4">
            {children}
          </div>
        ) : (
          children
        ))}
    </div>
  );
}
