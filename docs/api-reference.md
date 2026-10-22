# ContextFlow API Reference

Base URL: `http://localhost:3001/api`

## Health Check
- **`GET /health`**
  - Returns service status and database connectivity.
  - Response: `{"ok": true, "service": "contextflow-backend", "database": "connected"}`

## Tasks
- **`GET /tasks`**
  - Query param: `includeCompleted=true|false` (default: `false`)
  - Returns list of tasks.
- **`POST /tasks`**
  - Body: `{"title": string, "deadline": "YYYY-MM-DD" | null, "estimatedMinutes": int (5-600), "priority": "low"|"medium"|"high"|"urgent"}`
  - Returns: `201 Created` with created task object.
- **`PATCH /tasks/:id`**
  - Body: Partial update object (`title`, `deadline`, `estimatedMinutes`, `priority`, `completed`).
  - Returns: Updated task object.

## Preferences
- **`GET /preferences`**
  - Returns saved scheduling preferences record.
- **`PUT /preferences`**
  - Body: `{"availableMinutesPerDay": int (15-1440), "preferredBreakMinutes": int (0-60), "dayStartHour": int (0-23)}`
  - Returns: Updated preferences record.

## Plans
- **`GET /plans/latest`**
  - Query param: `date=YYYY-MM-DD` (optional)
  - Returns the latest calculated plan with `scheduled_tasks` and `unscheduled_tasks`.
  - Returns: `404` if no plan exists yet.

## Agent
- **`POST /agent`**
  - Body: `{"message": string (1-2000 chars), "sessionId": "UUID" (optional)}`
  - Runs the bounded tool-calling loop.
  - Returns: `{"sessionId": string, "answer": string, "toolEvents": array, "messages": array}`

## Sessions
- **`GET /sessions/:sessionId/messages`**
  - Returns user and assistant conversation history for session re-hydration.
