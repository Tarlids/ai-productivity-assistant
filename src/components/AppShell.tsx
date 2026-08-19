import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

export const NAV = [
  { to: "/", label: "Dashboard", glyph: "◎", blurb: "Overview of every assistant" },
  { to: "/email", label: "Email Generator", glyph: "✉", blurb: "Bullets into a sendable email" },
  { to: "/meetings", label: "Meeting Notes", glyph: "◑", blurb: "Notes into decisions & actions" },
  { to: "/planner", label: "Task Planner", glyph: "▤", blurb: "Prioritised day or week plan" },
  { to: "/research", label: "Research Assistant", glyph: "◈", blurb: "Summaries, insights, next steps" },
  { to: "/chat", label: "AI Assistant", glyph: "❯", blurb: "Ask anything about your work" },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <span className="font-display text-lg font-bold">
          Standup<span className="text-primary">.</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} shrink-0 border-b border-border bg-card/50 px-4 py-5 md:sticky md:top-0 md:block md:h-screen md:w-64 md:border-r md:border-b-0`}
      >
        <div className="hidden md:block">
          <p className="label-mono">AI workplace suite</p>
          <p className="mt-1 font-display text-2xl font-bold">
            Standup<span className="text-primary">.</span>
          </p>
        </div>

        <nav className="mt-5 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/60" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
            >
              <span className="text-primary">{item.glyph}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="mt-6 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
          <span className="text-foreground">Responsible AI:</span> every output is an AI-generated
          draft built only from what you provide. Review and edit before sending or acting on it.
        </p>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <header className="border-b border-border pb-5">
          <p className="label-mono">AI workplace assistant</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </header>
        <div className="mt-7 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60";

export const textareaClass =
  "mt-3 w-full resize-y rounded-lg border border-input bg-background/60 p-4 font-mono text-sm leading-relaxed text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring/30";

export function RunButton({
  pending,
  disabled,
  onClick,
  label,
}: {
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={onClick}
      className="rounded-md px-5 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
      style={{ backgroundImage: "var(--gradient-signal)" }}
    >
      {pending ? "Working…" : label}
    </button>
  );
}

export function ErrorNote({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </p>
  );
}

export function Skeleton() {
  return (
    <div className="panel space-y-3 p-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-secondary"
          style={{ width: `${90 - i * 9}%` }}
        />
      ))}
    </div>
  );
}

export function priorityClass(p: string) {
  const v = p.toLowerCase();
  if (v.startsWith("h")) return "bg-destructive/15 text-destructive border-destructive/30";
  if (v.startsWith("m")) return "bg-warning/15 text-warning border-warning/30";
  return "bg-accent/15 text-accent border-accent/30";
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="label-mono rounded-md border border-border px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
