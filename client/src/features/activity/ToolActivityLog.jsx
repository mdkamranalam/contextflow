const TOOL_ICONS = {
  create_task: "📝",
  list_tasks: "📋",
  update_task: "✏️",
  get_preferences: "⚙️",
  update_preferences: "🔧",
  create_plan: "🗓️",
  get_latest_plan: "🔍",
};

export default function ToolActivityLog({ events = [] }) {
  return (
    <div className="card activity-panel">
      <div className="card-header">
        <div className="header-title-group">
          <h2>Agent Tool Activity</h2>
          <span className="badge">
            {events.length > 0
              ? `${events.length} operation${events.length > 1 ? "s" : ""}`
              : "Live Audit"}
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="placeholder-box">
          <p className="placeholder-text">
            No tool executions yet. When ContextFlow performs actions (such as
            reading tasks, adjusting preferences, or calculating plans), the
            verified backend operations will appear here.
          </p>
        </div>
      ) : (
        <div className="activity-list">
          {events.map((event, index) => {
            const icon = TOOL_ICONS[event.tool] || "⚡";
            const isSuccess = event.success !== false;

            return (
              <div
                key={`event_${index}`}
                className={`activity-item ${isSuccess ? "success" : "failed"}`}
              >
                <div className="activity-item-main">
                  <span className="activity-icon">{icon}</span>
                  <div className="activity-details">
                    <div className="activity-tool-header">
                      <span className="tool-name-tag">{event.tool}</span>
                      <span
                        className={`status-pill ${isSuccess ? "success" : "failed"}`}
                      >
                        {isSuccess ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="activity-summary">
                      {event.summary ||
                        (isSuccess
                          ? `Executed ${event.tool}`
                          : event.error || "Execution failed")}
                    </span>
                  </div>
                </div>
                <span className="activity-timestamp">
                  {event.timestamp || "Just now"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
