export default function AppLayout({
  chat,
  tasks,
  preferences,
  plan,
  activity,
}) {
  return (
    <div className="dashboard-grid">
      <section className="dashboard-main">
        {chat}
        {activity}
      </section>
      <aside className="dashboard-sidebar">
        {tasks}
        {plan}
        {preferences}
      </aside>
    </div>
  );
}
