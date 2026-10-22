export default function UnscheduledTasks({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="unscheduled-section">
      <div className="unscheduled-header">
        <h3>Unscheduled Tasks ({tasks.length})</h3>
        <span className="pref-hint">
          Could not fit into the available time budget
        </span>
      </div>
      <div className="unscheduled-list">
        {tasks.map((task) => (
          <div key={task.taskId} className="unscheduled-item">
            <div className="unscheduled-info">
              <span className="task-title">{task.title}</span>
              <span className="unscheduled-reason">
                {task.reason} ({task.durationMinutes}m)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
