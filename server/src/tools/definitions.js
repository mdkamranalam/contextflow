export const registeredToolDefinitions = [
  {
    type: "function",
    function: {
      name: "list_tasks",
      description:
        "List current tasks in the system. Can filter to include completed tasks.",
      parameters: {
        type: "object",
        properties: {
          includeCompleted: {
            type: "boolean",
            description:
              "Set to true to include completed tasks. Defaults to false.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description:
        "Create a new task with title, deadline, estimated duration in minutes, and priority.",
      parameters: {
        type: "object",
        required: ["title", "estimatedMinutes"],
        properties: {
          title: {
            type: "string",
            description: "Task title (1-160 characters)",
          },
          deadline: {
            type: "string",
            description: "Due date in YYYY-MM-DD format (or null)",
          },
          estimatedMinutes: {
            type: "integer",
            description: "Duration in minutes (5 to 600)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
            description: "Task priority level",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update an existing task by its ID.",
      parameters: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string", description: "The unique task ID" },
          title: { type: "string", description: "Updated title" },
          deadline: {
            type: "string",
            description: "Updated deadline YYYY-MM-DD",
          },
          estimatedMinutes: {
            type: "integer",
            description: "Updated estimated minutes",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
          },
          completed: {
            type: "boolean",
            description: "Mark task complete or incomplete",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_preferences",
      description:
        "Retrieve current scheduling preferences (available minutes, break duration, day start hour).",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_preferences",
      description: "Update scheduling preferences.",
      parameters: {
        type: "object",
        properties: {
          availableMinutesPerDay: {
            type: "integer",
            description: "Daily minutes available (15-1440)",
          },
          preferredBreakMinutes: {
            type: "integer",
            description: "Break duration between tasks (0-60)",
          },
          dayStartHour: {
            type: "integer",
            description: "Start hour of day (0-23)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_plan",
      description:
        "Calculate and persist a deterministic schedule for unfinished tasks using saved preferences.",
      parameters: {
        type: "object",
        properties: {
          planDate: {
            type: "string",
            description: "Date in YYYY-MM-DD format. Defaults to today.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_latest_plan",
      description: "Retrieve the most recently saved schedule plan.",
      parameters: {
        type: "object",
        properties: {
          planDate: {
            type: "string",
            description: "Optional specific date in YYYY-MM-DD format.",
          },
        },
      },
    },
  },
];
