import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const C = {
  dark900:         '#1A1A1A',
  green:           '#D9CFBB',
  greenHover:      '#c4b9a4',
  textOnDark:      '#F5F5F0',
  textOnDarkMuted: 'rgba(245,245,240,0.55)',
  borderDark:      'rgba(245,245,240,0.12)',
};

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .nf-reveal {
          opacity: 0;
          transform: translateY(20px);
          animation: nf-in 700ms ${EASE} 80ms forwards;
        }
        @keyframes nf-in { to { opacity: 1; transform: translateY(0); } }

        .nf-rule {
          display: block; width: 0; height: 1px;
          background-color: ${C.green};
          animation: nf-rule-grow 500ms ${EASE} 300ms forwards;
        }
        @keyframes nf-rule-grow { to { width: 40px; } }

        .nf-btn-primary {
          display: inline-block;
          background-color: ${C.green}; color: ${C.dark900};
          font-family: var(--font-sans); font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          padding: 14px 36px; border: none; border-radius: 2px;
          text-decoration: none; line-height: 1; white-space: nowrap;
          transition: background-color 250ms ${EASE};
        }
        .nf-btn-primary:hover { background-color: ${C.greenHover}; }

        .nf-btn-ghost {
          display: inline-block; background: none; border: none; cursor: pointer;
          color: ${C.textOnDarkMuted};
          font-family: var(--font-sans); font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.13em;
          padding: 14px 0; text-decoration: none; line-height: 1;
          transition: color 250ms ${EASE};
        }
        .nf-btn-ghost:hover { color: ${C.textOnDark}; }

        .nf-quick-link {
          font-family: var(--font-sans); font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: ${C.textOnDarkMuted}; text-decoration: none;
          transition: color 200ms ${EASE};
        }
        .nf-quick-link:hover { color: ${C.textOnDark}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main
        style={{
          minHeight: '100dvh',
          backgroundColor: C.dark900,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 5vw, 80px)',
        }}
        aria-label="Page not found">

        <div className="nf-reveal" style={{ maxWidth: '640px' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(24px, 3.5vw, 36px)' }}>
            <span className="nf-rule" aria-hidden="true" />
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: C.textOnDarkMuted,
            }}>
              404
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Futura, 'Trebuchet MS', sans-serif",
            '--font-heading': "Futura, 'Trebuchet MS', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(48px, 7vw, 80px)',
            lineHeight: 1.04,
            letterSpacing: '0.01em',
            color: C.textOnDark,
            textTransform: 'lowercase' as const,
            marginBottom: 'clamp(20px, 3vw, 28px)',
          } as React.CSSProperties}>
            page not found
          </h1>

          {/* Hairline */}
          <div style={{ width: '40px', height: '1px', backgroundColor: C.borderDark, marginBottom: 'clamp(24px, 3.5vw, 36px)' }} aria-hidden="true" />

          {/* Body */}
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 400,
            lineHeight: 1.75, color: C.textOnDarkMuted, letterSpacing: '0.01em',
            maxWidth: '44ch', marginBottom: 'clamp(40px, 6vw, 56px)',
          }}>
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Primary actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' as const }}>
            <Link to="/" className="nf-btn-primary">Go home</Link>
            <button className="nf-btn-ghost" onClick={() => window.history.back()}>← Go back</button>
          </div>

          {/* Quick links */}
          <div style={{
            marginTop: 'clamp(48px, 7vw, 72px)',
            paddingTop: 'clamp(32px, 4vw, 40px)',
            borderTop: `1px solid ${C.borderDark}`,
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: C.textOnDarkMuted, marginBottom: '20px',
            }}>
              Or try one of these
            </p>
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' as const }}>
              {[
                { to: '/about',           label: 'About' },
                { to: '/coaches-preview', label: 'Coaches' },
                { to: '/inquiry',         label: 'Book a Session' },
                { to: '/login',           label: 'Login' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="nf-quick-link">{label}</Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
