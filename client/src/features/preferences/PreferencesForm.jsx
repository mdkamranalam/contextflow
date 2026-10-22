import { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import LoadingIndicator from "../../components/ui/LoadingIndicator.jsx";
import ErrorMessage from "../../components/ui/ErrorMessage.jsx";

export default function PreferencesForm({ onPreferencesUpdated }) {
  const [availableMinutes, setAvailableMinutes] = useState(180);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [startHour, setStartHour] = useState(9);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPreferences();
      if (data?.preferences) {
        setAvailableMinutes(data.preferences.available_minutes_per_day);
        setBreakMinutes(data.preferences.preferred_break_minutes);
        setStartHour(data.preferences.day_start_hour);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      availableMinutesPerDay: parseInt(availableMinutes, 10),
      preferredBreakMinutes: parseInt(breakMinutes, 10),
      dayStartHour: parseInt(startHour, 10),
    };

    try {
      const data = await api.updatePreferences(payload);
      if (data?.preferences) {
        setAvailableMinutes(data.preferences.available_minutes_per_day);
        setBreakMinutes(data.preferences.preferred_break_minutes);
        setStartHour(data.preferences.day_start_hour);
        setSuccessMsg("Preferences saved to database");
        setTimeout(() => setSuccessMsg(null), 3000);
        if (onPreferencesUpdated) onPreferencesUpdated();
      }
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card preferences-panel">
      <div className="card-header">
        <h2>Scheduling Preferences</h2>
        <span className="badge">Saved Constraints</span>
      </div>

      {loading && <LoadingIndicator message="Loading preferences..." />}

      {error && <ErrorMessage error={error} onRetry={fetchPreferences} />}

      {!loading && (
        <form className="preferences-form" onSubmit={handleSubmit}>
          {successMsg && <div className="success-banner">{successMsg}</div>}

          <div className="pref-row">
            <div className="pref-info">
              <label>Daily Available Time</label>
              <span className="pref-hint">
                Total minutes you can allocate today (15–1440)
              </span>
            </div>
            <div className="pref-input-wrapper">
              <input
                type="number"
                min={15}
                max={1440}
                step={15}
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(e.target.value)}
                required
              />
              <span className="unit-label">
                mins ({(availableMinutes / 60).toFixed(1)}h)
              </span>
            </div>
          </div>

          <div className="pref-row">
            <div className="pref-info">
              <label>Break Duration</label>
              <span className="pref-hint">
                Rest buffer inserted between scheduled tasks (0–60)
              </span>
            </div>
            <div className="pref-input-wrapper">
              <input
                type="number"
                min={0}
                max={60}
                step={5}
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                required
              />
              <span className="unit-label">mins</span>
            </div>
          </div>

          <div className="pref-row">
            <div className="pref-info">
              <label>Day Start Hour</label>
              <span className="pref-hint">
                Time of day to start schedule (0–23, 24-hr clock)
              </span>
            </div>
            <div className="pref-input-wrapper">
              <input
                type="number"
                min={0}
                max={23}
                step={1}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                required
              />
              <span className="unit-label">
                :00 ({String(startHour).padStart(2, "0")}:00)
              </span>
            </div>
          </div>

          <div className="pref-footer">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
