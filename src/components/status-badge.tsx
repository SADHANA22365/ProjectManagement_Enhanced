type StatusBadgeProps = {
  status: string;
};

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  "In Progress": { bg: "var(--accent-soft)", color: "var(--accent)", dot: "#2563eb", label: "In Progress" },
  "Completed": { bg: "var(--success-soft)", color: "var(--success)", dot: "#059669", label: "Completed" },
  "Delayed": { bg: "var(--warning-soft)", color: "var(--warning)", dot: "#d97706", label: "Delayed" },
  "To Do": { bg: "var(--surface-3)", color: "var(--muted)", dot: "#6b7a96", label: "To Do" },
  "Cancelled": { bg: "var(--danger-soft)", color: "var(--danger)", dot: "#dc2626", label: "Cancelled" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["To Do"];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.65rem',
      borderRadius: 999,
      fontSize: '0.75rem',
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
      {config.label}
    </span>
  );
}
