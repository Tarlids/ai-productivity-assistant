import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { analyzeMeeting, type MeetingResult } from "@/lib/meetings.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Standup — Meeting notes into action items" },
      {
        name: "description",
        content:
          "Paste raw meeting notes and get a clean summary, decisions, owners, due dates and a ready-to-send recap email.",
      },
      { property: "og:title", content: "Standup — Meeting notes into action items" },
      {
        property: "og:description",
        content:
          "AI workplace assistant that converts messy notes into an execution-ready brief with owners and deadlines.",
      },
    ],
  }),
  component: Index,
});

const SAMPLE = `Weekly ops sync — Thabo, Naledi, Sam, Priya (Sam joined late)
- Q3 onboarding revamp is slipping, mostly because the design handoff never happened. Naledi says she can get Figma files over by next Wednesday.
- Churn spiked 2.1% last month, Priya thinks it's the billing email bug. Nobody has confirmed root cause yet.
- We agreed to freeze new feature work until the billing bug is closed.
- Sam to talk to legal about the new DPA wording, ideally before month end.
- Someone needs to update the customer comms template — unclear who owns this.
- Budget: we're 8% under, Thabo will decide whether to spend it on contractor support. Decision by Friday.`;

const TONES = ["Neutral & professional", "Warm & collaborative", "Direct & concise"];

function priorityClass(p: string) {
  const v = p.toLowerCase();
  if (v.startsWith("h")) return "bg-destructive/15 text-destructive border-destructive/30";
  if (v.startsWith("m")) return "bg-warning/15 text-warning border-warning/30";
  return "bg-accent/15 text-accent border-accent/30";
}

function Index() {
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [copied, setCopied] = useState(false);

  const run = useServerFn(analyzeMeeting);
  const mutation = useMutation<MeetingResult, Error>({
    mutationFn: () => run({ data: { notes, meetingDate, tone } }),
  });

  const result = mutation.data;
  const wordCount = useMemo(() => notes.trim().split(/\s+/).filter(Boolean).length, [notes]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="label-mono">AI workplace assistant</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            Standup<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Paste raw meeting notes. Get a summary, the decisions taken, action items with owners
            and dates, plus a recap email you can send.
          </p>
        </div>
        <div className="label-mono rounded-full border border-border px-3 py-1.5">
          Powered by Lovable AI
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Input */}
        <section className="panel h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="label-mono">Raw notes</h2>
            <button
              type="button"
              onClick={() => setNotes(SAMPLE)}
              className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
            >
              Load example
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste bullet points, transcript fragments, half-sentences — messy is fine."
            className="mt-3 h-72 w-full resize-y rounded-lg border border-input bg-background/60 p-4 font-mono text-sm leading-relaxed text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label-mono">Meeting date</span>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </label>
            <label className="block">
              <span className="label-mono">Recap email tone</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{wordCount} words</span>
            <button
              type="button"
              disabled={!notes.trim() || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundImage: "var(--gradient-signal)" }}
            >
              {mutation.isPending ? "Analysing…" : "Extract actions"}
            </button>
          </div>

          {mutation.isError && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}

          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <span className="text-foreground">Responsible AI:</span> output is drawn only from your
            notes — nothing is invented. Unclear owners become “Unassigned” and gaps are surfaced
            under Needs human confirmation. Always review before sending.
          </p>
        </section>

        {/* Output */}
        <section className="space-y-5">
          {!result && !mutation.isPending && (
            <div className="panel flex h-full min-h-72 flex-col items-center justify-center p-10 text-center">
              <p className="label-mono">Awaiting input</p>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Your structured brief will appear here: summary, decisions, risks, action items and
                a draft recap email.
              </p>
            </div>
          )}

          {mutation.isPending && (
            <div className="panel space-y-3 p-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-secondary"
                  style={{ width: `${90 - i * 9}%` }}
                />
              ))}
            </div>
          )}

          {result && (
            <>
              <div className="panel p-6">
                <p className="label-mono">Summary</p>
                <h2 className="mt-2 text-2xl font-semibold">{result.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {result.summary}
                </p>
              </div>

              <div className="panel p-6">
                <p className="label-mono">Action items</p>
                <ul className="mt-3 divide-y divide-border">
                  {result.actionItems.map((a, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-3 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityClass(a.priority)}`}
                      >
                        {a.priority}
                      </span>
                      <span className="min-w-40 flex-1 text-sm">{a.task}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.owner} · {a.due}
                      </span>
                    </li>
                  ))}
                  {result.actionItems.length === 0 && (
                    <li className="py-3 text-sm text-muted-foreground">
                      No action items found in these notes.
                    </li>
                  )}
                </ul>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="panel p-6">
                  <p className="label-mono">Decisions</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                    {result.decisions.length === 0 && (
                      <li className="text-muted-foreground">None recorded.</li>
                    )}
                  </ul>
                </div>
                <div className="panel p-6">
                  <p className="label-mono">Risks</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.risks.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-warning">!</span>
                        <span>{r}</span>
                      </li>
                    ))}
                    {result.risks.length === 0 && (
                      <li className="text-muted-foreground">None flagged.</li>
                    )}
                  </ul>
                </div>
              </div>

              {result.openQuestions.length > 0 && (
                <div className="panel border-accent/40 p-6">
                  <p className="label-mono text-accent">Needs human confirmation</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.openQuestions.map((q, i) => (
                      <li key={i}>— {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="panel p-6">
                <div className="flex items-center justify-between">
                  <p className="label-mono">Draft recap email</p>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(result.followUpEmail);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                    className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                  {result.followUpEmail}
                </pre>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
