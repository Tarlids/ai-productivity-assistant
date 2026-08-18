import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, NAV } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Standup — AI workplace productivity assistant" },
      {
        name: "description",
        content:
          "One dashboard for AI email drafting, meeting note summaries, task planning, research briefs and a workplace chat assistant.",
      },
      { property: "og:title", content: "Standup — AI workplace productivity assistant" },
      {
        property: "og:description",
        content:
          "Automate everyday workplace tasks: emails, meeting actions, schedules, research briefs and an AI assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { label: "AI tools", value: "5" },
  { label: "Model", value: "Lovable AI" },
  { label: "Data stored", value: "None" },
];

function Dashboard() {
  const tools = NAV.filter((n) => n.to !== "/");

  return (
    <AppShell
      title="Workplace command centre"
      subtitle="Five AI assistants for the admin work that eats your day — writing, summarising, planning, researching and thinking out loud."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="panel p-5">
            <p className="label-mono">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="panel group flex items-start gap-4 p-5 transition-colors hover:border-primary/50"
          >
            <span className="mt-0.5 text-xl text-primary">{t.glyph}</span>
            <span>
              <span className="block font-display text-lg font-semibold">{t.label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{t.blurb}</span>
              <span className="label-mono mt-3 block text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section className="panel mt-6 p-6">
        <p className="label-mono">Responsible AI in this app</p>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>— Outputs are grounded only in the text you provide; nothing is invented.</li>
          <li>— Gaps and ambiguities are surfaced instead of guessed.</li>
          <li>— Facts that need checking are listed explicitly in research briefs.</li>
          <li>— Nothing is stored or sent on your behalf; every draft is yours to edit.</li>
        </ul>
      </section>
    </AppShell>
  );
}
