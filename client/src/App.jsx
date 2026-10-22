import React from "react";

export default function App() {
  return (
    <>
      <header>
        <h1>ContextFlow</h1>
        <span className="badge">Simulated Alexa+ Prototype</span>
      </header>
      <main>
        <div className="welcome-card">
          <h2>Frontend Initialized</h2>
          <p>
            ContextFlow productivity assistant dashboard will be constructed
            here.
          </p>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Phase 2: React + Vite app ready</span>
          </div>
        </div>
      </main>
    </>
  );
}
