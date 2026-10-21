## 1. Recommended project structure

```
ContextFlow/
├── client/                              # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.jsx
│   │   │   │   └── AppLayout.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── LoadingIndicator.jsx
│   │   │       └── ErrorMessage.jsx
│   │   ├── features/
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   └── MessageInput.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.jsx
│   │   │   │   ├── TaskItem.jsx
│   │   │   │   └── TaskForm.jsx
│   │   │   ├── preferences/
│   │   │   │   └── PreferencesForm.jsx
│   │   │   ├── plans/
│   │   │   │   ├── PlanPanel.jsx
│   │   │   │   ├── ScheduleTimeline.jsx
│   │   │   │   └── UnscheduledTasks.jsx
│   │   │   └── activity/
│   │   │       └── ToolActivityLog.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useAgent.js
│   │   ├── utils/
│   │   │   └── formatDate.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Existing contextflow-backend
│   ├── src/
│   │   ├── agent/
│   │   │   ├── agent.js
│   │   │   └── tool-calling-loop.js
│   │   ├── db/
│   │   │   └── database.js
│   │   ├── lib/
│   │   │   ├── dates.js
│   │   │   ├── groq.js
│   │   │   └── validation.js
│   │   ├── services/
│   │   │   └── scheduler.js
│   │   ├── tools/
│   │   │   ├── definitions.js
│   │   │   └── executor.js
│   │   ├── app.js
│   │   └── server.js
│   ├── test/
│   │   ├── agent.test.js
│   │   ├── app.test.js
│   │   └── tool-calling-loop.test.js
│   ├── data/                            # Local SQLite database
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   └── demo-script.md
│
├── .github/
│   └── workflows/
│       └── test.yml                     # Optional CI
│
├── .gitignore
├── LICENSE
├── README.md                            # Main project README
└── FOLDER_STRUCTURE.md
```

Important: The backend files listed above already exist in your backend package. The frontend and documentation directories are planned additions; the tree does not mean those components have already been implemented.

## 2. Responsibility of each major directory

| Directory                          | Responsibility                                                  |
| ---------------------------------- | --------------------------------------------------------------- |
| `client/src/features/chat/`        | Chat interface and conversation state                           |
| `client/src/features/tasks/`       | Create, view, edit, and complete tasks                          |
| `client/src/features/preferences/` | Manage available time and scheduling preferences                |
| `client/src/features/plans/`       | Display generated schedules and unscheduled tasks               |
| `client/src/features/activity/`    | Show actual tool executions reported by the backend             |
| `client/src/services/`             | Communicate with the Express API                                |
| `server/src/agent/`                | Coordinate Groq requests and the bounded tool-calling loop      |
| `server/src/tools/`                | Define available tools and validate/execute their operations    |
| `server/src/services/`             | Implement scheduling and other business logic                   |
| `server/src/db/`                   | SQLite tables and persistent database operations                |
| `server/src/lib/`                  | Shared validation, date utilities, and Groq initialization      |
| `server/test/`                     | Automated backend tests                                         |
| `docs/`                            | Architecture, API documentation, and demonstration instructions |

## 3. Three implementation decisions to follow

First, keep `app.js` as it is for now. Your current backend registers its Express routes in `server/src/app.js`. There is no need to split it into separate route and controller files just to match the proposed structure. Refactor only when there is a practical reason.

Second, separate frontend features by responsibility. Keep chat, tasks, preferences, plans, and activity-log components in their respective directories. This will make the frontend easier to extend without creating one oversized `App.jsx`.

Third, protect your secrets and generated data. Keep the Groq API key in `server/.env`, never in frontend environment variables. Exclude `.env`, `node_modules/`, build output, and local SQLite database files from Git.

For the hackathon, implement the core workflow first: create tasks → use Groq tool calling → generate and save a plan → display it in React → revise it using persisted context. Add optional documentation and CI files after that workflow works reliably.