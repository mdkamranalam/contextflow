export default function ToolActivityLog() {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Agent Tool Activity</h2>
        <span className="badge">Audit Stream</span>
      </div>
      <div className="placeholder-box">
        <p className="placeholder-text">
          Validated backend tool executions (create_task, create_plan, etc.)
          will log here (Phase 11).
        </p>
      </div>
    </div>
  );
}
