import { useEffect, useRef } from "react";

export default function MessageList({ messages, isThinking }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="chat-messages">
      {messages.length === 0 && (
        <div className="placeholder-message assistant">
          <strong>ContextFlow:</strong>
          <p>
            Hello! I am your context-aware productivity assistant. You can ask
            me to:
          </p>
          <ul
            style={{
              paddingLeft: "1.25rem",
              marginTop: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            <li>
              <em>
                "Create a task called Finish deck, due tomorrow, taking 45
                minutes, high priority."
              </em>
            </li>
            <li>
              <em>"What tasks do I have pending?"</em>
            </li>
            <li>
              <em>"I have 3 hours available today, help me plan my work."</em>
            </li>
          </ul>
        </div>
      )}

      {messages.map((msg, index) => (
        <div key={msg.id || index} className={`message-bubble ${msg.role}`}>
          <div className="message-header">
            <strong>{msg.role === "user" ? "You" : "ContextFlow"}</strong>
          </div>
          <div className="message-content">{msg.content}</div>
        </div>
      ))}

      {isThinking && (
        <div className="message-bubble assistant thinking">
          <div className="message-header">
            <strong>ContextFlow</strong>
          </div>
          <div className="thinking-dots">
            <span>Thinking and checking tools</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
