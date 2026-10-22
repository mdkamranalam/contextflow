import { useState } from "react";

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onTaskCreated({
        title: title.trim(),
        deadline: deadline || null,
        estimatedMinutes: parseInt(estimatedMinutes, 10),
        priority,
      });
      setTitle("");
      setDeadline("");
      setEstimatedMinutes(30);
      setPriority("medium");
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <input
          type="text"
          placeholder="Task title (e.g. Prepare presentation slides)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          required
        />
      </div>
      <div className="form-row inline-fields">
        <div className="form-field">
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Duration (mins)</label>
          <input
            type="number"
            min={5}
            max={600}
            step={5}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
}
