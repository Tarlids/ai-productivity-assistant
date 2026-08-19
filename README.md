# Standup — AI Workplace Productivity Assistant

One integrated dashboard of AI assistants that automate everyday workplace admin: writing, summarising, planning, researching and thinking out loud.

## Features

1. **Smart Email Generator** (`/email`) — turns bullet points into a subject line and sendable body with tone (formal, friendly, persuasive, direct, apologetic) and length control, alternative openers, and a list of gaps to fill before sending. Output is editable in place.
2. **Meeting Notes Summarizer** (`/meetings`) — messy notes in, structured brief out: summary, decisions, risks, action items with owner/due date/priority (relative dates resolved against the meeting date), open questions, and a recap email.
3. **AI Task Planner** (`/planner`) — a prioritised, time-blocked day or week plan that respects your working hours, with rationale per block plus deferred items and overbooking warnings.
4. **AI Research Assistant** (`/research`) — summarises pasted text or explores a topic into key points, insights, recommendations, risks, and an explicit "verify before use" list.
5. **AI Chatbot Interface** (`/chat`) — an interactive workplace assistant that keeps conversation context, with starter prompts.

Plus a dashboard overview, sidebar navigation, responsive mobile/desktop layout and a responsible-AI disclaimer on every screen.

## Prompt engineering

Each feature has a dedicated system prompt in `src/lib/ai-core.server.ts` composed of a shared `RESPONSIBLE_RULES` block plus task-specific rules and a strict JSON output contract, which the server parses and validates before rendering.

## Responsible AI

- Output is grounded only in user-provided text; people, dates, numbers and sources are never invented.
- Unknowns are surfaced ("Unassigned", "No date", open questions, gaps, verify-before-use) rather than guessed.
- The planner defers work instead of pretending an overbooked day fits.
- Nothing is stored or sent on the user's behalf; every output is a reviewable draft.
- The chat assistant states its limits (no email, files, calendar or web access).

## Tools used

- Lovable AI (Gemini via the Lovable AI Gateway) with the Vercel AI SDK
- TanStack Start (React 19, TanStack Router + Query), Vite 7
- Tailwind CSS v4 with a custom design system (Space Grotesk / DM Sans, deep-ink + amber palette)
- TypeScript, Zod validation, server functions for all AI calls (API key never reaches the browser)

## Setup

```bash
bun install
bun run dev   # http://localhost:8080
```

`LOVABLE_API_KEY` is provisioned automatically by Lovable and read server-side only.

## Project structure

```
src/routes/          index (dashboard), email, meetings, planner, research, chat
src/components/      AppShell (sidebar + layout primitives)
src/lib/             ai.functions.ts (server functions), ai-core.server.ts (prompts + gateway calls)
```
