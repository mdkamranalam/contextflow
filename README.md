# ContextFlow

**A context-aware productivity assistant that turns natural-language requests into saved tasks and schedules.**

ContextFlow is a hackathon prototype exploring how an AI assistant can use saved context and application tools to help users organize work. A user can describe a task or request a plan in natural language. The backend retrieves relevant data, calls validated application functions, creates a schedule using deterministic JavaScript logic, and persists the result in SQLite.

> **Project status:** The backend is implemented in the accompanying `contextflow-backend` package. The React/Vite frontend is planned but is not included in the current backend package. This README describes the intended full product and clearly identifies what is currently available.

## Why ContextFlow?

A typical chatbot can suggest a plan, but the user may still need to enter tasks, track preferences, and maintain the plan manually. ContextFlow is designed to connect the conversation to real application state: tasks and preferences are stored, tool calls perform validated operations, and plans can be retrieved and revised later.

## Features

### Implemented in the backend

- **Groq-powered agent:** uses Groq Chat Completions with `openai/gpt-oss-20b` as the configured default model.
- **Validated tool calling:** the model can request a predefined set of tools; the backend validates arguments and executes only registered functions.
- **Task management API:** create, list, and update tasks with deadlines, estimated durations, priorities, and completion status.
- **Saved preferences:** persist daily available time, preferred break duration, and schedule start hour.
- **Deterministic scheduling:** builds a plan using saved tasks and preferences; tasks that do not fit are reported as unscheduled rather than silently dropped.
- **Persistent data:** stores tasks, preferences, plans, sessions, and conversation messages in SQLite.
- **Bounded agent loop:** limits model/tool rounds and total tool calls for a request.
- **API safeguards:** input validation, parameterized SQL, Helmet security headers, JSON body limits, CORS origin configuration, and in-memory rate limits.
- **Automated tests:** tests can use a mocked Groq client, so they do not need a live model request or consume Groq quota.

### Planned for the complete product

- React/Vite chat interface.
- Task list and preference controls.
- Daily-plan view showing scheduled and unscheduled tasks.
- Activity panel showing the tools the assistant used.
- UI flow for reviewing and revising a saved plan.

The frontend items above are planned and should not be considered implemented until the UI is added and connected to the API.

## How it works

1. The user sends a natural-language request to the backend.
2. The agent sends the conversation and available tool definitions to Groq.
3. If the model requests a tool, the backend validates its name and arguments.
4. The backend executes the registered function against SQLite or the scheduling service.
5. The tool result is returned to the model for the next step, subject to configured limits.
6. The final response and relevant session messages are persisted and returned to the caller.

The model does **not** execute SQL or JavaScript directly. Scheduling rules are implemented in JavaScript rather than delegated entirely to model-generated text.

## Technology stack

| Area               | Technology                                       |
| ------------------ | ------------------------------------------------ |
| AI inference       | Groq API and a configured tool-calling model     |
| Backend runtime    | Node.js (20.11 or later)                         |
| HTTP API           | Express 5                                        |
| Input validation   | Zod                                              |
| Database           | SQLite via `better-sqlite3`                      |
| API safeguards     | Helmet, CORS configuration, `express-rate-limit` |
| Frontend (planned) | React + Vite                                     |
| Version control    | Git + GitHub                                     |

Groq's free-plan availability, model access, and rate limits depend on the account and can change. This project does not guarantee unlimited free inference. Check the [Groq Console](https://console.groq.com/) for the current status of your account.

## Repository layout

The backend package is currently provided separately. The intended combined repository layout is:

```text
ContextFlow/
├── client/                       # Planned React/Vite frontend
├── server/                       # ContextFlow backend package
│   ├── src/
│   │   ├── agent/                 # Agent orchestration and tool-calling loop
│   │   ├── db/                    # SQLite initialization and persistence
│   │   ├── lib/                   # Shared utilities and validation
│   │   ├── services/              # Scheduling logic
│   │   └── tools/                  # Tool definitions and executor
│   ├── test/                      # Automated tests
│   ├── .env.example
│   └── package.json
├── README.md
└── LICENSE
```

If you are using the backend ZIP, extract its contents into a `server/` directory in your main ContextFlow repository. The backend package's own README contains backend-specific details.

## Getting started

### Prerequisites

