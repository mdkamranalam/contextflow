const PRIORITY_COLORS = {
  urgent: "var(--danger-color)",
  high: "#f0883e",
  medium: "var(--accent-color)",
  low: "var(--text-muted)",
};

export default function TaskItem({ task, onToggleComplete }) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-item-left">
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={() => onToggleComplete(task.id, !task.completed)}
          title={task.completed ? "Mark incomplete" : "Mark completed"}
        />
        <div className="task-info">
          <span className="task-title">{task.title}</span>
          <div className="task-meta">
            {task.deadline && (
              <span className="meta-tag">Due: {task.deadline}</span>
            )}
            <span className="meta-tag">{task.estimated_minutes}m</span>
          </div>
        </div>
      </div>
      <div className="task-item-right">
        <span
          className="priority-badge"
          style={{
            borderColor:
              PRIORITY_COLORS[task.priority] || "var(--border-color)",
            color: PRIORITY_COLORS[task.priority] || "inherit",
          }}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}
