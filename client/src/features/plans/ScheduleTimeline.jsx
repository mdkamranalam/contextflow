const PRIORITY_COLORS = {
  urgent: "var(--danger-color)",
  high: "#f0883e",
  medium: "var(--accent-color)",
  low: "var(--text-muted)",
};

export default function ScheduleTimeline({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="placeholder-box">
        <p className="placeholder-text">
          No tasks could be scheduled within the available time.
        </p>
      </div>
    );
  }

  return (
    <div className="schedule-timeline">
      {items.map((item, index) => {
        if (item.type === "break") {
          return (
            <div key={`break_${index}`} className="timeline-block break-block">
              <span className="block-time">
                {item.startTime} – {item.endTime}
              </span>
              <span className="break-title">
                ☕ Rest Break ({item.durationMinutes}m)
              </span>
            </div>
          );
        }

        return (
          <div
            key={item.taskId || `task_${index}`}
            className="timeline-block task-block"
            style={{
              borderLeftColor:
                PRIORITY_COLORS[item.priority] || "var(--accent-color)",
            }}
          >
            <div className="block-header">
              <span className="block-time">
                {item.startTime} – {item.endTime}
              </span>
              <span
                className="priority-badge"
                style={{
                  borderColor:
                    PRIORITY_COLORS[item.priority] || "var(--border-color)",
                  color: PRIORITY_COLORS[item.priority] || "inherit",
                }}
              >
                {item.priority}
              </span>
            </div>
            <div className="block-body">
              <span className="block-task-title">{item.title}</span>
              <span className="meta-tag">{item.durationMinutes}m</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
