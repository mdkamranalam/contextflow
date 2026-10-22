# ContextFlow

**An AI-powered, context-aware productivity assistant that turns natural-language requests into saved tasks and schedules.**

ContextFlow is a hackathon prototype demonstrating an Alexa+-style conversational and agentic experience using a web interface, Groq AI inference, registered application tools, persistent SQLite context, and a deterministic scheduling engine.

> **Hackathon Track:** Build, Ship, Shape: Amazon Developer Hackathon — **Alexa+ simulated web experience route**.  
> *Note: ContextFlow is a self-built simulated web application demonstrating conversational and agentic workflows. It does not use official private Alexa+ APIs, Amazon device integrations, or represent an official Amazon endorsement.*

---

## Key Features

- **Groq-Powered Agent:** Conversational reasoning using Groq Chat Completions with bounded multi-round tool calling.
- **Strictly Validated Tool Registry:** The model can only request registered application tools (`create_task`, `list_tasks`, `update_task`, `get_preferences`, `update_preferences`, `create_plan`, `get_latest_plan`).
- **Deterministic Scheduling:** Work schedules are calculated using pure JavaScript logic based on deadlines, priorities, and break buffers—never hallucinated by the LLM.
- **Explicit Overflow Tracking:** Tasks that cannot fit in the available time budget are never silently dropped; they are explicitly flagged in the Unscheduled Tasks view with the reason.
- **Persistent Context:** SQLite database persists tasks, preferences, plans, sessions, and messages across browser refreshes and server reboots.
- **Context-Aware Plan Revision:** Adjust your available time in natural language (e.g., *"I lost an hour today"*), and ContextFlow retrieves existing tasks, recalculates the schedule, and updates the plan.
- **Live Tool Audit Stream:** Every verified backend tool execution is rendered in real time with parameters, execution status, and timestamps.
- **Security by Design:** Parameterized SQL, Helmet HTTP security headers, CORS origin protection, JSON body limits, in-memory rate limiting, and server-side secret isolation.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS design tokens |
| **Backend** | Node.js (>= 20.11), Express 5 |
| **Database** | SQLite via `better-sqlite3` (WAL mode enabled) |
| **AI Inference** | Groq API (`openai/gpt-oss-20b` or account equivalent) |
| **Validation** | Zod schemas |
| **Security** | Helmet, CORS, `express-rate-limit` |
| **Testing** | Node.js built-in test runner (`node --test`) with mock inference |

---

## Architecture Overview

```text
Natural-Language Request (React Browser UI)
              │
              ▼ HTTP POST /api/agent (Vite proxy)
Express API Server (Node.js)
              │
              ▼ Bounded Tool-Calling Loop
Groq Chat Completions API
              │
              ▼ Tool Call Request (e.g. create_plan)
Zod Schema Validation & Dispatcher
              │
              ▼ Validated Function Execution
Deterministic Scheduler & SQLite Persistence
              │
              ▼ Tool Execution Result
Groq AI Formulates Final Conversational Answer
              │
              ▼ HTTP JSON Response
React UI Updates (Tasks, Timeline, Audit Log)
```

---

## Getting Started

### Prerequisites

- Node.js 20.11.0 or higher and npm.
- A free Groq API key from the [Groq Console](https://console.groq.com/keys).

### 1. Clone the Repository

```bash
git clone https://github.com/mdkamranalam/contextflow.git
cd contextflow
```

### 2. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and insert your Groq API key:

```dotenv
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/contextflow.db
MAX_TOOL_ROUNDS=4
APP_TIME_ZONE=Asia/Kolkata
```

Install backend dependencies and run tests:

```bash
npm install
npm test
```

Start the backend server:

```bash
npm run dev
```

The server listens at `http://localhost:3001`. Verify health at `http://localhost:3001/api/health`.

### 3. Start Frontend Application

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Automated Tests

Run the full backend test suite:

```bash
cd server
npm test
```

The test suite runs against in-memory SQLite and mock Groq clients, testing route validation, deterministic scheduling, and the bounded tool loop without consuming Groq quota.

---

## Core Demonstration Journey

1. **Create Tasks:** Create tasks manually via the **+ Add Task** button or conversationally: *"Create a task called Prepare presentation slides, due tomorrow, taking 60 minutes, with urgent priority."*
2. **Set Preferences:** Set your daily time budget (e.g. 180m), rest break duration (10m), and start hour (09:00).
3. **Generate Plan:** Ask the assistant: *"I have 3 hours available today, help me plan my work."* ContextFlow calls `create_plan` and displays the timeline.
4. **Test Persistence:** Refresh the browser; all messages, tasks, preferences, and the schedule reload intact from SQLite.
5. **Revise Plan:** Say: *"I lost an hour today. Reorganize my plan."* ContextFlow retrieves existing state without asking you to repeat tasks, recalculates the schedule, and moves overflow tasks to **Unscheduled Tasks**.

---