- Node.js 20.11 or later and npm.
- A Groq API key for live AI requests: [create or manage a key](https://console.groq.com/keys).
- Internet access to install packages and make requests to Groq.

The backend can run its mocked tests without a Groq key. Live `/api/agent` requests require a valid key and available API quota.

### 1. Install backend dependencies

From the combined repository root:

```bash
cd server
npm install
```

If you extracted the backend package into a differently named directory, run these commands from that directory instead.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `GROQ_API_KEY` to your own key. The default configuration is:

```dotenv
GROQ_API_KEY=replace_with_your_actual_key
GROQ_MODEL=openai/gpt-oss-20b
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/contextflow.db
MAX_TOOL_ROUNDS=4
APP_TIME_ZONE=Asia/Kolkata
```

| Variable          | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `GROQ_API_KEY`    | Secret credential for server-side Groq requests; required for live agent requests. |
| `GROQ_MODEL`      | Model name available to your Groq account.                                         |
| `PORT`            | Local HTTP port; defaults to `3001`.                                               |
| `CLIENT_ORIGIN`   | Origin permitted by CORS; defaults to the Vite development origin.                 |
| `DATABASE_PATH`   | Location of the SQLite database file.                                              |
| `MAX_TOOL_ROUNDS` | Maximum number of model/tool-calling rounds per request.                           |
| `APP_TIME_ZONE`   | IANA time-zone name used for schedule times; defaults to `Asia/Kolkata`.           |

**Keep secrets private.** Never commit `.env`, expose the key in React code, use a `VITE_*` variable for it, or include it in screenshots, recordings, or public issue reports. Confirm `.env` is ignored by Git before committing.

### 3. Start the backend

Development mode with automatic restart:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The API listens at `http://localhost:3001` by default.

### 4. Check the health endpoint

```bash
curl http://localhost:3001/api/health
```

A successful response has this shape:

```json
{"ok":true,"service":"contextflow-backend","database":"connected"}
```

## API overview

All routes below are served by the backend.

| Method  | Endpoint                            | Purpose                                      |
| ------- | ----------------------------------- | -------------------------------------------- |
| `GET`   | `/api/health`                       | Check server and database status.            |
| `GET`   | `/api/tasks`                        | List incomplete tasks by default.            |
| `GET`   | `/api/tasks?includeCompleted=true`  | Include completed tasks.                     |
| `POST`  | `/api/tasks`                        | Create a task.                               |
| `PATCH` | `/api/tasks/:id`                    | Update selected task fields.                 |
| `GET`   | `/api/preferences`                  | Read saved scheduling preferences.           |
| `PUT`   | `/api/preferences`                  | Update one or more preferences.              |
| `GET`   | `/api/plans/latest`                 | Retrieve the most recently saved plan.       |
| `GET`   | `/api/plans/latest?date=YYYY-MM-DD` | Retrieve the latest plan for a date.         |
| `POST`  | `/api/agent`                        | Send a message to the agent.                 |
| `GET`   | `/api/sessions/:sessionId/messages` | Retrieve the visible messages for a session. |

### Create a task

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Review algorithms","deadline":"2026-10-23","estimatedMinutes":45,"priority":"high"}'
```

Supported task priorities are `low`, `medium`, `high`, and `urgent`. The backend validates task fields and uses parameterized database queries.

### Update preferences

```bash
curl -X PUT http://localhost:3001/api/preferences \
  -H 'Content-Type: application/json' \
  -d '{"availableMinutesPerDay":180,"preferredBreakMinutes":10,"dayStartHour":9}'
```

### Ask the agent to use tools

```bash
curl -X POST http://localhost:3001/api/agent \
  -H 'Content-Type: application/json' \
  -d '{"message":"Create a task called Review algorithms, due 2026-10-23, taking 45 minutes, with high priority."}'
```

The response includes a session ID, the assistant's answer, tool events, and messages. To continue the same conversation, send that `sessionId` with the next request:

```bash
curl -X POST http://localhost:3001/api/agent \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"PASTE_SESSION_UUID_HERE","message":"I have 90 minutes available. Update my preferences and revise my plan."}'
```

Replace the placeholder with the actual session ID returned by the first request.

## Available agent tools

The model can request only registered tools, including:

- `list_tasks`
- `create_task`
- `update_task`
- `get_preferences`
- `update_preferences`
- `create_plan`
- `get_latest_plan`

Tool arguments are validated before execution. Unknown tool names and invalid arguments are rejected. The model cannot provide raw SQL, shell commands, or arbitrary JavaScript for execution.

## Scheduling behavior and limitations

- The scheduler uses application code to order tasks by deadline, then priority, then task ID.
- A task is not automatically split into multiple time blocks.
- Tasks that do not fit in the available schedule are reported as unscheduled.
- The available-time horizon is capped at midnight so displayed times do not silently wrap into the next day.
- The current prototype does not sync with Google Calendar or other external calendars.

## Run tests

From the backend package directory:

```bash
npm test
```

This runs the automated test suite. The tests use a mocked Groq client and an in-memory database where applicable, so they do not require a live Groq request.

To run only the dependency-free tool-loop tests with Node.js built-ins:

```bash
node --test test/tool-calling-loop.test.js
```

A live smoke test through `POST /api/agent` requires a valid Groq API key and consumes the account's quota. Check your limits before running it.

## Security notes

- The Groq API key must remain on the server.
- `.env` and local database files should not be committed.
- API request bodies are size-limited and validated.
- SQL queries use parameters rather than string-concatenating user input.
- CORS restricts allowed browser origins, but **CORS is not authentication**.
- The configured rate limiter is in-memory; it is not a distributed production rate limiter.
- **The prototype has no user authentication or per-user data isolation. Run it locally for the hackathon demo. Do not expose it as a public multi-user API without adding authentication, authorization, per-user data scoping, and appropriate rate limiting.**
- If Groq is unavailable or the account quota is exhausted, agent requests can fail; task and preference API endpoints do not depend on model inference.

## Hackathon context

ContextFlow is intended to be submitted under the **Alexa+ simulated web-experience** route for the Build, Ship, Shape: Amazon Developer Hackathon. It is a self-built simulation using a web interface and agentic workflow.

**ContextFlow is not an official Alexa+ integration.** It does not connect to an Amazon device, claim access to private-preview tools, or represent approval or endorsement by Amazon. Verify the current [official rules](https://amazonappdev2026.devpost.com/rules) and ensure the submitted application, repository, and demo satisfy the requirements in force when you submit.

## Roadmap

- [ ] Backend API and SQLite persistence
- [ ] Groq tool-calling loop with bounded execution
- [ ] Validated task, preference, and plan tools
- [ ] Automated tests using a mocked model client
- [ ] React/Vite frontend
- [ ] Connect the chat interface to `/api/agent`
- [ ] Display tasks, preferences, saved plans, and tool activity
- [ ] Record a public demo video under the hackathon's time limit
- [ ] Finalize the Devpost description and tool/product feedback

## License

See the repository's `LICENSE` file. Check that it is present at the repository root before publishing the complete project.

---

Built as a hackathon prototype. Contributions, issues, and feedback are welcome once the repository is published.
