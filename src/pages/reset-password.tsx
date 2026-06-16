/**
 * Reset Password page.
 *
 * Supabase magic link hash format:
 *   /reset-password#access_token=...&refresh_token=...&type=recovery
 *
 * On mount we parse the hash. If type !== 'recovery' or token is absent
 * we show an "invalid or expired link" state instead of the form.
 *
 * When Supabase is live:
 *   1. Call supabase.auth.setSession({ access_token, refresh_token }) on mount
 *   2. Replace the mock setTimeout in handleSubmit with:
 *        const { error } = await supabase.auth.updateUser({ password })
 *   3. Remove MOCK_NO_TOKEN_CHECK and the mock setTimeout.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

/** Parse Supabase hash fragment into a key→value map. */
function parseHash(hash: string): Record<string, string> {
  return hash.replace(/^#/, '').split('&').reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = pair.split('=');
    if (k) acc[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    return acc;
  }, {});
}


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

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const navigate   = useNavigate();

  const panelRef  = useRef<HTMLDivElement>(null);
  const formRef   = useRef<HTMLFormElement>(null);
  const passRef   = useRef<HTMLInputElement>(null);

  const [password,     setPassword]    = useState('');
  const [confirm,      setConfirm]     = useState('');
  const [error,        setError]       = useState<string | null>(null);
  const [busy,         setBusy]        = useState(false);
  const [done,         setDone]        = useState(false);
  const [showPass,     setShowPass]    = useState(false);
  const [showConf,     setShowConf]    = useState(false);
  const [passFocused,  setPassFocused] = useState(false);
  const [confFocused,  setConfFocused] = useState(false);
  const [tokenValid,   setTokenValid]  = useState<boolean | null>(null); // null = checking

  const strength     = getPasswordStrength(password);
  const confirmMatch = confirm.length > 0 && confirm === password;

  // Validate the magic link token from the URL hash on mount and restore session
  useEffect(() => {
    const params = parseHash(window.location.hash);
    const isRecovery = params['type'] === 'recovery';
    const hasToken   = Boolean(params['access_token']);
    const valid = isRecovery && hasToken;
    setTokenValid(valid);

    if (valid) {
      void supabase.auth.setSession({
        access_token:  params['access_token'],
        refresh_token: params['refresh_token'] ?? '',
      });
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => panelRef.current?.classList.add('rs-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (tokenValid) passRef.current?.focus();
  }, [tokenValid]);

  // Auto-redirect to login 3s after success
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(id);
  }, [done, navigate]);

  const shake = () => {
    const el = formRef.current;
    if (!el) return;
    el.classList.remove('rs-shake');
    void el.offsetWidth;
    el.classList.add('rs-shake');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || done) return;

    if (password.length < 6) { setError('Password must be at least 6 characters.'); shake(); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); shake(); return; }

    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      shake();
      return;
    }

    setBusy(false);
    setDone(true);
    toast('Password updated! Redirecting to sign in…', 'success', 4000);
  };

  return (
    <>
      <Helmet>
        <title>Set new password — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .rs-panel { opacity: 0; transform: translateY(16px); }
        .rs-panel.rs-in { opacity: 1; transform: translateY(0); transition: opacity 650ms ${EASE}, transform 650ms ${EASE}; }

        .rs-rule {
          display: block; width: 28px; height: 1px; background: ${C.tan};
          transform: scaleX(0); transform-origin: left;
          transition: transform 450ms ${EASE} 200ms;
        }
        .rs-panel.rs-in .rs-rule { transform: scaleX(1); }

        .rs-input::placeholder { color: ${C.onDarkFaint}; }
        .rs-input:focus { border-bottom-color: ${C.borderFocus} !important; }
        .rs-input:-webkit-autofill,
        .rs-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${C.dark900} inset !important;
          -webkit-text-fill-color: ${C.onDark} !important;
          caret-color: ${C.tan};
        }

        @keyframes rs-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .rs-shake { animation: rs-shake 380ms ${EASE}; }

        .rs-btn {
          width: 100%; padding: 15px 0;
          background: ${C.tan}; color: ${C.dark900};
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          border: none; border-radius: 2px; cursor: pointer; line-height: 1;
          transition: background-color 250ms ${EASE}, opacity 250ms ${EASE};
        }
        .rs-btn:hover:not(:disabled) { background: ${C.tanHover}; }
        .rs-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .rs-btn:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 3px; }

        .rs-pass-toggle {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.onDarkMuted}; padding: 4px; line-height: 1;
          transition: color 200ms ${EASE};
        }
        .rs-pass-toggle:hover { color: ${C.onDark}; }
        .rs-pass-toggle:focus-visible { outline: 2px solid ${C.tan}; outline-offset: 2px; }

        .rs-link {
          color: ${C.tan};
          text-decoration: none;
          transition: color 200ms ${EASE};
        }
        .rs-link:hover { color: ${C.onDark}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main
        style={{ minHeight: '100dvh', backgroundColor: C.dark900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,48px)' }}
        aria-label="Set new password">

        <div ref={panelRef} className="rs-panel" style={{ width: '100%', maxWidth: '400px' }}>

          {/* Wordmark */}
          <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
            <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: C.onDarkMuted }}>
              UN/SH
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 'clamp(40px,6vw,56px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="rs-rule" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.onDarkMuted }}>
                Account recovery
              </span>
            </div>
            <h1 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(28px,5vw,38px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.01em', color: C.onDark, margin: 0 }}>
              {done ? 'Password updated' : tokenValid === false ? 'Link expired' : 'Set new password'}
            </h1>
          </div>

          {tokenValid === false ? (
            /* Invalid / expired token */
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: C.onDarkMuted, lineHeight: 1.75, marginBottom: '32px', letterSpacing: '0.01em' }}>
                This password reset link is invalid or has expired. Links are single-use and expire after 1 hour.
              </p>
              <Link to="/forgot-password" className="rs-link" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em' }}>
                Request a new link →
              </Link>
            </div>
          ) : done ? (
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: C.onDarkMuted, lineHeight: 1.75, marginBottom: '32px', letterSpacing: '0.01em' }}>
                Your password has been updated. Redirecting you to sign in…
              </p>
              <Link to="/login" className="rs-link" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em' }}>
                Sign in now →
              </Link>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Set new password form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* New password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="rs-password" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: passFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={passRef}
                      id="rs-password" type={showPass ? 'text' : 'password'} name="password"
                      autoComplete="new-password" placeholder="Min. 6 characters" value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      onFocus={() => setPassFocused(true)}
                      onBlur={() => setPassFocused(false)}
                      className="rs-input"
                      style={{ ...inputBase, paddingRight: '32px' }}
                      aria-required="true" />
                    <button type="button" className="rs-pass-toggle" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
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
                  <label htmlFor="rs-confirm" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: confFocused ? C.tan : C.onDarkMuted, transition: `color 200ms ${EASE}` }}>
                    Confirm password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="rs-confirm" type={showConf ? 'text' : 'password'} name="confirm"
                      autoComplete="new-password" placeholder="Repeat password" value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                      onFocus={() => setConfFocused(true)}
                      onBlur={() => setConfFocused(false)}
                      className="rs-input"
                      style={{ ...inputBase, paddingRight: '32px', borderBottomColor: confirmMatch ? C.successGreen : undefined }}
                      aria-required="true" />
                    <button type="button" className="rs-pass-toggle" onClick={() => setShowConf((v) => !v)} aria-label={showConf ? 'Hide password' : 'Show password'}>
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

                {error && (
                  <p role="alert" aria-live="assertive" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.errorRed, margin: 0, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                    {error}
                  </p>
                )}

                <button type="submit" className="rs-btn" disabled={busy} aria-busy={busy}>
                  {busy ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          )}

          {!done && (
            <p style={{ marginTop: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.onDarkFaint, lineHeight: 1.6, letterSpacing: '0.01em' }}>
              <Link to="/login" className="rs-link">← Back to sign in</Link>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
