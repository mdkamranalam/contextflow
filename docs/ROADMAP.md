# ContextFlow — Detailed Product and Hackathon Roadmap

**Project:** ContextFlow  
**Primary track:** Alexa+ simulated web-experience route (subject to the current official rules)  
**Current stack:** React + Vite (frontend to build), Node.js + Express, Groq API, SQLite via `better-sqlite3`, Zod, Git/GitHub  
**Roadmap status:** Prepared 21 October 2026  
**Hackathon deadline listed by Devpost:** 23 October 2026, 12:00 p.m. Pacific Daylight Time (12:30 a.m. IST on 24 October 2026). Always re-check the official Devpost page before relying on a deadline.

> This document distinguishes the backend that currently exists from frontend and later-phase work. Do not treat a planned phase or file as implemented until the acceptance criteria have been met and tested.

## 1. Product goal and scope

ContextFlow is a context-aware productivity assistant. Users can create tasks, save scheduling preferences, ask an AI assistant to create or revise a daily plan, and retrieve the saved result later. The LLM interprets requests and requests tools; the backend validates and executes those tools; deterministic JavaScript scheduling logic decides what fits in the available time; SQLite persists the application data.

### Product outcome for the first complete demo

A reviewer should be able to:

1. Open the ContextFlow web interface.
2. Create a task with a title, deadline, duration, and priority.
3. Configure the amount of time available and break preferences.
4. Ask the assistant to create a plan.
5. See the assistant's real tool activity and the generated plan, including any unscheduled tasks.
6. Change a task or scheduling preference and ask the assistant to revise the plan.
7. Refresh the page or start a new conversation and still retrieve the saved tasks, preferences, and plan.
8. Understand how to run the project from the GitHub README.

### Explicit non-goals for the hackathon MVP

Do **not** attempt these before the primary workflow is complete:

- Multi-user accounts, OAuth, or production authentication.
- External calendar integration, email sending, push notifications, or integrations not already implemented.
- Autonomous background agents, cron jobs, distributed workers, or microservices.
- Payments, subscriptions, mobile apps, or a native Alexa Skill/MCP server.
- A production public deployment that exposes the current unauthenticated backend.
- Multiple model providers, model benchmarking, vector databases, RAG, or long-term semantic memory.
- Complex drag-and-drop scheduling or automatic splitting of tasks into multiple blocks.

These could be later enhancements, but they increase the amount of code and testing without being necessary to demonstrate the chosen MVP.

## 2. Current implementation baseline

The current backend package is `contextflow-backend/`. Its actual structure is:

