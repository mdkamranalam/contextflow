import { useState, useEffect } from "react";
import { api } from "./services/api.js";
import AppHeader from "./components/layout/AppHeader.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ChatPanel from "./features/chat/ChatPanel.jsx";
import TaskList from "./features/tasks/TaskList.jsx";
import PreferencesForm from "./features/preferences/PreferencesForm.jsx";
import PlanPanel from "./features/plans/PlanPanel.jsx";
import ToolActivityLog from "./features/activity/ToolActivityLog.jsx";
import ErrorMessage from "./components/ui/ErrorMessage.jsx";

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toolEvents, setToolEvents] = useState([]);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err);
      setHealth(null);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAgentAction = (newEvents) => {
    if (newEvents && newEvents.length > 0) {
      const stampedEvents = newEvents.map((ev) => ({
        ...ev,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));
      setToolEvents((prev) => [...stampedEvents, ...prev]);
      triggerRefresh();
    }
  };

  return (
    <>
      <AppHeader health={health} />
      <main>
        {error && <ErrorMessage error={error} onRetry={fetchHealth} />}
        <AppLayout
          chat={<ChatPanel onAgentAction={handleAgentAction} />}
          activity={<ToolActivityLog events={toolEvents} />}
          tasks={
            <TaskList
              refreshTrigger={refreshKey}
              onTasksChanged={triggerRefresh}
            />
          }
          plan={<PlanPanel refreshTrigger={refreshKey} />}
          preferences={
            <PreferencesForm onPreferencesUpdated={triggerRefresh} />
          }
        />
      </main>
    </>
  );
}
