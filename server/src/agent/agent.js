import crypto from "crypto";
import { getDatabase } from "../db/database.js";
import { getGroqClient } from "../lib/groq.js";
import { runToolCallingLoop } from "./tool-calling-loop.js";

const SYSTEM_PROMPT = `You are ContextFlow, an intelligent, context-aware productivity assistant.
Your goal is to help users manage tasks, maintain preferences, and generate deterministic work schedules.

Rules:
1. Always use the registered tools to query or update application state (tasks, preferences, plans).
2. Never invent tasks, deadlines, or available times that were not provided by the user or saved in the database.
3. If information is missing (like duration for a task), ask the user clearly.
4. When planning work, use the create_plan tool so that scheduling is calculated deterministically.
5. Provide concise, helpful summaries of what tools were executed and the resulting plan.`;

export async function handleAgentRequest({ message, sessionId }) {
  const db = getDatabase();
  const groqClient = getGroqClient();

  if (!groqClient) {
    const error = new Error(
      "Groq API client is not configured. Please set GROQ_API_KEY in server/.env",
    );
    error.status = 503;
    throw error;
  }

  let activeSessionId = sessionId;

  if (activeSessionId) {
    const session = db
      .prepare("SELECT id FROM sessions WHERE id = ?")
      .get(activeSessionId);
    if (!session) {
      const error = new Error(`Session ${activeSessionId} not found`);
      error.status = 404;
      throw error;
    }
  } else {
    activeSessionId = crypto.randomUUID();
    db.prepare("INSERT INTO sessions (id) VALUES (?)").run(activeSessionId);
  }

  const historyRows = db
    .prepare(
      "SELECT role, content, tool_calls, tool_call_id FROM messages WHERE session_id = ? ORDER BY created_at ASC",
    )
    .all(activeSessionId);

  const modelMessages = [{ role: "system", content: SYSTEM_PROMPT }];

  for (const row of historyRows) {
    const msg = { role: row.role, content: row.content };
    if (row.tool_calls) {
      try {
        msg.tool_calls = JSON.parse(row.tool_calls);
      } catch {}
    }
    if (row.tool_call_id) {
      msg.tool_call_id = row.tool_call_id;
    }
    modelMessages.push(msg);
  }

  modelMessages.push({ role: "user", content: message });

  // Persist user message
  const userMsgId = crypto.randomUUID();
  db.prepare(
    "INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)",
  ).run(userMsgId, activeSessionId, "user", message);

  const loopResult = await runToolCallingLoop({
    groqClient,
    messages: modelMessages,
  });

  // Persist assistant message
  const assistantMsgId = crypto.randomUUID();
  db.prepare(
    "INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)",
  ).run(assistantMsgId, activeSessionId, "assistant", loopResult.finalAnswer);

  // Update session timestamp
  db.prepare(
    "UPDATE sessions SET updated_at = datetime('now') WHERE id = ?",
  ).run(activeSessionId);

  return {
    sessionId: activeSessionId,
    answer: loopResult.finalAnswer,
    toolEvents: loopResult.toolEvents,
    messages: [
      { id: userMsgId, role: "user", content: message },
      {
        id: assistantMsgId,
        role: "assistant",
        content: loopResult.finalAnswer,
      },
    ],
  };
}
