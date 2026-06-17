import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  successGreen:'#6aab7a',
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

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 6) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const STRENGTH_LABELS = ['', 'Weak', 'Good', 'Strong'];
const STRENGTH_COLORS = ['transparent', C.errorRed, '#c9a84c', C.successGreen];

export default function RegisterPage() {
  const { isAuthenticated, isLoading, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const panelRef   = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);
  const nameRef    = useRef<HTMLInputElement>(null);

  const [fullName,      setFullName]      = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [error,         setError]         = useState<string | null>(null);
  const [busy,          setBusy]          = useState(false);
  const [registered,    setRegistered]    = useState(false);
  const [nameFocused,   setNameFocused]   = useState(false);
  const [emailFocused,  setEmailFocused]  = useState(false);
  const [passFocused,   setPassFocused]   = useState(false);
  const [confFocused,   setConfFocused]   = useState(false);
  const [showPass,      setShowPass]      = useState(false);
  const [showConf,      setShowConf]      = useState(false);

  const strength = getPasswordStrength(password);
  const confirmMatch = confirm.length > 0 && confirm === password;

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/coaches', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const id = requestAnimationFrame(() => panelRef.current?.classList.add('rp-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isLoading) nameRef.current?.focus();
  }, [isLoading]);

  const shake = () => {
    const el = formRef.current;
    if (!el) return;
    el.classList.remove('rp-shake');
    void el.offsetWidth;
    el.classList.add('rp-shake');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedName  = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName)  { setError('Full name is required.'); shake(); return; }
    if (!trimmedEmail) { setError('Email is required.'); shake(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.'); shake(); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); shake(); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); shake(); return; }

    setBusy(true);
    setError(null);
    const { error: regError } = await register(trimmedEmail, password, trimmedName);
    setBusy(false);

    if (regError) {
      setError(regError);
      shake();
      toast(regError, 'error', 5000);
      return;
    }

    // In mock mode navigate to login; with Supabase email confirmation enabled,
    // show the "check your email" screen instead.
    if (import.meta.env.DEV) {
      toast('Account created! Sign in to continue.', 'success', 6000);
      navigate('/login');
    } else {
      setRegistered(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create account — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .rp-panel { opacity: 0; transform: translateY(16px); }
        .rp-panel.rp-in { opacity: 1; transform: translateY(0); transition: opacity 650ms ${EASE}, transform 650ms ${EASE}; }

        .rp-rule {
          display: block; width: 28px; height: 1px; background: ${C.tan};
          transform: scaleX(0); transform-origin: left;
          transition: transform 450ms ${EASE} 200ms;
        }
        .rp-panel.rp-in .rp-rule { transform: scaleX(1); }

        .rp-input::placeholder { color: ${C.onDarkFaint}; }
        .rp-input:focus { border-bottom-color: ${C.borderFocus} !important; }
        .rp-input:-webkit-autofill,
        .rp-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${C.dark900} inset !important;
          -webkit-text-fill-color: ${C.onDark} !important;
          caret-color: ${C.tan};
        }

        @keyframes rp-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .rp-shake { animation: rp-shake 380ms ${EASE}; }

        .rp-btn {
          width: 100%; padding: 15px 0;
          background: ${C.tan}; color: ${C.dark900};
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          border: none; border-radius: 2px; cursor: pointer; line-height: 1;
          transition: background-color 250ms ${EASE}, opacity 250ms ${EASE};
        }
        .rp-btn:hover:not(:disabled) { background: ${C.tanHover}; }
        .rp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .rp-btn:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 3px; }

        .rp-pass-toggle {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.onDarkMuted}; padding: 4px; line-height: 1;
          transition: color 200ms ${EASE};
        }
        .rp-pass-toggle:hover { color: ${C.onDark}; }
        .rp-pass-toggle:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 2px; }

        .rp-link {
          color: ${C.tan};
          text-decoration: none;
          transition: color 200ms ${EASE};
        }
        .rp-link:hover { color: ${C.onDark}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main
        style={{ minHeight: '100dvh', backgroundColor: C.dark900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,48px)' }}
        aria-label="Create account">

        <div ref={panelRef} className="rp-panel" style={{ width: '100%', maxWidth: '400px' }}>

          {/* Wordmark */}
          <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
            <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: C.onDarkMuted }}>
              UN/SH
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 'clamp(40px,6vw,56px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="rp-rule" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.onDarkMuted }}>
                Members only
              </span>
            </div>
            <h1 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", "--font-heading": "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(28px,5vw,38px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.01em', color: C.onDark, margin: 0 } as React.CSSProperties}>
              {registered ? 'Check your email' : 'Create account'}
            </h1>
          </div>

          {/* Email confirmation success state */}
          {registered ? (
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: C.onDarkMuted, lineHeight: 1.75, marginBottom: '16px', letterSpacing: '0.01em' }}>
                We've sent a confirmation link to <span style={{ color: C.onDark }}>{email}</span>.
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: C.onDarkFaint, lineHeight: 1.7, marginBottom: '32px', letterSpacing: '0.01em' }}>
                Click the link in your inbox to activate your account, then sign in.
              </p>
              <Link to="/login" className="rp-link" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em' }}>
                Go to sign in →
              </Link>
            </div>
          ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Registration form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Full name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="reg-name" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: nameFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="reg-name" type="text" name="name" autoComplete="name"
                  placeholder="Your name" value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(null); }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  className="rp-input"
                  style={{ ...inputBase }}
                  aria-required="true" />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="reg-email" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: emailFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Email
                </label>
                <input
                  id="reg-email" type="email" name="email" autoComplete="email"
                  placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="rp-input"
                  style={{ ...inputBase }}
                  aria-required="true" />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="reg-password" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: passFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password" type={showPass ? 'text' : 'password'} name="password"
                    autoComplete="new-password" placeholder="Min. 6 characters" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    className="rp-input"
                    style={{ ...inputBase, paddingRight: '32px' }}
                    aria-required="true" />
                  <button type="button" className="rp-pass-toggle" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
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
                {/* Strength bar */}
                {password.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      {([1, 2, 3] as const).map((level) => (
                        <div key={level} style={{
                          flex: 1, height: '2px', borderRadius: '1px',
                          backgroundColor: strength >= level ? STRENGTH_COLORS[strength] : C.borderDark,
                          transition: `background-color 300ms ${EASE}`,
                        }} />
                      ))}
                    </div>
                    {strength > 0 && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: STRENGTH_COLORS[strength], marginTop: '6px', letterSpacing: '0.04em' }}>
                        {STRENGTH_LABELS[strength]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="reg-confirm" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: confFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm" type={showConf ? 'text' : 'password'} name="confirm"
                    autoComplete="new-password" placeholder="Repeat password" value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                    onFocus={() => setConfFocused(true)}
                    onBlur={() => setConfFocused(false)}
                    className="rp-input"
                    style={{ ...inputBase, paddingRight: '32px', borderBottomColor: confirmMatch ? C.successGreen : undefined }}
                    aria-required="true" />
                  <button type="button" className="rp-pass-toggle" onClick={() => setShowConf((v) => !v)} aria-label={showConf ? 'Hide password' : 'Show password'}>
                    {showConf ? (
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

              {/* Inline error */}
              {error && (
                <p role="alert" aria-live="assertive" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.errorRed, margin: 0, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button type="submit" className="rp-btn" disabled={busy} aria-busy={busy}>
                {busy ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
          )}

          {!registered && (
            <p style={{ marginTop: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6, letterSpacing: '0.01em' }}>
              Already have an account?{' '}
              <Link to="/login" className="rp-link">Sign in</Link>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
