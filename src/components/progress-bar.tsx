interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export default function ProgressBar({ value, showLabel = true, size = 'md', color = 'blue' }: ProgressBarProps) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const heights: Record<string, string> = { sm: '4px', md: '6px', lg: '8px' };
  const gradients: Record<string, string> = {
    blue: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    green: 'linear-gradient(90deg, #059669, #34d399)',
    yellow: 'linear-gradient(90deg, #d97706, #fbbf24)',
    red: 'linear-gradient(90deg, #dc2626, #f87171)',
  };

  const getColor = () => {
    if (safeValue === 100) return 'green';
    if (safeValue >= 70) return color;
    if (safeValue >= 40) return color;
    return color;
  };
  const actualColor = color === 'blue' ? getColor() : color;

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>Progress</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: safeValue === 100 ? 'var(--success)' : safeValue >= 70 ? 'var(--accent)' : 'var(--text)',
          }}>
            {safeValue}%
          </span>
        </div>
      )}
      <div style={{
        height: heights[size],
        background: 'var(--surface-3)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${safeValue}%`,
          background: gradients[actualColor],
          borderRadius: 999,
          transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}>
          {safeValue > 5 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
