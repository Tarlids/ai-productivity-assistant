import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AppShell, ErrorNote } from "@/components/AppShell";
import { chatReply } from "@/lib/ai.functions";
import type { ChatTurn } from "@/lib/ai-types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant Chat — Standup" },
      {
        name: "description",
        content:
          "Interactive AI assistant for workplace questions: drafting, prioritising, planning and thinking through problems.",
      },
      { property: "og:title", content: "AI Workplace Assistant Chat — Standup" },
      {
        property: "og:description",
        content: "Chat with an AI assistant built for everyday work tasks.",
      },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Help me say no to a meeting without sounding rude",
  "What should I prioritise when everything is urgent?",
  "Rewrite this to sound less defensive: ...",
  "Give me an agenda for a 30-minute project kickoff",
];

function ChatPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const run = useServerFn(chatReply);
  const mutation = useMutation<string, Error, ChatTurn[]>({
    mutationFn: (history) => run({ data: { messages: history } }),
    onSuccess: (reply) => setMessages((m) => [...m, { role: "assistant", content: reply }]),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const history: ChatTurn[] = [...messages, { role: "user", content: trimmed }];
    setMessages(history);
    setInput("");
    mutation.mutate(history);
  }

  return (
    <AppShell
      title="AI Workplace Assistant"
      subtitle="Ask anything about your work — drafting, prioritising, difficult conversations, meeting prep. It keeps the thread in context."
    >
      <div className="panel flex h-[65vh] min-h-96 flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-8 text-center">
              <p className="label-mono">Start a conversation</p>
              <div className="mt-4 grid gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <ErrorNote message={mutation.error?.message} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant…"
              className="flex-1 rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || mutation.isPending}
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundImage: "var(--gradient-signal)" }}
            >
              Send
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="text-foreground">Responsible AI:</span> this assistant can be wrong and
            has no access to your email, files or calendar. Nothing is stored — refreshing clears the
            chat.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
