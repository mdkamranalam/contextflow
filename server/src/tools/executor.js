import crypto from "crypto";
import { getDatabase } from "../db/database.js";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdatePreferencesSchema,
} from "../lib/validation.js";
import { buildSchedule } from "../services/scheduler.js";

export function executeTool(name, args = {}) {
  const db = getDatabase();

  switch (name) {
    case "list_tasks": {
      const includeCompleted = Boolean(args.includeCompleted);
      const query = includeCompleted
        ? "SELECT * FROM tasks ORDER BY created_at DESC"
        : "SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC";
      const rows = db.prepare(query).all();
      return { success: true, count: rows.length, tasks: rows };
    }

    case "create_task": {
      const parsed = CreateTaskSchema.parse(args);
      const id = crypto.randomUUID();
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, deadline, estimated_minutes, priority, completed)
        VALUES (?, ?, ?, ?, ?, 0)
      `);
      stmt.run(
        id,
        parsed.title,
        parsed.deadline || null,
        parsed.estimatedMinutes,
        parsed.priority,
      );
      const created = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      return { success: true, task: created };
    }

    case "update_task": {
      if (!args.id) throw new Error("Task ID is required for update");
      const { id, ...updates } = args;
      const parsed = UpdateTaskSchema.parse(updates);

      const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      if (!existing) throw new Error(`Task with id ${id} not found`);

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
      values.push(id);

      db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(
        ...values,
      );
      const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      return { success: true, task: updated };
    }

    case "get_preferences": {
      const prefs = db.prepare("SELECT * FROM preferences WHERE id = 1").get();
      return { success: true, preferences: prefs };
    }

    case "update_preferences": {
      const parsed = UpdatePreferencesSchema.parse(args);
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
      const updated = db
        .prepare("SELECT * FROM preferences WHERE id = 1")
        .get();
      return { success: true, preferences: updated };
    }

    case "create_plan": {
      const tasks = db.prepare("SELECT * FROM tasks WHERE completed = 0").all();
      const prefs = db.prepare("SELECT * FROM preferences WHERE id = 1").get();

      const planResult = buildSchedule({
        tasks,
        preferences: prefs,
        planDate: args.planDate,
      });

      const planId = crypto.randomUUID();
      db.prepare(
        `
        INSERT INTO plans (id, plan_date, available_minutes, used_minutes, remaining_minutes, scheduled_tasks, unscheduled_tasks)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        planId,
        planResult.planDate,
        planResult.availableMinutes,
        planResult.usedMinutes,
        planResult.remainingMinutes,
        JSON.stringify(planResult.scheduledTasks),
        JSON.stringify(planResult.unscheduledTasks),
      );

      return {
        success: true,
        plan: {
          id: planId,
          ...planResult,
        },
      };
    }

    case "get_latest_plan": {
      let plan;
      if (args.planDate) {
        plan = db
          .prepare(
            "SELECT * FROM plans WHERE plan_date = ? ORDER BY created_at DESC LIMIT 1",
          )
          .get(args.planDate);
      } else {
        plan = db
          .prepare("SELECT * FROM plans ORDER BY created_at DESC LIMIT 1")
          .get();
      }

      if (!plan) {
        return { success: true, plan: null, message: "No plan found" };
      }

      return {
        success: true,
        plan: {
          ...plan,
          scheduled_tasks: JSON.parse(plan.scheduled_tasks),
          unscheduled_tasks: JSON.parse(plan.unscheduled_tasks),
        },
      };
    }

    default:
      throw new Error(`Tool "${name}" is not registered`);
  }
}
