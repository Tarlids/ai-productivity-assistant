import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const Input = z.object({
  notes: z.string().min(1),
  meetingDate: z.string(),
  tone: z.string(),
});

const ResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  decisions: z.array(z.string()),
  risks: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      due: z.string(),
      priority: z.string(),
    }),
  ),
  followUpEmail: z.string(),
  openQuestions: z.array(z.string()),
});

export type MeetingResult = z.infer<typeof ResultSchema>;

const SYSTEM = `You are an operations chief-of-staff that turns raw, messy meeting notes into an execution-ready brief.

Rules:
- Only use information present in the notes. Never invent people, dates, numbers, or commitments.
- If an owner is unknown, use "Unassigned". If a due date is unknown, use "No date".
- Resolve relative dates ("next Friday", "in two weeks") against the meeting date and output ISO format YYYY-MM-DD.
- priority must be exactly one of: High, Medium, Low.
- Keep summary under 120 words, each decision and action under 25 words.
- openQuestions lists ambiguities a human must confirm — this is how you avoid guessing.
- followUpEmail is a short recap email (under 180 words) in the requested tone, plain text, no placeholders other than [Name] if truly needed.`;

export const analyzeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this app.");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system: SYSTEM,
        output: Output.object({ schema: ResultSchema }),
        prompt: `Meeting date: ${data.meetingDate}\nFollow-up email tone: ${data.tone}\n\nRAW NOTES:\n"""\n${data.notes}\n"""`,
      });
      return (await result.output) as MeetingResult;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be parsed. Try again with slightly shorter notes.");
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("402")) throw new Error("AI credits are exhausted. Add credits to continue.");
      if (message.includes("429")) throw new Error("Rate limited by the AI service. Wait a moment and retry.");
      throw new Error(message);
    }
  });
