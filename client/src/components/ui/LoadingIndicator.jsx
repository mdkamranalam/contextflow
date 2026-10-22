export default function LoadingIndicator({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
      <span className="status-dot" style={{ backgroundColor: 'var(--accent-color)', animation: 'pulse 1.5s infinite' }}></span>
      <span>{message}</span>
    </div>
  );
}
