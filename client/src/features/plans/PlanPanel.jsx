import { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import ScheduleTimeline from "./ScheduleTimeline.jsx";
import UnscheduledTasks from "./UnscheduledTasks.jsx";
import LoadingIndicator from "../../components/ui/LoadingIndicator.jsx";
import ErrorMessage from "../../components/ui/ErrorMessage.jsx";

export default function PlanPanel({ refreshTrigger }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLatestPlan();
      setPlan(data?.plan || null);
    } catch (err) {
      if (err.status === 404 || err.code === "PLAN_NOT_FOUND") {
        setPlan(null); // Normal empty state
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [refreshTrigger]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await api.sendMessage(
        "Create a plan for my unfinished tasks.",
        undefined,
      );
      // Wait briefly for SQLite write then fetch latest
      await fetchPlan();
    } catch (err) {
      setError(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card plan-panel">
      <div className="card-header">
        <div className="header-title-group">
          <h2>Daily Schedule Plan</h2>
          {plan && (
            <span className="badge">{plan.plan_date || plan.planDate}</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleGeneratePlan}
          disabled={loading || generating}
        >
          {generating
            ? "Calculating..."
            : plan
              ? "Regenerate Plan"
              : "Generate Plan"}
        </button>
      </div>

      {loading && <LoadingIndicator message="Loading saved plan..." />}

      {error && <ErrorMessage error={error} onRetry={fetchPlan} />}

      {!loading && !plan && (
        <div className="placeholder-box">
          <p className="placeholder-text">
            No plan created yet. Click <strong>Generate Plan</strong> above or
            ask ContextFlow in the chat:
            <em> "Plan my work for today"</em>.
          </p>
        </div>
      )}

      {!loading && plan && (
        <>
          <div className="plan-stats-bar">
            <div className="stat-pill">
              <span className="stat-label">Budget</span>
              <span className="stat-value">
                {plan.available_minutes || plan.availableMinutes}m
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Used</span>
              <span
                className="stat-value"
                style={{ color: "var(--accent-color)" }}
              >
                {plan.used_minutes || plan.usedMinutes}m
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Remaining</span>
              <span
                className="stat-value"
                style={{ color: "var(--success-color)" }}
              >
                {plan.remaining_minutes ?? plan.remainingMinutes}m
              </span>
            </div>
          </div>

          <ScheduleTimeline
            items={plan.scheduled_tasks || plan.scheduledTasks}
          />

          <UnscheduledTasks
            tasks={plan.unscheduled_tasks || plan.unscheduledTasks}
          />
        </>
      )}
    </div>
  );
}
