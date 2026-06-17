import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const C = {
  dark900:     '#1A1A1A',
  tan:         '#D9CFBB',
  tanHover:    '#c4b9a4',
  onDark:      '#F5F5F0',
  onDarkMuted: 'rgba(245,245,240,0.50)',
  onDarkFaint: 'rgba(245,245,240,0.25)',
  borderDark:  'rgba(245,245,240,0.10)',
  borderFocus: 'rgba(245,245,240,0.55)',
  errorRed:    '#c0704a',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${C.borderDark}`,
  borderRadius: 0,
  padding: '12px 0',
  fontFamily: 'var(--font-sans)',
  fontSize: '16px',
  color: C.onDark,
  outline: 'none',
  caretColor: C.tan,
  lineHeight: 1.5,
  WebkitAppearance: 'none',
  appearance: 'none',
  transition: `border-color 250ms ${EASE}`,
};

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const panelRef  = useRef<HTMLDivElement>(null);
  const formRef   = useRef<HTMLFormElement>(null);
  const emailRef  = useRef<HTMLInputElement>(null);

  const [email,        setEmail]        = useState('');
  const [error,        setError]        = useState<string | null>(null);
  const [busy,         setBusy]         = useState(false);
  const [sent,         setSent]         = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => panelRef.current?.classList.add('fp-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const shake = () => {
    const el = formRef.current;
    if (!el) return;
    el.classList.remove('fp-shake');
    void el.offsetWidth;
    el.classList.add('fp-shake');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || sent) return;

    const trimmed = email.trim();
    if (!trimmed) { setError('Email is required.'); shake(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.'); shake(); return;
    }

    setBusy(true);
    setError(null);
    const { error: fpError } = await forgotPassword(trimmed);
    setBusy(false);

    if (fpError) {
      setError(fpError);
      shake();
      toast(fpError, 'error', 5000);
      return;
    }

    setSent(true);
    toast('Check your inbox for a reset link.', 'success', 8000);
  };

  return (
    <>
      <Helmet>
        <title>Reset password — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .fp-panel { opacity: 0; transform: translateY(16px); }
        .fp-panel.fp-in { opacity: 1; transform: translateY(0); transition: opacity 650ms ${EASE}, transform 650ms ${EASE}; }

        .fp-rule {
          display: block; width: 28px; height: 1px; background: ${C.tan};
          transform: scaleX(0); transform-origin: left;
          transition: transform 450ms ${EASE} 200ms;
        }
        .fp-panel.fp-in .fp-rule { transform: scaleX(1); }

        .fp-input::placeholder { color: ${C.onDarkFaint}; }
        .fp-input:focus { border-bottom-color: ${C.borderFocus} !important; }
        .fp-input:-webkit-autofill,
        .fp-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${C.dark900} inset !important;
          -webkit-text-fill-color: ${C.onDark} !important;
          caret-color: ${C.tan};
        }

        @keyframes fp-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .fp-shake { animation: fp-shake 380ms ${EASE}; }

        .fp-btn {
          width: 100%; padding: 15px 0;
          background: ${C.tan}; color: ${C.dark900};
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          border: none; border-radius: 2px; cursor: pointer; line-height: 1;
          transition: background-color 250ms ${EASE}, opacity 250ms ${EASE};
        }
        .fp-btn:hover:not(:disabled) { background: ${C.tanHover}; }
        .fp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .fp-btn:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 3px; }

        .fp-link {
          color: ${C.tan};
          text-decoration: none;
          transition: color 200ms ${EASE};
        }
        .fp-link:hover { color: ${C.onDark}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main
        style={{ minHeight: '100dvh', backgroundColor: C.dark900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,48px)' }}
        aria-label="Reset password">

        <div ref={panelRef} className="fp-panel" style={{ width: '100%', maxWidth: '400px' }}>

          {/* Wordmark */}
          <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
            <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: C.onDarkMuted }}>
              UN/SH
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 'clamp(40px,6vw,56px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="fp-rule" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.onDarkMuted }}>
                Account recovery
              </span>
            </div>
            <h1 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", "--font-heading": "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(28px,5vw,38px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.01em', color: C.onDark, margin: 0 } as React.CSSProperties}>
              {sent ? 'Check your inbox' : 'Forgot password?'}
            </h1>
          </div>

          {sent ? (
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: C.onDarkMuted, lineHeight: 1.75, marginBottom: '32px', letterSpacing: '0.01em' }}>
                We've sent a password reset link to{' '}
                <span style={{ color: C.onDark }}>{email}</span>.{' '}
                Check your inbox — it may take a minute.
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6 }}>
                Didn't receive it?{' '}
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.tan, letterSpacing: '0.01em', transition: `color 200ms ${EASE}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.onDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.tan)}>
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Password reset form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: C.onDarkMuted, lineHeight: 1.7, margin: 0, letterSpacing: '0.01em' }}>
                  Enter the email address on your account and we'll send you a link to reset your password.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="fp-email" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: emailFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    id="fp-email" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="fp-input"
                    style={{ ...inputBase }}
                    aria-required="true" aria-invalid={!!error} />
                </div>

                {error && (
                  <p role="alert" aria-live="assertive" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.errorRed, margin: 0, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                    {error}
                  </p>
                )}

                <button type="submit" className="fp-btn" disabled={busy} aria-busy={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6, letterSpacing: '0.01em' }}>
            <Link to="/login" className="fp-link">← Back to sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
