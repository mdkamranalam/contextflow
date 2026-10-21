import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance = null;

export function initDatabase(
  dbPath = process.env.DATABASE_PATH || "./data/contextflow.db",
) {
  if (dbInstance) {
    return dbInstance;
  }

  const isMemory = dbPath === ":memory:";

  if (!isMemory) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");

  // Schema creation
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      deadline TEXT,
      estimated_minutes INTEGER NOT NULL,
      priority TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      available_minutes_per_day INTEGER NOT NULL DEFAULT 180,
      preferred_break_minutes INTEGER NOT NULL DEFAULT 10,
      day_start_hour INTEGER NOT NULL DEFAULT 9,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      plan_date TEXT NOT NULL,
      available_minutes INTEGER NOT NULL,
      used_minutes INTEGER NOT NULL,
      remaining_minutes INTEGER NOT NULL,
      scheduled_tasks TEXT NOT NULL,
      unscheduled_tasks TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_calls TEXT,
      tool_call_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Ensure default preference record exists
    INSERT OR IGNORE INTO preferences (id, available_minutes_per_day, preferred_break_minutes, day_start_hour)
    VALUES (1, 180, 10, 9);
  `);

  return dbInstance;
}

export function getDatabase() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
