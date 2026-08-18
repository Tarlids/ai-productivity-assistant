import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  AppShell,
  ErrorNote,
  Field,
  RunButton,
  Skeleton,
  inputClass,
  textareaClass,
} from "@/components/AppShell";
import { researchTopic } from "@/lib/ai.functions";
import type { ResearchResult } from "@/lib/ai-types";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Standup" },
      {
        name: "description",
        content:
          "Summarise an article or topic into key points, insights, recommendations and a list of claims to verify.",
      },
      { property: "og:title", content: "AI Research Assistant — Standup" },
      {
        property: "og:description",
        content: "Turn long articles or a bare topic into a decision-ready briefing note.",
      },
    ],
  }),
  component: ResearchPage,
});

const MODES = ["Summarise pasted text", "Explore a topic"];
const AUDIENCES = ["Executive / exec summary", "Team briefing", "Technical deep dive"];

const SAMPLE = `Topic: should a 40-person services company adopt a four-day work week?
Context: billable-hours business, clients in two time zones, high junior turnover.`;

function ResearchPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(MODES[1]);
  const [audience, setAudience] = useState(AUDIENCES[0]);

  const run = useServerFn(researchTopic);
  const mutation = useMutation<ResearchResult, Error>({
    mutationFn: () => run({ data: { input, mode, audience } }),
  });
  const result = mutation.data;

  const lists: Array<[string, string[] | undefined, string]> = [
    ["Key points", result?.keyPoints, "text-primary"],
    ["Insights", result?.insights, "text-accent"],
    ["Recommendations", result?.recommendations, "text-success"],
    ["Risks & counterpoints", result?.risks, "text-warning"],
  ];

  return (
    <AppShell
      title="AI Research Assistant"
      subtitle="Paste an article or name a topic. Get a briefing note with key points, insights, recommendations — and an explicit list of what to verify."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="panel h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="label-mono">Source or topic</h2>
            <button
              type="button"
              onClick={() => setInput(SAMPLE)}
              className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
            >
              Load example
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the article, report or notes — or just describe the question you need answered."
            className={`${textareaClass} h-64`}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Mode">
              <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
                {MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Audience">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className={inputClass}
              >
                {AUDIENCES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <RunButton
              pending={mutation.isPending}
              disabled={!input.trim()}
              onClick={() => mutation.mutate()}
              label="Build brief"
            />
          </div>

          <ErrorNote message={mutation.error?.message} />

          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <span className="text-foreground">Responsible AI:</span> no citations, URLs or statistics
            are fabricated. Anything that needs independent checking is listed under “Verify before
            use”.
          </p>
        </section>

        <section className="space-y-5">
          {!result && !mutation.isPending && (
            <div className="panel flex min-h-72 flex-col items-center justify-center p-10 text-center">
              <p className="label-mono">Awaiting input</p>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Your briefing note will appear here.
              </p>
            </div>
          )}

          {mutation.isPending && <Skeleton />}

          {result && (
            <>
              <div className="panel p-6">
                <p className="label-mono">Summary</p>
                <h2 className="mt-2 text-xl font-semibold">{result.topic}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {result.summary}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {lists.map(([label, items, color]) => (
                  <div key={label} className="panel p-6">
                    <p className={`label-mono ${color}`}>{label}</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {items?.length ? (
                        items.map((x, i) => <li key={i}>— {x}</li>)
                      ) : (
                        <li>None.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              {result.verifyBeforeUse?.length > 0 && (
                <div className="panel border-accent/40 p-6">
                  <p className="label-mono text-accent">Verify before use</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.verifyBeforeUse.map((v, i) => (
                      <li key={i}>— {v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
