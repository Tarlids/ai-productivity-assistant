import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  AppShell,
  CopyButton,
  ErrorNote,
  Field,
  RunButton,
  Skeleton,
  inputClass,
  textareaClass,
} from "@/components/AppShell";
import { generateEmail } from "@/lib/ai.functions";
import type { EmailResult } from "@/lib/ai-types";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Standup" },
      {
        name: "description",
        content:
          "Turn rough bullet points into a professional email with tone and length control, plus alternative openers.",
      },
      { property: "og:title", content: "Smart Email Generator — Standup" },
      {
        property: "og:description",
        content: "AI email drafting with formal, friendly, persuasive and direct tones.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Direct", "Apologetic"];
const LENGTHS = ["Short (under 90 words)", "Medium (~150 words)", "Detailed (~250 words)"];

const SAMPLE = `- tell the client the onboarding revamp slipped by 2 weeks
- reason: design handoff was late on our side, own it
- new date: 12 September
- offer a walkthrough call next week
- keep it professional but not cold`;

function EmailPage() {
  const [points, setPoints] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1]);
  const [draft, setDraft] = useState("");

  const run = useServerFn(generateEmail);
  const mutation = useMutation<EmailResult, Error>({
    mutationFn: () => run({ data: { points, recipient, tone, length } }),
    onSuccess: (d) => setDraft(d.body),
  });
  const result = mutation.data;

  return (
    <AppShell
      title="Smart Email Generator"
      subtitle="Give it the messy bullet points. Get a subject line, a sendable body in the tone you choose, and alternative openers."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="panel h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="label-mono">What needs saying</h2>
            <button
              type="button"
              onClick={() => setPoints(SAMPLE)}
              className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
            >
              Load example
            </button>
          </div>

          <textarea
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Bullet points, half sentences, the awkward bit you're avoiding…"
            className={`${textareaClass} h-56`}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Recipient / context">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. client project lead"
                className={inputClass}
              />
            </Field>
            <Field label="Tone">
              <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass}>
                {TONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Length">
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={inputClass}
              >
                {LENGTHS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <RunButton
              pending={mutation.isPending}
              disabled={!points.trim()}
              onClick={() => mutation.mutate()}
              label="Draft email"
            />
          </div>

          <ErrorNote message={mutation.error?.message} />

          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <span className="text-foreground">Responsible AI:</span> the draft only uses details you
            supplied. Anything missing appears as a [placeholder] and is listed under gaps — edit
            before sending.
          </p>
        </section>

        <section className="space-y-5">
          {!result && !mutation.isPending && (
            <div className="panel flex min-h-72 flex-col items-center justify-center p-10 text-center">
              <p className="label-mono">Awaiting input</p>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Your subject line, editable email body and alternative openers will appear here.
              </p>
            </div>
          )}

          {mutation.isPending && <Skeleton />}

          {result && (
            <>
              <div className="panel p-6">
                <p className="label-mono">Subject</p>
                <h2 className="mt-2 text-xl font-semibold">{result.subject}</h2>
              </div>

              <div className="panel p-6">
                <div className="flex items-center justify-between">
                  <p className="label-mono">Editable draft</p>
                  <CopyButton text={draft} />
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className={`${textareaClass} h-72 font-sans`}
                />
              </div>

              {result.alternativeOpeners?.length > 0 && (
                <div className="panel p-6">
                  <p className="label-mono">Alternative openers</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.alternativeOpeners.map((o, i) => (
                      <li key={i}>— {o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.notes?.length > 0 && (
                <div className="panel border-accent/40 p-6">
                  <p className="label-mono text-accent">Gaps to fill before sending</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.notes.map((n, i) => (
                      <li key={i}>— {n}</li>
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
