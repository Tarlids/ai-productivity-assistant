import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  ChatTurn,
  EmailResult,
  PlannerResult,
  ResearchResult,
} from "./ai-types";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        points: z.string().min(1),
        recipient: z.string(),
        tone: z.string(),
        length: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<EmailResult> => {
    const { runJson, EMAIL_SYSTEM } = await import("./ai-core.server");
    return runJson<EmailResult>(
      EMAIL_SYSTEM,
      `Recipient / context: ${data.recipient || "not specified"}\nTone: ${data.tone}\nLength: ${data.length}\n\nPOINTS TO COVER:\n"""\n${data.points}\n"""`,
    );
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        tasks: z.string().min(1),
        horizon: z.string(),
        hours: z.string(),
        style: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<PlannerResult> => {
    const { runJson, PLANNER_SYSTEM } = await import("./ai-core.server");
    return runJson<PlannerResult>(
      PLANNER_SYSTEM,
      `Horizon: ${data.horizon}\nWorking hours: ${data.hours}\nWorking style preference: ${data.style}\n\nTASKS AND CONSTRAINTS:\n"""\n${data.tasks}\n"""`,
    );
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        input: z.string().min(1),
        mode: z.string(),
        audience: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ResearchResult> => {
    const { runJson, RESEARCH_SYSTEM } = await import("./ai-core.server");
    return runJson<ResearchResult>(
      RESEARCH_SYSTEM,
      `Mode: ${data.mode}\nAudience: ${data.audience}\n\nINPUT:\n"""\n${data.input}\n"""`,
    );
  });

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<string> => {
    const { runText, CHAT_SYSTEM } = await import("./ai-core.server");
    const transcript = (data.messages as ChatTurn[])
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    return runText(CHAT_SYSTEM, `${transcript}\n\nAssistant:`);
  });
