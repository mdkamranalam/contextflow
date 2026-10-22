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
    const error = new Error(
      "Cannot reach ContextFlow server. Is the backend running on port 3001?",
    );
    error.code = "NETWORK_ERROR";
    error.status = 0;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let errorMsg = data?.error?.message;

    if (!errorMsg) {
      if (response.status === 429) {
        errorMsg =
          "Request rate limit reached. Please wait a moment before trying again.";
      } else if (response.status === 503) {
        errorMsg =
          "AI inference service unavailable. Please check your GROQ_API_KEY in server/.env.";
      } else {
        errorMsg = `Server error (${response.status}): ${response.statusText}`;
      }
    }

    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code || `HTTP_${response.status}`;
    error.details = data?.error?.details;
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
