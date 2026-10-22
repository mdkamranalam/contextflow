import { useState } from "react";
import { api } from "../../services/api.js";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import ErrorMessage from "../../components/ui/ErrorMessage.jsx";

export default function ChatPanel({ onAgentAction }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setError(null);

    try {
      const response = await api.sendMessage(text, sessionId);

      if (response?.sessionId) {
        setSessionId(response.sessionId);
      }

      if (response?.answer) {
        const assistantMessage = {
          id: `asst_${Date.now()}`,
          role: "assistant",
          content: response.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Notify parent about tool events so tasks/plans can refresh
      if (onAgentAction) {
        onAgentAction(response?.toolEvents || []);
      }
    } catch (err) {
      setError(err);
      // Remove failed message or allow retry
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  return (
    <div className="card chat-panel">
      <div className="card-header">
        <div className="header-title-group">
          <h2>Assistant Conversation</h2>
          {sessionId && (
            <span className="badge" title={`Session ID: ${sessionId}`}>
              Session: {sessionId.slice(0, 8)}...
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleNewConversation}
          disabled={isThinking}
        >
          New Chat
        </button>
      </div>

      <MessageList messages={messages} isThinking={isThinking} />

      {error && <ErrorMessage error={error} />}

      <MessageInput onSendMessage={handleSendMessage} disabled={isThinking} />
    </div>
  );
}
