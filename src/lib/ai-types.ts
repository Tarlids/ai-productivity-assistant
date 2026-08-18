export type EmailResult = {
  subject: string;
  body: string;
  alternativeOpeners: string[];
  notes: string[];
};

export type PlanTask = {
  time: string;
  task: string;
  priority: string;
  rationale: string;
};

export type PlanDay = {
  day: string;
  focus: string;
  tasks: PlanTask[];
};

export type PlannerResult = {
  strategy: string;
  days: PlanDay[];
  deferred: string[];
  warnings: string[];
};

export type ResearchResult = {
  topic: string;
  summary: string;
  keyPoints: string[];
  insights: string[];
  recommendations: string[];
  risks: string[];
  verifyBeforeUse: string[];
};

export type ChatTurn = { role: "user" | "assistant"; content: string };
