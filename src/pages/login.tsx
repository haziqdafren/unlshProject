import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/coaches';

  const panelRef = useRef<HTMLDivElement>(null);
  const formRef  = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [rememberMe,   setRememberMe]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [busy,         setBusy]         = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);
  const [showPass,     setShowPass]     = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, isLoading, navigate, from]);

  useEffect(() => {
    const id = requestAnimationFrame(() => panelRef.current?.classList.add('lp-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isLoading) emailRef.current?.focus();
  }, [isLoading]);

  const shake = () => {
    const el = formRef.current;
    if (!el) return;
    el.classList.remove('lp-shake');
    void el.offsetWidth; // reflow
    el.classList.add('lp-shake');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Email is required.'); shake(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.'); shake(); return;
    }
    if (!password) { setError('Password is required.'); shake(); return; }

    setBusy(true);
    setError(null);
    const { error: authError } = await login(trimmedEmail, password, rememberMe);
    setBusy(false);

    if (authError) {
      setError(authError);
      shake();
      toast(authError, 'error', 5000);
      return;
    }

    toast('Welcome back!', 'success');
    navigate(from, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Sign in — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .lp-in {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 650ms ${EASE}, transform 650ms ${EASE};
        }
        .lp-in { opacity: 1 !important; transform: translateY(0) !important; }

        /* entrance starts hidden, class added by rAF */
        .lp-panel { opacity: 0; transform: translateY(16px); }
        .lp-panel.lp-in { opacity: 1; transform: translateY(0); transition: opacity 650ms ${EASE}, transform 650ms ${EASE}; }

        .lp-rule {
          display: block; width: 28px; height: 1px; background: ${C.tan};
          transform: scaleX(0); transform-origin: left;
          transition: transform 450ms ${EASE} 200ms;
        }
        .lp-panel.lp-in .lp-rule { transform: scaleX(1); }

        .lp-input::placeholder { color: ${C.onDarkFaint}; }
        .lp-input:focus { border-bottom-color: ${C.borderFocus} !important; }
        .lp-input:-webkit-autofill,
        .lp-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${C.dark900} inset !important;
          -webkit-text-fill-color: ${C.onDark} !important;
          caret-color: ${C.tan};
        }

        @keyframes lp-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .lp-shake { animation: lp-shake 380ms ${EASE}; }

        .lp-btn {
          width: 100%; padding: 15px 0;
          background: ${C.tan}; color: ${C.dark900};
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          border: none; border-radius: 2px; cursor: pointer; line-height: 1;
          transition: background-color 250ms ${EASE}, opacity 250ms ${EASE};
        }
        .lp-btn:hover:not(:disabled) { background: ${C.tanHover}; }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .lp-btn:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 3px; }

        .lp-pass-toggle {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.onDarkMuted}; padding: 4px; line-height: 1;
          transition: color 200ms ${EASE};
        }
        .lp-pass-toggle:hover { color: ${C.onDark}; }
        .lp-pass-toggle:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 2px; }

        .lp-checkbox-wrap {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          user-select: none;
        }
        .lp-checkbox {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 1px solid ${C.borderFocus}; border-radius: 2px;
          background: transparent; cursor: pointer;
          appearance: none; -webkit-appearance: none;
          transition: background 200ms ${EASE}, border-color 200ms ${EASE};
          position: relative;
        }
        .lp-checkbox:checked { background: ${C.tan}; border-color: ${C.tan}; }
        .lp-checkbox:checked::after {
          content: '';
          position: absolute; top: 2px; left: 5px;
          width: 4px; height: 7px;
          border: 1.5px solid ${C.dark900};
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }
        .lp-checkbox:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 2px; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main style={{ minHeight: '100dvh', backgroundColor: C.dark900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,48px)' }} aria-label="Sign in">

        <div ref={panelRef} className="lp-panel" style={{ width: '100%', maxWidth: '400px' }}>

          {/* Wordmark */}
          <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
            <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: C.onDarkMuted }}>
              UN/SH
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 'clamp(40px,6vw,56px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="lp-rule" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.onDarkMuted }}>
                Members only
              </span>
            </div>
            <h1 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(28px,5vw,38px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.01em', color: C.onDark, margin: 0 }}>
              Welcome back
            </h1>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="login-email" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: emailFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="login-email" type="email" name="email" autoComplete="email"
                  placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="lp-input"
                  style={{ ...inputBase, borderBottomColor: error && !email.trim() ? C.errorRed : C.borderDark }}
                  aria-required="true" aria-invalid={!!error} />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="login-password" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: passFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password" type={showPass ? 'text' : 'password'} name="password"
                    autoComplete="current-password" placeholder="••••••••" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    className="lp-input"
                    style={{ ...inputBase, paddingRight: '32px', borderBottomColor: error && !password ? C.errorRed : C.borderDark }}
                    aria-required="true" aria-invalid={!!error} />
                  <button type="button" className="lp-pass-toggle" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.2 1.8 6.5 1.5 8c.8 3 3.5 5 6.5 5 1.3 0 2.5-.4 3.5-1M6.5 3.1C7 3 7.5 3 8 3c3 0 5.7 2 6.5 5-.3 1-.8 1.9-1.5 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1.5 8C2.3 5 5 3 8 3s5.7 2 6.5 5c-.8 3-3.5 5-6.5 5S2.3 11 1.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="lp-checkbox-wrap">
                <input
                  type="checkbox"
                  className="lp-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  aria-label="Remember me" />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkMuted, letterSpacing: '0.02em' }}>
                  Remember me
                </span>
              </label>

              {/* Inline error */}
              {error && (
                <p role="alert" aria-live="assertive" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.errorRed, margin: 0, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button type="submit" className="lp-btn" disabled={busy} aria-busy={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 'clamp(28px,4vw,40px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6, letterSpacing: '0.01em', margin: 0 }}>
              <Link to="/forgot-password" style={{ color: C.onDarkMuted, textDecoration: 'none', transition: `color 200ms ${EASE}` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.onDark)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.onDarkMuted)}>
                Forgot your password?
              </Link>
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6, letterSpacing: '0.01em', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: C.onDarkMuted, textDecoration: 'none', transition: `color 200ms ${EASE}` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.onDark)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.onDarkMuted)}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
