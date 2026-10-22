export default function ChatPanel() {
  return (
    <div className="card chat-panel">
      <div className="card-header">
        <h2>Assistant Conversation</h2>
        <span className="badge">Natural Language Planner</span>
      </div>
      <div className="chat-messages placeholder-box">
        <div className="placeholder-message assistant">
          <strong>ContextFlow:</strong>
          <p>
            Hello! I can help you organize tasks and generate a daily plan. Tell
            me what you need to work on or say:
            <em> "I have 3 hours available today, help me plan my tasks."</em>
          </p>
        </div>
      </div>
      <form className="chat-input-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Ask ContextFlow to create tasks, update preferences, or plan your day..."
          disabled
        />
        <button type="submit" className="btn btn-primary" disabled>
          Send
        </button>
      </form>
    </div>
  );
}
