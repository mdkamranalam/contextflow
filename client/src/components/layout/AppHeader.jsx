export default function AppHeader({ health }) {
  const isHealthy = health?.ok && health?.database === "connected";

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>ContextFlow</h1>
        <span className="badge">Simulated Alexa+ Prototype</span>
      </div>
      <div className="header-status">
        <span
          className="status-dot"
          style={{
            backgroundColor: isHealthy
              ? "var(--success-color)"
              : "var(--danger-color)",
          }}
        ></span>
        <span className="status-label">
          {isHealthy ? "Backend Connected" : "Offline / Reconnecting"}
        </span>
      </div>
    </header>
  );
}
