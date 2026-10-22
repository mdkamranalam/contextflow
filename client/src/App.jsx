import { useState, useEffect } from "react";
import { api } from "./services/api.js";
import LoadingIndicator from "./components/ui/LoadingIndicator.jsx";
import ErrorMessage from "./components/ui/ErrorMessage.jsx";

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      setError(err);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <>
      <header>
        <h1>ContextFlow</h1>
        <span className="badge">Simulated Alexa+ Prototype</span>
      </header>
      <main>
        <div className="welcome-card">
          <h2>Backend Connection Status</h2>
          <p>
            Verifying communication between React frontend and Express backend
            via the Vite proxy.
          </p>

          {loading && (
            <LoadingIndicator message="Connecting to ContextFlow backend..." />
          )}

          {error && <ErrorMessage error={error} onRetry={fetchHealth} />}

          {health && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div className="status-indicator">
                <span
                  className="status-dot"
                  style={{ backgroundColor: "var(--success-color)" }}
                ></span>
                <span>
                  Backend service: <strong>{health.service}</strong>
                </span>
              </div>
              <div className="status-indicator">
                <span
                  className="status-dot"
                  style={{ backgroundColor: "var(--success-color)" }}
                ></span>
                <span>
                  Database: <strong>{health.database}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
