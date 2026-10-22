import { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import TaskForm from "./TaskForm.jsx";
import TaskItem from "./TaskItem.jsx";
import LoadingIndicator from "../../components/ui/LoadingIndicator.jsx";
import ErrorMessage from "../../components/ui/ErrorMessage.jsx";

export default function TaskList({ refreshTrigger, onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(includeCompleted);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [includeCompleted, refreshTrigger]);

  const handleCreateTask = async (taskData) => {
    const res = await api.createTask(taskData);
    if (res?.task) {
      setTasks((prev) => [res.task, ...prev]);
      setShowAddForm(false);
      if (onTasksChanged) onTasksChanged();
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await api.updateTask(id, { completed });
      if (res?.task) {
        if (!includeCompleted && completed) {
          setTasks((prev) => prev.filter((t) => t.id !== id));
        } else {
          setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
        }
        if (onTasksChanged) onTasksChanged();
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="card task-panel">
      <div className="card-header">
        <div className="header-title-group">
          <h2>Tasks</h2>
          <span className="badge">
            {tasks.length} {includeCompleted ? "total" : "active"}
          </span>
        </div>
        <div className="header-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
            />
            Show done
          </label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>
      </div>

      {showAddForm && <TaskForm onTaskCreated={handleCreateTask} />}

      {error && <ErrorMessage error={error} onRetry={fetchTasks} />}

      {loading && <LoadingIndicator message="Loading tasks from database..." />}

      {!loading && tasks.length === 0 && (
        <div className="placeholder-box">
          <p className="placeholder-text">
            No {includeCompleted ? "" : "pending"} tasks found. Click{" "}
            <strong>+ Add Task</strong> above or ask the assistant to create
            one.
          </p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="task-list-items">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
