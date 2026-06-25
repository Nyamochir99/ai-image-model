import { AiTools } from "@/components/ai-tools";
import { ChatAssistant } from "@/components/chat-assistant";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center border-b border-border bg-background px-12 py-4">
        <h1 className="text-base font-semibold text-foreground">AI tools</h1>
      </header>

      <main className="flex flex-1 justify-center px-6 py-6">
        <div className="w-full max-w-[580px]">
          <AiTools />
        </div>
      </main>

      <ChatAssistant />
    </div>
  );
}
