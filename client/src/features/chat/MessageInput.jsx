import { useState } from "react";

export default function MessageInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a request (e.g. 'Plan my day' or 'Add task...') & press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={2000}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || !input.trim()}
      >
        Send
      </button>
    </form>
  );
}
