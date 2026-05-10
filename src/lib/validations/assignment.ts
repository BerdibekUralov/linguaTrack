import { z } from "zod";

export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  maxScore: z.number().min(1).max(1000),
  type: z.enum(["HOMEWORK", "TEST", "PROJECT", "READING"]),
  studentId: z.string().optional().nullable(),
  allowLateSubmission: z.boolean(),
  framework: z.enum(["IELTS", "CEFR", "TOEFL", "CAMBRIDGE", "DUOLINGO", "GENERAL"]).optional(),
  level: z.string().optional().nullable(),
  skillType: z.enum(["WRITING", "SPEAKING", "READING", "LISTENING", "GRAMMAR", "VOCABULARY", "MIXED", "USE_OF_ENGLISH"]).optional(),
  skillContent: z.unknown().optional().nullable(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
