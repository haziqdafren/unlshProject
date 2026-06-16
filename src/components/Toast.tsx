import { useEffect, useRef } from 'react';
import { useToast, type Toast, type ToastVariant } from '@/context/ToastContext';

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const V: Record<ToastVariant, { bg: string; accent: string; icon: string }> = {
  success: { bg: '#1e2a1e', accent: '#7ab87a', icon: '✓' },
  error:   { bg: '#2a1a1a', accent: '#c0704a', icon: '✕' },
  info:    { bg: '#1A1A1A', accent: '#D9CFBB', icon: '·' },
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = V[t.variant];

  useEffect(() => {
    const id = requestAnimationFrame(() => ref.current?.classList.add('toast-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      ref={ref}
      role={t.variant === 'error' ? 'alert' : 'status'}
      aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="toast-item"
      style={{
        background: v.bg,
        border: `1px solid ${v.accent}22`,
        borderLeft: `3px solid ${v.accent}`,
        borderRadius: '3px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        minWidth: '260px',
        maxWidth: '380px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: v.accent, flexShrink: 0, marginTop: '1px', fontWeight: 700 }} aria-hidden="true">
        {v.icon}
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#F5F5F0', lineHeight: 1.5, letterSpacing: '0.01em', flex: 1 }}>
        {t.message}
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,245,240,0.35)', padding: '0 0 0 4px', fontSize: '16px', lineHeight: 1, flexShrink: 0, transition: `color 150ms ${EASE}` }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,245,240,0.8)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,245,240,0.35)')}>
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();
  return (
    <>
      <style>{`
        .toast-item { opacity: 0; transform: translateX(16px); transition: opacity 280ms ${EASE}, transform 280ms ${EASE}; }
        .toast-in   { opacity: 1; transform: translateX(0); }
        @media (prefers-reduced-motion: reduce) { .toast-item { transition: none; } }
      `}</style>
      <div aria-label="Notifications" style={{ position: 'fixed', bottom: 'clamp(16px,3vw,32px)', right: 'clamp(16px,3vw,32px)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: toasts.length ? 'auto' : 'none' }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </>
  );
}
