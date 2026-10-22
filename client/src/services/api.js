const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    throw new Error(
      `Network error connecting to backend: ${networkError.message}`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg =
      data?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code || "UNKNOWN_ERROR";
    throw error;
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request("/health"),

  // Tasks
  getTasks: (includeCompleted = false) =>
    request(`/tasks${includeCompleted ? "?includeCompleted=true" : ""}`),
  createTask: (taskData) =>
    request("/tasks", { method: "POST", body: JSON.stringify(taskData) }),
  updateTask: (id, updates) =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),

  // Preferences
  getPreferences: () => request("/preferences"),
  updatePreferences: (prefs) =>
    request("/preferences", { method: "PUT", body: JSON.stringify(prefs) }),

  // Plans
  getLatestPlan: (date) =>
    request(`/plans/latest${date ? `?date=${encodeURIComponent(date)}` : ""}`),

  // Agent
  sendMessage: (message, sessionId) =>
    request("/agent", {
      method: "POST",
      body: JSON.stringify({ message, sessionId: sessionId || undefined }),
    }),

  // Sessions
  getSessionMessages: (sessionId) => request(`/sessions/${sessionId}/messages`),
};
