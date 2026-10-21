import { z } from "zod";

export const TaskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(160, "Title cannot exceed 160 characters"),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format")
    .nullable()
    .optional(),
  estimatedMinutes: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(600, "Duration cannot exceed 600 minutes"),
  priority: TaskPriorityEnum.default("medium"),
});

export const UpdateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    estimatedMinutes: z.number().int().min(5).max(600).optional(),
    priority: TaskPriorityEnum.optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const UpdatePreferencesSchema = z
  .object({
    availableMinutesPerDay: z.number().int().min(15).max(1440).optional(),
    preferredBreakMinutes: z.number().int().min(0).max(60).optional(),
    dayStartHour: z.number().int().min(0).max(23).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one preference field must be provided",
  });

export const AgentMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
  sessionId: z.string().uuid("Invalid session ID format").optional(),
});
