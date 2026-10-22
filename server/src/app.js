import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import crypto from "crypto";
import { getDatabase } from "./db/database.js";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdatePreferencesSchema,
  AgentMessageSchema,
} from "./lib/validation.js";
import { handleAgentRequest } from "./agent/agent.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  // In-memory rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later.",
      },
    },
  });
  app.use("/api/", limiter);

  // Health check
  app.get("/api/health", (req, res) => {
    try {
      const db = getDatabase();
      db.prepare("SELECT 1").get();
      return res.status(200).json({
        ok: true,
        service: "contextflow-backend",
        database: "connected",
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        service: "contextflow-backend",
        database: "disconnected",
        error: err.message,
      });
    }
  });

  // Task endpoints
  app.get("/api/tasks", (req, res) => {
    const db = getDatabase();
    const includeCompleted = req.query.includeCompleted === "true";
    const query = includeCompleted
      ? "SELECT * FROM tasks ORDER BY created_at DESC"
      : "SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC";
    const tasks = db.prepare(query).all();
    return res.json({ tasks });
  });

  app.post("/api/tasks", (req, res) => {
    try {
      const parsed = CreateTaskSchema.parse(req.body);
      const db = getDatabase();
      const id = crypto.randomUUID();
      db.prepare(
        `
        INSERT INTO tasks (id, title, deadline, estimated_minutes, priority, completed)
        VALUES (?, ?, ?, ?, ?, 0)
      `,
      ).run(
        id,
        parsed.title,
        parsed.deadline || null,
        parsed.estimatedMinutes,
        parsed.priority,
      );
      const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      return res.status(201).json({ task });
    } catch (err) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: err.message,
          details: err.errors,
        },
      });
    }
  });

  app.patch("/api/tasks/:id", (req, res) => {
    try {
      const parsed = UpdateTaskSchema.parse(req.body);
      const db = getDatabase();
      const existing = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(req.params.id);
      if (!existing) {
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Task not found" } });
      }

      const fields = [];
      const values = [];
      if (parsed.title !== undefined) {
        fields.push("title = ?");
        values.push(parsed.title);
      }
      if (parsed.deadline !== undefined) {
        fields.push("deadline = ?");
        values.push(parsed.deadline);
      }
      if (parsed.estimatedMinutes !== undefined) {
        fields.push("estimated_minutes = ?");
        values.push(parsed.estimatedMinutes);
      }
      if (parsed.priority !== undefined) {
        fields.push("priority = ?");
        values.push(parsed.priority);
      }
      if (parsed.completed !== undefined) {
        fields.push("completed = ?");
        values.push(parsed.completed ? 1 : 0);
      }
      fields.push("updated_at = datetime('now')");
      values.push(req.params.id);

      db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(
        ...values,
      );
      const updated = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(req.params.id);
      return res.json({ task: updated });
    } catch (err) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: err.message,
          details: err.errors,
        },
      });
    }
  });

  // Preferences endpoints
  app.get("/api/preferences", (req, res) => {
    const db = getDatabase();
    const preferences = db
      .prepare("SELECT * FROM preferences WHERE id = 1")
      .get();
    return res.json({ preferences });
  });

  app.put("/api/preferences", (req, res) => {
    try {
      const parsed = UpdatePreferencesSchema.parse(req.body);
      const db = getDatabase();
      const fields = [];
      const values = [];
      if (parsed.availableMinutesPerDay !== undefined) {
        fields.push("available_minutes_per_day = ?");
        values.push(parsed.availableMinutesPerDay);
      }
      if (parsed.preferredBreakMinutes !== undefined) {
        fields.push("preferred_break_minutes = ?");
        values.push(parsed.preferredBreakMinutes);
      }
      if (parsed.dayStartHour !== undefined) {
        fields.push("day_start_hour = ?");
        values.push(parsed.dayStartHour);
      }
      fields.push("updated_at = datetime('now')");
      db.prepare(
        `UPDATE preferences SET ${fields.join(", ")} WHERE id = 1`,
      ).run(...values);
      const preferences = db
        .prepare("SELECT * FROM preferences WHERE id = 1")
        .get();
      return res.json({ preferences });
    } catch (err) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: err.message,
          details: err.errors,
        },
      });
    }
  });

  // Plan endpoints
  app.get("/api/plans/latest", (req, res) => {
    const db = getDatabase();
    const { date } = req.query;
    let plan;
    if (date) {
      plan = db
        .prepare(
          "SELECT * FROM plans WHERE plan_date = ? ORDER BY created_at DESC LIMIT 1",
        )
        .get(date);
    } else {
      plan = db
        .prepare("SELECT * FROM plans ORDER BY created_at DESC LIMIT 1")
        .get();
    }

    if (!plan) {
      return res.status(404).json({
        error: { code: "PLAN_NOT_FOUND", message: "No saved plan found" },
      });
    }

    return res.json({
      plan: {
        ...plan,
        scheduled_tasks: JSON.parse(plan.scheduled_tasks),
        unscheduled_tasks: JSON.parse(plan.unscheduled_tasks),
      },
    });
  });

  // Agent endpoint
  app.post("/api/agent", async (req, res) => {
    try {
      const parsed = AgentMessageSchema.parse(req.body);
      const result = await handleAgentRequest(parsed);
      return res.json(result);
    } catch (err) {
      const status = err.status || (err.name === "ZodError" ? 400 : 500);
      return res.status(status).json({
        error: {
          code: err.name === "ZodError" ? "VALIDATION_ERROR" : "AGENT_ERROR",
          message: err.message,
        },
      });
    }
  });

  // Session messages endpoint
  app.get("/api/sessions/:sessionId/messages", (req, res) => {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT id, role, content, created_at FROM messages WHERE session_id = ? AND role IN ('user', 'assistant') ORDER BY created_at ASC",
      )
      .all(req.params.sessionId);
    return res.json({ messages: rows });
  });

  // 404 handler for undefined API routes
  app.use("/api", (req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  return app;
}