```text
contextflow-backend/
├── src/
│   ├── agent/
│   │   ├── agent.js
│   │   └── tool-calling-loop.js
│   ├── db/
│   │   └── database.js
│   ├── lib/
│   │   ├── dates.js
│   │   ├── groq.js
│   │   └── validation.js
│   ├── services/
│   │   └── scheduler.js
│   ├── tools/
│   │   ├── definitions.js
│   │   └── executor.js
│   ├── app.js
│   └── server.js
├── test/
│   ├── agent.test.js
│   ├── app.test.js
│   └── tool-calling-loop.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The backend already defines these API routes:

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `GET /api/preferences`
- `PUT /api/preferences`
- `GET /api/plans/latest`
- `POST /api/agent`
- `GET /api/sessions/:sessionId/messages`

The backend stores tasks, preferences, plans, sessions, and messages in SQLite. Its tool-calling loop is bounded, its model tool arguments are validated, and the scheduler is deterministic. The current backend README documents the API payloads and setup.

**Not yet part of the current package:** the React/Vite frontend and its connected dashboard. The first major product milestone is to build that frontend against the existing endpoints rather than rewrite a working backend without cause.

## 3. Priority levels

| Priority | Meaning | Examples |
|---|---|---|
| **P0 — Must ship** | Required for a coherent, testable demo and submission | App starts, tasks persist, assistant calls tools, plan saves and displays, repository and video are submitted |
| **P1 — Important** | Improves reliability and clarity after P0 works | Empty states, request errors, responsive layout, saved session restoration, comprehensive tests |
| **P2 — Stretch** | Only if P0/P1 are complete and time remains | Extra visual polish, keyboard shortcuts, lightweight CI, optional charts or richer interaction |
| **Post-hackathon** | Do not attempt in the last-minute build unless a requirement changes | Authentication, per-user data isolation, production hosting, third-party calendars, real Alexa integration |

## 4. Architecture and data flow

```text
React + Vite browser UI
  ├── Chat / current session
  ├── Task list and task form
  ├── Preference editor
  ├── Saved plan timeline
  └── Tool activity and error states
           │ HTTP / JSON requests to /api/*
           ▼
Express API (Node.js)
  ├── Request validation (Zod)
  ├── Route handlers (currently in src/app.js)
  ├── Agent coordinator
  │     └── Groq Chat Completions
  │           └── allow-listed tool definitions
  │                 └── validated tool executor
  ├── Deterministic scheduling service
  └── SQLite persistence
```

Rules to preserve:

1. The Groq API key is stored only in `server/.env`; it never belongs in client code or any `VITE_*` variable.
2. The model can request only named, registered tools. The backend validates arguments and executes them.
3. The model cannot send SQL, shell commands, arbitrary JavaScript, or arbitrary URLs for execution.
4. Scheduling and time arithmetic are application logic, not unsupported assertions made by the LLM.
5. Display tool activity only when the backend reports it; do not animate fictional tool calls.
6. Persisted context in this MVP means database-backed tasks, preferences, plans, and conversation messages. Do not describe it as unlimited or semantic memory.
7. Since the current backend does not authenticate users or isolate their data, run it locally for the hackathon demonstration. Do not make it a public multi-user API in this state.

## 5. Phase-by-phase implementation plan

The phases below are ordered by dependency. Complete the acceptance criteria before starting the next phase. Time estimates are planning estimates, not guarantees; spend less time on optional design polish if a core integration is behind.

---

## Phase 0 — Freeze scope and set up the repository

**Priority:** P0  
**Estimated effort:** 45–60 minutes  
**Goal:** Avoid scope creep and establish one authoritative project repository.

### Tasks

1. Create or choose the main GitHub repository named `ContextFlow` or `contextflow`.
2. Keep the product name `ContextFlow`; `contextflow-backend` is a component/package name, not a different product name.
3. Put the current backend package in a root `server/` directory, preserving its `src/`, `test/`, `package.json`, `.env.example`, `.gitignore`, and backend README.
4. Put the main product README, MIT `LICENSE`, `FOLDER_STRUCTURE.md`, and this roadmap at the repository root.
5. Add a root `.gitignore` and verify that secrets, databases, dependencies, and generated build files are not staged.
6. Create a short P0 checklist and agree not to add features outside the MVP until it passes.

### Suggested root structure

```text
ContextFlow/
├── client/                 # React/Vite frontend to implement
├── server/                 # Existing backend package
├── docs/                   # Optional architecture/API/demo notes
├── .github/workflows/      # Optional CI after local tests pass
├── .gitignore
├── LICENSE
├── README.md
├── FOLDER_STRUCTURE.md
└── CONTEXTFLOW_ROADMAP.md
```

### Root `.gitignore` should exclude at least

```gitignore
# Secrets
.env
.env.*
!.env.example

# Dependencies and frontend build
node_modules/
client/dist/
coverage/
server/coverage/

# Runtime databases and SQLite sidecar files
server/data/
*.db
*.db-shm
*.db-wal

# Logs and OS files
*.log
.DS_Store
```

If the backend has an existing `.gitignore`, merge its relevant rules rather than deleting useful rules.

### Acceptance criteria

- The Git root is the complete ContextFlow repository.
- A `git status --short` review shows no `.env`, database, `node_modules`, or build output staged.
- The main product name and backend package name are used consistently.

---

## Phase 1 — Verify and baseline the backend

**Priority:** P0  
**Estimated effort:** 1.5–2.5 hours  
**Goal:** Know the backend works before the frontend depends on it.

### Tasks

1. Verify Node.js is at least the version required by the backend package (`20.11.0` or later).
2. Install dependencies from the backend directory with `npm install`.
3. Copy `.env.example` to `.env` and add the Groq key only to the backend environment file.
4. Confirm `.env` is ignored by Git before entering a real key.
5. Run `npm test` from the backend directory. If dependency installation is unavailable, run the documented dependency-free test separately, then repeat the full suite once dependencies are available.
6. Start the backend with `npm run dev`.
7. Call `GET /api/health` and confirm the server/database health response.
8. Exercise the task and preferences endpoints with `curl` or an API client.
9. Make one live `POST /api/agent` request only after the basic API works. This uses Groq quota; do not run repeated live requests as a substitute for mocked tests.

### Baseline commands

```bash
cd server
npm install
cp .env.example .env
npm test
npm run dev
```

In another terminal:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/tasks
curl http://localhost:3001/api/preferences
```

### Verify key payloads

Create a task:

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Review graph algorithms","deadline":"2026-10-23","estimatedMinutes":45,"priority":"high"}'
```

Update preferences:

```bash
curl -X PUT http://localhost:3001/api/preferences \
  -H 'Content-Type: application/json' \
  -d '{"availableMinutesPerDay":180,"preferredBreakMinutes":10,"dayStartHour":9}'
```

Request a plan through the agent:

```bash
curl -X POST http://localhost:3001/api/agent \
  -H 'Content-Type: application/json' \
  -d '{"message":"Create a daily plan for my unfinished tasks using my saved preferences."}'
```

### Acceptance criteria

- Backend starts without a runtime error.
- Health, task, and preference routes work.
- New task and preference values remain available after restarting the backend.
- Mocked automated tests pass in the local environment.
- A configured live agent request returns a session ID, an answer, and any actual tool events.
- Any failing test is understood and fixed; do not mark the phase done just because the server starts.

### If this phase fails

Do not build the UI around broken endpoints. Fix installation, native SQLite dependency, `.env`, model access, or schema issues first. Keep separate notes for backend errors and Groq/provider errors.

---

## Phase 2 — Create the React/Vite frontend foundation

**Priority:** P0  
**Estimated effort:** 1–2 hours  
**Goal:** Start the frontend cleanly and connect it to the backend origin.

### Tasks

1. Create the frontend from the repository root: `npm create vite@latest client -- --template react`.
2. Install dependencies with `cd client && npm install`.
3. Confirm the Vite application starts before replacing its starter contents.
4. Add `client/vite.config.js` proxy configuration for `/api` to `http://localhost:3001`.
5. Add a client `.env.example` only if needed. The only acceptable API configuration there is a public base URL, e.g. `VITE_API_BASE_URL=/api`. Never put a Groq key in the client.
6. Build a central API helper at `client/src/services/api.js` to send JSON requests, check HTTP status, parse the backend error format, and return typed-by-convention response values.
7. Add common loading, error, empty-state, and button components only when multiple screens need them.

### Files to create

```text
client/
├── src/
│   ├── components/layout/AppLayout.jsx
│   ├── components/ui/LoadingIndicator.jsx
│   ├── components/ui/ErrorMessage.jsx
│   ├── services/api.js
│   ├── styles/index.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

Do not create every file listed in the long-term folder structure upfront. Add files when the implementation actually needs them.

### Acceptance criteria

- Vite starts and renders the app.
- A frontend request to `/api/health` reaches Express through the proxy.
- API failures are presented as visible errors, not silently ignored.
- No API secret is present in client source or client environment files.

---

## Phase 3 — Build the application shell and dashboard layout

**Priority:** P0  
**Estimated effort:** 2–3 hours  
**Goal:** Create a coherent, usable interface before adding all behavior.

### Main layout

Use a restrained dashboard layout with four functional regions:

1. **Chat panel:** user input, message list, send button, loading state.
2. **Tasks panel:** unfinished tasks, priority, deadline, estimated duration, add/complete/edit controls.
3. **Plan panel:** saved plan for the selected/current date, scheduled blocks, and unscheduled tasks.
4. **Activity panel:** successful/failed tool events returned from the latest agent request.

The desktop layout may use a main chat area and a right-side task/plan column. On small screens, stack sections vertically rather than squeezing four narrow columns into the viewport.

### Tasks

- Define consistent spacing, typography, borders, and status styles in CSS variables.
- Give buttons visible hover, focus, disabled, and loading states.
- Ensure form labels are associated with inputs.
- Provide an empty state when no task or plan exists.
- Use semantic HTML and keyboard-accessible controls.
- Use realistic example data only through explicitly created seed tasks or the visible task form; do not present fake data as if it came from the backend.

### Acceptance criteria

- A reviewer can tell what ContextFlow does within a few seconds.
- The UI has clear chat, tasks, schedule, and activity areas.
- The app works at desktop and mobile-width viewports.
- Loading and empty states do not look like errors.

---

## Phase 4 — Connect task management end to end

**Priority:** P0  
**Estimated effort:** 2–3 hours  
**Goal:** Make task state real and persistent before adding agent-driven updates.

### Frontend files

```text
client/src/features/tasks/
├── TaskList.jsx
├── TaskItem.jsx
├── TaskForm.jsx
└── taskApi.js             # Optional; otherwise keep calls in services/api.js
```

### Implement

1. On initial render, call `GET /api/tasks` and show the returned `tasks` array.
2. Create a controlled form for title, deadline, estimated minutes, and priority.
3. Validate common errors in the UI for a better user experience, while treating backend validation as authoritative.
4. Submit with `POST /api/tasks`; append/reload the returned saved task only after success.
5. Implement editing/completion with `PATCH /api/tasks/:id`. The backend accepts partial fields, including `completed`.
6. Show a visible success/error state and prevent duplicate form submission while a request is pending.
7. Avoid local-only fake task mutations. On mutation failure, keep the server's real state and explain the error.

### Existing backend constraints to reflect in the UI

- Title: 1–160 characters after trimming.
- Deadline: a real date in `YYYY-MM-DD` format, or `null`.
- Estimated duration: integer from 5 to 600 minutes.
- Priority: `low`, `medium`, `high`, or `urgent`.

### Acceptance criteria

- Create, edit, and complete task interactions work through the API.
- Refreshing the page does not delete tasks.
- Invalid input displays a useful message.
- The UI uses returned task IDs and values; it does not generate IDs in the frontend.

---

## Phase 5 — Connect preferences

**Priority:** P0  
**Estimated effort:** 45–90 minutes  
**Goal:** Give the scheduler usable constraints.

### Frontend file

`client/src/features/preferences/PreferencesForm.jsx`

### Implement

1. Load preferences with `GET /api/preferences`.
2. Display available minutes per day, preferred break length, and day start hour.
3. Save changes through `PUT /api/preferences`.
4. Initialize the form from server data. Do not hardcode a value as if the user saved it.
5. Show validation errors and the saved value returned by the backend.
6. Explain that the current scheduler caps the available time at midnight and does not split a task into multiple blocks.

### Backend constraints

- Available minutes per day: 15–1440.
- Preferred break minutes: 0–60.
- Day start hour: 0–23.

### Acceptance criteria

- Preferences load from SQLite and can be updated through the UI.
- Values persist after refresh/restart.
- Saving preferences triggers a refresh or invalidation of the displayed plan when needed; do not leave stale plan data presented as current without indicating it.

---

## Phase 6 — Connect the chat and maintain session continuity

**Priority:** P0  
**Estimated effort:** 3–4 hours  
**Goal:** Show real Groq-backed tool use in the product.

### Frontend files

```text
client/src/features/chat/
├── ChatPanel.jsx
├── MessageList.jsx
├── MessageInput.jsx
└── chatApi.js               # Optional
```

### Request contract

`POST /api/agent` receives:

```json
{
  "message": "Create a plan for today's unfinished tasks.",
  "sessionId": "optional-existing-session-uuid"
}
```

Omit `sessionId` to create a new session. On success, the response includes `sessionId`, `answer`, `toolEvents`, and `messages`.

### Implement

1. Keep the current `sessionId` in frontend state after the first successful reply.
2. Send that ID with subsequent messages so the backend can continue the conversation.
3. Prevent overlapping sends from the same chat composer unless concurrent operation is intentionally implemented and handled.
4. Show a pending indicator while waiting; never fabricate a response before the API returns.
5. Render assistant text safely as text. Do not render raw HTML supplied by the model.
6. If the request fails, preserve the user's unsent or failed message so it can be retried.
7. Handle missing Groq configuration (503), provider/rate-limit errors, network failures, and invalid session IDs with a useful UI message.
8. Provide a “New conversation” action that clears the current session ID in the UI. Existing saved conversations remain in SQLite; a new conversation does not erase them.
9. If useful, restore a known session with `GET /api/sessions/:sessionId/messages`. Do not pretend the browser can recover an unknown session ID without storing it somewhere.

### Prompt/demo scenarios

Use known input values so the demo is reproducible:

- “Create a task called Review algorithms, due 2026-10-23, taking 45 minutes, with high priority.”
- “I have 180 minutes today, start at 09:00, with 10-minute breaks. Create a plan for my unfinished tasks.”
- “I now have only 90 minutes. Update my available time and make a new plan.”

If the model needs a task duration, it should ask the user instead of inventing it. Confirm that the actual API response demonstrates that behavior.

### Acceptance criteria

- A message returns an actual backend answer.
- The same session is continued when the returned UUID is reused.
- The agent's changes appear in the task/plan UI after the response.
- Failed requests are visible and do not masquerade as success.
- The client never contains the Groq API key.

---

## Phase 7 — Display saved plans and unscheduled tasks

**Priority:** P0  
**Estimated effort:** 2–3 hours  
**Goal:** Make the core outcome legible to users and judges.

### Frontend files

```text
client/src/features/plans/
├── PlanPanel.jsx
├── ScheduleTimeline.jsx
└── UnscheduledTasks.jsx
```

### Implement

1. Load the last plan with `GET /api/plans/latest`.
2. Treat HTTP 404 `PLAN_NOT_FOUND` as the normal no-plan empty state, not a fatal app error.
3. Display plan date, available time, used time, remaining time, scheduled tasks, breaks, and unscheduled tasks.
4. Visually distinguish a break entry from a task entry.
5. Display task start/end times and durations from the API response, not values recalculated independently in React.
6. Clearly show the reason attached to an unscheduled task.
7. After `POST /api/agent` completes, refresh tasks and the latest plan when relevant tools ran or when the response may have changed data.
8. If a preference/task is changed outside chat, make the UI clear that the previously saved plan may need regeneration.
9. Do not claim that the app checks an external calendar, knows a user's real calendar availability, or schedules tasks in the background.

### Acceptance criteria

- A saved plan appears after page refresh.
- Tasks that do not fit are visible rather than hidden.
- Break blocks and task blocks are distinguishable.
- The time total and displayed blocks do not contradict the backend payload.

---

## Phase 8 — Show real tool activity and trustworthy state changes

**Priority:** P1, but valuable for the judge demo  
**Estimated effort:** 1–2 hours  
**Goal:** Make the agentic workflow understandable rather than presenting a black box.

### Frontend file

`client/src/features/activity/ToolActivityLog.jsx`

### Implement

1. Read `toolEvents` from the latest `/api/agent` response.
2. For each event show the tool name, success/failure, and the summary returned by the backend.
3. If there are no events, display “No tools were called for this request” rather than inventing events.
4. Use neutral statuses and clear text; do not label every event “AI reasoning.”
5. Distinguish “request is processing” from actual completed operations.
6. Do not show raw stack traces, API keys, internal system prompts, or unfiltered provider error bodies.

### Acceptance criteria

- The activity list changes only when real backend response data changes.
- Tool failure appears as failure; it is never styled as a successful mutation.
- The judge can see that a request read or changed persistent application data.

---

## Phase 9 — Complete integration and failure-state handling

**Priority:** P0  
**Estimated effort:** 2–3 hours  
**Goal:** Make the entire demo resilient to common errors.

### Backend/frontend integration checks

- Frontend's `/api/health` request reaches port 3001 through Vite.
- Every request uses `Content-Type: application/json` when sending JSON.
- Error responses are parsed using the backend's `{ error: { code, message } }` shape.
- 404 for no saved plan is treated as empty state.
- 503 for missing Groq configuration gives a helpful message.
- 429/rate limits let the user know to wait and try later.
- A dropped network connection does not erase visible persisted records.
- Clicking send repeatedly does not create accidental concurrent chats.
- On agent success, refresh data that may have changed; on agent failure, do not display unconfirmed changes.
- The app shows a clear backend-unavailable message if Express has stopped.

### Acceptance criteria

- Each known failure has a user-visible recovery path.
- No success toast appears for failed requests.
- The core workflow still works after refresh.

---

## Phase 10 — Security and reliability review

**Priority:** P0 for submission hygiene; P1 for broader hardening  
**Estimated effort:** 1–2 hours  
**Goal:** Reduce avoidable failures without expanding scope.

### Checklist

1. Search tracked files for strings that resemble credentials; check `git diff --cached` and `git status` before every push.
2. Ensure `.env`, SQLite files, `node_modules`, and generated builds are excluded from Git.
3. Confirm no API key is referenced from frontend code.
4. Verify every model-callable tool is allow-listed and uses schema validation.
5. Ensure model-produced task titles or messages are treated as data, not trusted instructions.
6. Keep body-size and rate-limit middleware enabled for the local demo.
7. Keep SQL parameterized.
8. Do not open an unauthenticated server to the public internet. CORS is not authentication, and current state is not multi-user-safe.
9. Do not put private/personal user data in the demo database or video.
10. If the model fails, show a safe message and do not claim the task/plan was saved.

### Acceptance criteria

- A repository review reveals no API secrets or runtime database.
- No new public route allows arbitrary SQL/command execution.
- The app is demonstrated locally unless authentication/per-user data separation is deliberately implemented and tested.

---

## Phase 11 — Functional and regression testing

**Priority:** P0  
**Estimated effort:** 2–3 hours  
**Goal:** Verify the user journey, not just individual files.

### Automated tests

Run the backend's existing suite from `server/`:

```bash
npm test
```

Run the dependency-free agent loop test when diagnosing the loop independently:

```bash
node --test test/tool-calling-loop.test.js
```

Add frontend tests only if there is enough time to configure them responsibly; do not let test tooling consume the time needed for the working product and submission. Manual regression testing of the integrated app is mandatory even if automated tests pass.

### Manual acceptance matrix

| ID | Scenario | Expected result |
|---|---|---|
| T1 | Load app with empty database | Empty task and plan states display correctly. |
| T2 | Create a valid task | Server returns the saved task and it appears in the list. |
| T3 | Submit invalid duration or priority | Validation error is visible; no task is created. |
| T4 | Mark a task complete | Completed state persists after refresh and is excluded from default unfinished-task results. |
| T5 | Save scheduling preferences | Saved values are returned and survive refresh. |
| T6 | Ask agent to create a sufficiently specified task | Actual tool event indicates the operation result; task appears in UI. |
| T7 | Ask agent for a daily plan | Saved plan appears with scheduled and unscheduled items. |
| T8 | Use a time budget too small for all tasks | Unscheduled tasks and reasons are visible. |
| T9 | Change available time and regenerate | The new plan reflects persisted preferences. |
| T10 | Continue an existing session | The same session ID is sent and conversation continues. |
| T11 | Refresh the browser | Tasks, preferences, and saved plan reload from backend. |
| T12 | Stop backend while UI is open | User sees a recoverable API/network error. |
| T13 | Groq key missing or quota reached | Assistant request fails safely; no false success is shown. |
| T14 | Start a new conversation | The UI clears its current session ID without deleting existing records. |
| T15 | Inspect browser bundle and Git history | Groq key is not exposed or committed. |

### Acceptance criteria

- Every P0 scenario passes manually.
- Automated backend tests pass in the development environment.
- Known limitations are written down rather than concealed.

---

## Phase 12 — README, license, architecture notes, and setup verification

**Priority:** P0 for submission  
**Estimated effort:** 1.5–2 hours  
**Goal:** Allow a reviewer to understand and run the project without your help.

### Required repository content

- Main root `README.md` using “ContextFlow” as the product heading.
- `LICENSE` containing the MIT license if you choose MIT; replace the copyright placeholder with the correct name/holder before publishing.
- `server/README.md` for backend-specific setup (already present in the backend package).
- `.env.example` with placeholder values only.
- `FOLDER_STRUCTURE.md` and `CONTEXTFLOW_ROADMAP.md` if they remain useful to contributors.
- Exact commands to run backend and frontend in separate terminals.
- A summary of the environment variables and which side owns each variable.
- API route overview, test instructions, and known limitations.
- A clear status section distinguishing implemented behavior from planned features.
- A note that ContextFlow is a simulated Alexa+ web experience, not an official Alexa+ integration.

### Verify README instructions from a clean state

1. Read the README as if you were a new reviewer.
2. Confirm each command matches the actual folder name and `package.json` script.
3. Confirm port numbers agree: backend defaults to `3001`; Vite commonly uses `5173` unless configured otherwise.
4. Confirm `.env.example` has no secrets.
5. Have a teammate or use a fresh terminal to follow setup instructions.
6. Remove claims about features that have not been built or tested.

### Acceptance criteria

- Repository contains all code and assets required to run the submitted app.
- Public repository has a visible open-source license, if public.
- Documentation does not describe planned UI as already implemented.

---

## Phase 13 — Record the demonstration and prepare Devpost

**Priority:** P0, non-negotiable  
**Estimated effort:** 2–3 hours plus upload buffer  
**Goal:** Submit a coherent product that judges can evaluate.

### Demonstration script (aim for 2:15–2:45)

**0:00–0:15 — Problem and product**  
State that ContextFlow helps users turn tasks and time constraints into a saved daily plan.

**0:15–0:40 — Create real task data**  
Create a task through the UI. Show deadline, duration, and priority.

**0:40–1:05 — Configure preferences**  
Set daily available minutes, start hour, and break duration.

**1:05–1:40 — Demonstrate the agent**  
Ask the assistant to plan the unfinished tasks. Show real tool activity. Keep the response in the recorded browser view.

**1:40–2:05 — Show plan quality**  
Display task blocks, breaks, and any unscheduled tasks. Explain that the scheduler is deterministic and the LLM calls backend tools.

**2:05–2:30 — Show persistence and revision**  
Change the available time, regenerate the plan, and refresh the page to show saved data.

**2:30–2:45 — State the track and technology**  
Say this is a self-built web simulation for the Alexa+ simulated-experience route. Do not claim an official device integration.

Adapt timing to the actual working implementation. Do not show any step that fails reliably in rehearsals.

### Recording checklist

- Use screen recording and a clear microphone if narrating.
- Hide `.env`, terminal history containing credentials, personal data, and browser notifications.
- Use controlled sample tasks with realistic values.
- Close unrelated tabs and applications.
- Do a full rehearsal before recording.
- Keep the video under three minutes and in English.
- Upload to YouTube or Vimeo with public visibility and test the link in a private/incognito browser session.
- Ensure the video primarily shows the project actually working.

### Submission checklist

- Register/join the hackathon and complete all required Devpost form fields.
- Select the Alexa+ simulated web-experience route, if it remains the selected path and complies with the current rules.
- Provide the GitHub repository URL.
- Provide a descriptive feature/functionality summary.
- Provide the public demo video link.
- Write product feedback for each tool/API/SDK actually used: purpose, what worked, what needs improvement, onboarding experience, and whether you would use it again.
- Mention Groq, Express, SQLite, and frontend technologies accurately; do not claim that Groq itself is an Amazon developer tool.
- Explain pre-existing code and significant work completed during the hackathon window if applicable.
- If recording a friction log, document genuine problems, expected vs. observed behavior, severity, workaround, and a specific suggestion. Do not invent friction for a bonus.
- Re-open the completed submission and verify every URL.

### Hackathon-specific acceptance criteria

- The GitHub repository contains functional source and setup instructions.
- The submission video is publicly accessible and shorter than three minutes.
- Product feedback and track selection fields are completed.
- The app is described as a simulated experience, not a deployed official Alexa+ integration.
- The submission is entered before the deadline shown on the official Devpost page.

---

## Phase 14 — Post-hackathon improvements (do not block the submission)

Only work on these after the submission is safely completed and the judging-period requirements are understood.

### 14.1 Authentication and user data isolation

- Add authentication only after selecting and reviewing a suitable solution.
- Associate tasks, preferences, plans, sessions, and messages with a user identifier.
- Enforce ownership on every database query and mutation.
- Add tests proving one user cannot read or modify another user's records.
- Review key/session management, logout, account deletion, and secret handling.

**Reason:** the current backend is not safe for public multi-user exposure.

### 14.2 Database maintainability

- Add versioned SQLite migrations rather than relying on ad hoc schema changes.
- Add backup/export behavior and document data retention.
- Define indexes only where query patterns justify them.
- Add transactional behavior around multi-step mutations when needed.

### 14.3 Agent reliability and cost control

- Add timeouts and clear request cancellation behavior.
- Track latency, tool-loop rounds, and token usage without recording secrets.
- Review how duplicate/retried tool calls are handled.
- Add confirmation for consequential or destructive operations if future tools introduce them.
- Handle malformed provider output and provider model changes in tests.
- Monitor Groq free-tier limits; do not assume free quotas are permanent.

### 14.4 Scheduling improvements

- Add a test-driven policy for tasks with no deadline, equal deadlines, breaks, and tasks that cannot fit.
- Decide whether to support task splitting or multiple days before adding it.
- Provide explicit user control for schedule start hour and time zone.
- Show why each task was scheduled or left out.
- Consider conflict resolution when the user changes data after a plan was generated.

### 14.5 Product improvements

- Add search/filter for tasks if dataset size justifies it.
- Add plan history and compare revisions.
- Add keyboard accessibility and improved small-screen layout.
- Add user-controlled conversation retention and deletion.
- Add external calendar integration only after secure authentication and consent flows are designed.

### 14.6 Deployment and operations

Do not deploy the current unauthenticated backend as a public multi-user API. Before public deployment, implement authentication/data isolation, configure secrets in the host's secret manager, set CORS and rate limits appropriately, prevent public access to SQLite files, add health monitoring, and test restart/persistence behavior. Review hosting costs and free-tier limits before choosing a provider; this roadmap does not promise that any hosting service remains free.

### 14.7 Real Alexa+ integration (optional alternative future direction)

The current MVP is the simulated web-experience route. A real Agent Skill or self-hosted MCP implementation is a separate project scope with distinct requirements. If pursuing it later, re-read the official Alexa+ submission rules and current MCP transport/version requirements before choosing the architecture. Do not describe the current web simulation as an official integration.

---

## 6. Time-boxed hackathon execution plan

The listing currently states a deadline of **23 October 2026 at 12:00 p.m. PDT**, equivalent to **24 October 2026 at 12:30 a.m. IST**. When this roadmap was prepared on 21 October 2026, the remaining time was roughly 57 hours from mid-afternoon India time. Re-check the official listing for updates.

Use the following order rather than trying to finish every stretch feature:

| Work block | Target effort | Deliverable |
|---|---:|---|
| A. Scope, repo, backend baseline | 3 hours | Working backend and clean repository |
| B. Frontend scaffold and shell | 3 hours | Dashboard layout and API health check |
| C. Task CRUD and preferences | 4 hours | Real persistent tasks and saved preferences in UI |
| D. Agent chat and session state | 4 hours | Chat connected to `/api/agent`, session continuity |
| E. Plan and tool activity views | 4 hours | Saved schedule visible, unscheduled work shown, actual tool events displayed |
| F. Integration fixes and regression | 4 hours | Main user journey passes manual tests |
| G. README, license, repository audit | 2 hours | Reviewer can run project; no secrets committed |
| H. Demo, upload, Devpost | 3 hours | Public sub-3-minute video and completed submission |
| Protected buffer | 8–12 hours | Recovery from model/API/build/recording/upload problems |

These estimates total approximately 35–39 hours including buffer. If you fall behind, remove optional activity visuals and advanced polish first. Do not remove the saved-plan display, actual working tool flow, project setup instructions, or demo submission.

### Daily operating rule

At the start of each work block, write down one observable outcome. At the end, run the relevant test, commit the working state, and update the checklist. Avoid large uncommitted changes while switching between frontend, backend, and submission tasks.

### Suggested Git checkpoints

```text
chore: initialize ContextFlow monorepo
feat: add React dashboard shell
feat: connect task CRUD and preferences
feat: connect Groq assistant session
feat: display saved plans and tool activity
fix: handle API and provider errors
docs: finalize README and hackathon submission instructions
```

Use these as message examples only; adapt them to actual work included in each commit.

---

## 7. Definition of Done for the MVP

Do not call the MVP complete until every P0 item is true:

- [ ] Backend starts and the health endpoint responds.
- [ ] Backend automated tests pass locally.
- [ ] React frontend starts and reaches the backend.
- [ ] Tasks can be created, updated/completed, reloaded, and persisted.
- [ ] Preferences can be changed and reloaded.
- [ ] Chat sends messages to Groq through the backend only.
- [ ] The model can call validated tools and the app shows actual tool events.
- [ ] A deterministic plan can be saved and displayed.
- [ ] Unscheduled tasks are visible with their reason.
- [ ] Session continuation works with the backend's returned UUID.
- [ ] Refresh shows saved database state.
- [ ] Errors do not result in false success messages.
- [ ] `.env` and local databases are not committed.
- [ ] Root README and license are correct and not misleading.
- [ ] Public GitHub repository is accessible and licensed, if public.
- [ ] Public English demo video is less than three minutes.
- [ ] Devpost fields, track choice, repository URL, video URL, and product feedback are complete.

If a P0 item cannot be finished, document the limitation clearly and do not claim it works.

## 8. Free tooling and cost controls

- **Development:** Node.js, npm, React, Vite, Express, SQLite, Git, and GitHub's core repository functionality.
- **AI:** Groq API using the account's available free quota, where eligible. Check current limits and model availability. Hosted free inference may change or be rate-limited.
- **Testing:** Node's built-in test runner and the project's existing mocked Groq tests. Use live requests sparingly.
- **Demo recording:** built-in macOS screen recording or another already-installed free recorder.
- **Video hosting:** YouTube or Vimeo public link, subject to the provider's current account terms.
- **Deployment:** not required for the core local demo unless the current hackathon rules or your actual submission approach require it. Do not assume optional hosting is permanently free.

Avoid enabling paid cloud services or adding a payment method unless you explicitly choose to do so. Never make the project dependent on AWS credits; promotional credits and free tiers can expire or run out.

## 9. Official references

Verify requirements immediately before final submission:

- [Hackathon overview and current deadline](https://amazonappdev2026.devpost.com/)
- [Official rules and track-specific requirements](https://amazonappdev2026.devpost.com/rules)
- [Official FAQs](https://amazonappdev2026.devpost.com/details/faqs)
- [Official resources and developer links](https://amazonappdev2026.devpost.com/resources)
- [Groq model/tool-use documentation](https://console.groq.com/docs/tool-use/overview)
- [Groq rate limits](https://console.groq.com/docs/rate-limits)
- [Vite getting started](https://vite.dev/guide/)
- [Express documentation](https://expressjs.com/)

**Final guiding principle:** build one end-to-end workflow that works reliably, then document and demonstrate it honestly. Do not add technology or features just to make the architecture look larger.
