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
  priorityClass,
  textareaClass,
} from "@/components/AppShell";
import { planTasks } from "@/lib/ai.functions";
import type { PlannerResult } from "@/lib/ai-types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Standup" },
      {
        name: "description",
        content:
          "Turn a messy task list into a realistic, prioritised daily or weekly schedule with time blocks and deferred work.",
      },
      { property: "og:title", content: "AI Task Planner — Standup" },
      {
        property: "og:description",
        content: "Prioritise tasks and build a realistic day or week plan with AI.",
      },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Today", "This week"];
const STYLES = [
  "Deep focus in the morning",
  "Meetings clustered together",
  "Short bursts with frequent breaks",
];

const SAMPLE = `- finish Q3 onboarding deck (needs ~3h, due Thursday)
- 1:1 with Naledi, 30 min, any day
- fix billing email bug — blocking, highest priority
- review 4 PRs
- write client update email (due tomorrow morning)
- gym 3x this week
- prep board numbers, due Friday 12:00`;

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState(HORIZONS[1]);
  const [hours, setHours] = useState("09:00–17:00, lunch 13:00");
  const [style, setStyle] = useState(STYLES[0]);

  const run = useServerFn(planTasks);
  const mutation = useMutation<PlannerResult, Error>({
    mutationFn: () => run({ data: { tasks, horizon, hours, style } }),
  });
  const result = mutation.data;

  return (
    <AppShell
      title="AI Task Planner"
      subtitle="Dump every task and constraint. Get a prioritised, time-blocked plan that respects your working hours — and an honest list of what won't fit."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="panel h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="label-mono">Tasks & constraints</h2>
            <button
              type="button"
              onClick={() => setTasks(SAMPLE)}
              className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
            >
              Load example
            </button>
          </div>

          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder="One task per line. Add deadlines, durations and anything fixed."
            className={`${textareaClass} h-60`}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Horizon">
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className={inputClass}
              >
                {HORIZONS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Working hours">
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Working style">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={inputClass}
              >
                {STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <RunButton
              pending={mutation.isPending}
              disabled={!tasks.trim()}
              onClick={() => mutation.mutate()}
              label="Build schedule"
            />
          </div>

          <ErrorNote message={mutation.error?.message} />

          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <span className="text-foreground">Responsible AI:</span> only your tasks are scheduled —
            nothing is added. If the day is overbooked the planner defers work and says so instead of
            pretending it fits.
          </p>
        </section>

        <section className="space-y-5">
          {!result && !mutation.isPending && (
            <div className="panel flex min-h-72 flex-col items-center justify-center p-10 text-center">
              <p className="label-mono">Awaiting input</p>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Your time-blocked plan, priorities and deferred items will appear here.
              </p>
            </div>
          )}

          {mutation.isPending && <Skeleton />}

          {result && (
            <>
              <div className="panel p-6">
                <p className="label-mono">Strategy</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.strategy}
                </p>
              </div>

              {result.days?.map((day, di) => (
                <div key={di} className="panel p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold">{day.day}</h2>
                    <span className="label-mono">{day.focus}</span>
                  </div>
                  <ul className="mt-3 divide-y divide-border">
                    {day.tasks?.map((t, ti) => (
                      <li key={ti} className="flex flex-wrap items-start gap-3 py-3">
                        <span className="label-mono min-w-28 text-foreground">{t.time}</span>
                        <span className="min-w-40 flex-1 text-sm">
                          {t.task}
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {t.rationale}
                          </span>
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityClass(t.priority)}`}
                        >
                          {t.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="panel p-6">
                  <p className="label-mono">Deferred</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.deferred?.length ? (
                      result.deferred.map((d, i) => <li key={i}>— {d}</li>)
                    ) : (
                      <li>Everything fits.</li>
                    )}
                  </ul>
                </div>
                <div className="panel p-6">
                  <p className="label-mono">Warnings</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.warnings?.length ? (
                      result.warnings.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning">!</span>
                          <span>{w}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No conflicts detected.</li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
