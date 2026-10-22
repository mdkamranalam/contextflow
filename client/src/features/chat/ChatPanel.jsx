import { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import ErrorMessage from "../../components/ui/ErrorMessage.jsx";

const SESSION_STORAGE_KEY = "contextflow_active_session_id";

export default function ChatPanel({ onAgentAction }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY) || null;
  });
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [failedPrompt, setFailedPrompt] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;
    const restoreSession = async () => {
      try {
        const data = await api.getSessionMessages(sessionId);
        if (isMounted && data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.warn("Could not restore previous session:", err);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        if (isMounted) setSessionId(null);
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setError(null);
    setFailedPrompt(null);

    try {
      const response = await api.sendMessage(text, sessionId);

      if (response?.sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
      }

      if (response?.answer) {
        const assistantMessage = {
          id: `asst_${Date.now()}`,
          role: "assistant",
          content: response.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      if (onAgentAction) {
        onAgentAction(response?.toolEvents || []);
      }
    } catch (err) {
      setError(err);
      setFailedPrompt(text);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = () => {
    if (failedPrompt) {
      // Remove the last failed user message so it doesn't duplicate
      setMessages((prev) => prev.slice(0, -1));
      handleSendMessage(failedPrompt);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setError(null);
    setFailedPrompt(null);
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

      {error && (
        <ErrorMessage
          error={error}
          onRetry={failedPrompt ? handleRetry : null}
        />
      )}

      <MessageInput onSendMessage={handleSendMessage} disabled={isThinking} />
    </div>
  );
}
