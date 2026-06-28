"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatGreeting } from "@/lib/mock";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: chatGreeting },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, sending]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: nextId.current++, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", text: data.text },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: `Sorry, something went wrong: ${(e as Error).message}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-6 flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="size-5" strokeWidth={2} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 flex h-[472px] w-[380px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Chat assistant
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setOpen(false)}
              aria-label="Close chat assistant"
            >
              <X />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          >
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div
                  key={message.id}
                  className="max-w-[80%] self-start whitespace-pre-line rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  {message.text}
                </div>
              ) : (
                <div
                  key={message.id}
                  className="max-w-[80%] self-end whitespace-pre-line rounded-lg bg-muted px-4 py-2 text-sm text-foreground"
                >
                  {message.text}
                </div>
              )
            )}
            {sending && (
              <div className="max-w-[80%] self-start rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary-foreground/70" />
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              size="icon"
              className="size-10 shrink-0"
              onClick={send}
              disabled={!draft.trim() || sending}
              aria-label="Send message"
            >
              <Send />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
