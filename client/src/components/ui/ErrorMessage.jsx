export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(218, 54, 51, 0.1)",
        border: "1px solid var(--danger-color)",
        borderRadius: "var(--border-radius)",
        padding: "0.75rem 1rem",
        color: "#f85149",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        marginTop: "0.5rem",
      }}
    >
      <span>{error.message || String(error)}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--danger-color)",
            color: "#f85149",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
