import { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { type Coach } from './data';

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const C = {
  dark900:     '#1A1A1A',
  dark800:     '#2E2E2E',
  offWhite:    '#F5F5F0',
  tan:         '#D9CFBB',
  textPrimary: '#1A1A1A',
  textMuted:   '#4A4A42',
  textFaint:   'rgba(26,26,26,0.45)',
  borderLight: 'rgba(26,26,26,0.10)',
  onDark:      '#F5F5F0',
  onDarkMuted: 'rgba(245,245,240,0.50)',
  onDarkFaint: 'rgba(245,245,240,0.25)',
};

function useReveal(ref: React.RefObject<Element | null>, threshold = 0.04) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Add immediately if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('is-visible');
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
}

export default function CoachProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [coach,       setCoach]       = useState<Coach | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  useReveal(heroRef, 0.01);
  useReveal(bodyRef, 0.04);

  useEffect(() => {
    if (!id) { setNotFound(true); setIsLoading(false); return; }
    supabase
      .from('coaches')
      .select('*')
      .eq('slug', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); } else {
          const raw = data as Coach & { tags: unknown };
          const tags = Array.isArray(raw.tags)
            ? raw.tags as string[]
            : typeof raw.tags === 'string'
              ? (raw.tags as string).replace(/^\{|\}$/g, '').split(',').map((t) => t.replace(/^"|"$/g, '').trim())
              : [];
          setCoach({ ...raw, tags });
        }
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(26,26,26,0.45)' }}>Loading…</p>
      </main>
    );
  }

  if (notFound || !coach) return <Navigate to="/coaches" replace />;

  const isPlaceholder = coach.name === 'Coming Soon';

  return (
    <>
      <Helmet>
        <title>{coach.name} — Unlsh Coaches</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .cp-hero {
          opacity: 1;
          transform: translateY(0);
        }

        .cp-rule {
          display: block;
          width: 28px;
          height: 1px;
          background: ${C.tan};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 450ms ${EASE} 180ms;
        }
        .cp-hero.is-visible .cp-rule { transform: scaleX(1); }

        .cp-body {
          opacity: 1;
          transform: translateY(0);
        }

        .cp-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${C.textFaint};
          text-decoration: none;
          transition: color 200ms ${EASE};
        }
        .cp-back:hover { color: ${C.textPrimary}; }
        .cp-back:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 3px; }
        .cp-back-arrow { transition: transform 200ms ${EASE}; }
        .cp-back:hover .cp-back-arrow { transform: translateX(-3px); }

        .cp-tag {
          display: inline-block;
          padding: 4px 12px;
          border: 1px solid ${C.borderLight};
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${C.textFaint};
        }

        .cp-book-btn {
          display: inline-block;
          background: ${C.dark900};
          color: ${C.onDark};
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          padding: 14px 40px;
          border: 1px solid ${C.dark900};
          border-radius: 2px;
          text-decoration: none;
          line-height: 1;
          white-space: nowrap;
          transition: background-color 250ms ${EASE}, border-color 250ms ${EASE};
        }
        .cp-book-btn:hover { background: ${C.dark800}; border-color: ${C.dark800}; }
        .cp-book-btn:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 3px; }

        .ch-logout {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0;
          transition: color 200ms ${EASE};
        }
        .ch-logout:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

        @media (max-width: 700px) {
          .cp-two-col { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <main style={{ backgroundColor: C.offWhite, minHeight: '100vh' }}>

        {/* Members bar */}
        <div style={{
          backgroundColor: C.dark900,
          padding: '10px clamp(24px, 5vw, 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: C.onDarkFaint,
          }}>
            Members area
            {user?.email && (
              <span style={{ marginLeft: '16px', color: C.onDarkMuted }}>· {user.email}</span>
            )}
          </span>
          <button
            className="ch-logout"
            onClick={logout}
            style={{ color: C.onDarkFaint }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.onDark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.onDarkFaint)}>
            Sign out
          </button>
        </div>

        <div style={{ padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 80px)' }}>

          {/* Back */}
          <div style={{ marginBottom: 'clamp(40px, 6vw, 64px)' }}>
            <Link to="/coaches" className="cp-back" aria-label="Back to all coaches">
              <svg className="cp-back-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              All coaches
            </Link>
          </div>

          {/* Hero */}
          <div ref={heroRef} className="cp-hero" style={{ maxWidth: '760px', marginBottom: 'clamp(48px, 7vw, 80px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <span className="cp-rule" aria-hidden="true" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: C.textFaint,
              }}>
                {coach.index}
              </span>
            </div>

            <h1 style={{
              fontFamily: "Futura, 'Trebuchet MS', sans-serif",
              fontSize: 'clamp(36px, 6vw, 60px)',
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: '0.01em',
              color: C.textPrimary,
              marginBottom: '12px',
            }}>
              {coach.name}
            </h1>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.12em',
              color: C.textFaint,
              marginBottom: 'clamp(20px, 3vw, 28px)',
            }}>
              {coach.title} · {coach.focus}
            </p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
              {coach.tags.map((tag) => (
                <span key={tag} className="cp-tag">{tag}</span>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: `1px solid ${C.borderLight}`, margin: 'clamp(40px, 6vw, 64px) 0' }} />

          {/* Body */}
          <div ref={bodyRef} className="cp-body">
            <div
              className="cp-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(40px, 6vw, 96px)',
                alignItems: 'start',
                marginBottom: 'clamp(48px, 7vw, 80px)',
              }}>

              <div>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: C.textFaint,
                  marginBottom: '16px',
                }}>
                  About
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '17px',
                  fontWeight: 400,
                  lineHeight: 1.75,
                  color: C.textMuted,
                  letterSpacing: '0.01em',
                }}>
                  {isPlaceholder
                    ? 'This coach profile will be available soon. In the meantime, explore other coaches or book a session with Jessie Li.'
                    : coach.bio}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: C.textFaint,
                  marginBottom: '16px',
                }}>
                  Specialties
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {coach.tags.map((tag) => (
                    <li key={tag} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'block',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: C.tan,
                        flexShrink: 0,
                      }} aria-hidden="true" />
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '15px',
                        color: C.textMuted,
                        letterSpacing: '0.01em',
                      }}>
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {isPlaceholder ? (
              <Link to="/coaches" className="cp-book-btn">← Back to coaches</Link>
            ) : (
              <div>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: C.textFaint,
                  marginBottom: '20px',
                  maxWidth: '40ch',
                  lineHeight: 1.65,
                  letterSpacing: '0.01em',
                }}>
                  Ready to begin? Book a session and take the first step.
                </p>
                <Link to={`/book?coach=${encodeURIComponent(coach.focus)}`} className="cp-book-btn">Book a session</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
