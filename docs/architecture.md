# ContextFlow Architecture

## 1. High-Level Concept

ContextFlow bridges natural language conversational planning with real, deterministic application state. Instead of relying on an LLM to hallucinate time arithmetic, ContextFlow delegates schedule calculations to deterministic JavaScript algorithms and stores state in SQLite.

```text
User Input ──► Express API ──► Groq Agent Loop ──► Tool Call ──► Zod Validation
                                                        │
┌───────────────────────────────────────────────────────┘
▼
Deterministic Scheduler / SQLite ──► Tool Result ──► Groq Response ──► Reactive UI
```

## 2. Bounded Tool-Calling Loop

The agent coordinator (`server/src/agent/tool-calling-loop.js`) implements a bounded multi-turn interaction loop:
- **Maximum Rounds:** Defaults to 4 (`MAX_TOOL_ROUNDS=4`) to prevent infinite model recursion or excessive token burn.
- **Argument Validation:** All model-supplied tool arguments are validated through Zod before execution.
- **Resilience:** If a tool call fails, the structured error is returned to the model as a `tool` role message so the model can self-correct or ask for clarification.

## 3. Deterministic Scheduling Engine

The scheduler (`server/src/services/scheduler.js`) implements pure deterministic logic:
1. **Filter Pending:** Excludes completed tasks.
2. **Sort Strategy:**
   - Primary: Deadline ascending (earliest due dates first; null deadlines last).
   - Secondary: Priority descending (`urgent` > `high` > `medium` > `low`).
   - Tie-breaker: Task ID ascending.
3. **Slot Allocation:**
   - Starts at `dayStartHour`.
   - Inserts `preferredBreakMinutes` between tasks.
   - Enforces a midnight horizon limit (`Math.min(availableMinutes, (24 - startHour) * 60)`).
4. **Overflow Handling:** Any task that cannot fit within the available time budget is flagged into `unscheduledTasks` with a descriptive reason.

## 4. SQLite Persistence Schema

SQLite uses Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and foreign keys:
- `tasks`: Task ID, title, deadline, duration, priority, completed flag, timestamps.
- `preferences`: Daily available minutes, break minutes, start hour.
- `plans`: Plan date, budget stats, serialized scheduled tasks, serialized unscheduled tasks.
- `sessions`: Session UUIDs and activity timestamps.
- `messages`: Message role (`system`, `user`, `assistant`, `tool`), content, tool calls, and references.
