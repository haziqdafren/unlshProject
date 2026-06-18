import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { supabase } from '@/lib/supabase';
import { type Coach } from './coaches/data';

// ─── Tokens (matches about.tsx exactly) ───────────────────────────────────────
const EASE_LUXE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const C = {
  dark900:          '#1A1A1A',
  dark800:          '#2E2E2E',
  offWhite:         '#F5F5F0',
  muted:            '#E8E8E2',
  green:            '#D9CFBB',
  greenHover:       '#c4b9a4',
  textOnDark:       '#F5F5F0',
  textOnDarkMuted:  'rgba(245,245,240,0.55)',
  textOnDarkFaint:  'rgba(245,245,240,0.30)',
  textOnLight:      '#1A1A1A',
  textOnLightMuted: '#4A4A42',
  textOnLightFaint: 'rgba(26,26,26,0.45)',
  borderDark:       'rgba(245,245,240,0.12)',
  borderLight:      'rgba(26,26,26,0.10)',
};

const PREVIEW_COUNT = 2;

// ─── Reveal hook (matches about.tsx) ──────────────────────────────────────────
function useReveal(ref: React.RefObject<Element | null>, threshold = 0.08) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
}

function useStaggerReveal(containerRef: React.RefObject<Element | null>, selector: string, delayMs = 80, threshold = 0.05) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll(selector));
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => setTimeout(() => item.classList.add('is-visible'), i * delayMs));
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, [containerRef, selector, delayMs, threshold]);
}

// ─── Hero (dark900, matches AboutHero exactly) ────────────────────────────────
function CoachesHero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const proseRef    = useRef<HTMLDivElement>(null);

  // Immediate-fire pattern: above-the-fold elements are already in the viewport
  // when the observer attaches, so we check synchronously and fall back to the
  // observer only when the element is genuinely off-screen.
  useEffect(() => {
    const trigger = () => {
      const delays: [React.RefObject<HTMLDivElement | null>, number][] = [
        [headlineRef, 0],
        [proseRef,    160],
      ];
      delays.forEach(([r, ms]) => {
        if (r.current) setTimeout(() => r.current?.classList.add('is-visible'), ms);
      });
    };

    const el = headlineRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        // Already in view — fire on the next animation frame so the transition
        // has time to attach before the class is added.
        const raf = requestAnimationFrame(trigger);
        return () => cancelAnimationFrame(raf);
      }
    }

    // Genuine below-fold case: use observer + safety fallback.
    const fallback = setTimeout(trigger, 800);
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); trigger(); obs.disconnect(); }
    }, { threshold: 0.01 });
    if (headlineRef.current) obs.observe(headlineRef.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <section
      aria-labelledby="cp-hero-heading"
      style={{
        backgroundColor: C.dark900,
        padding: 'clamp(140px, 18vw, 220px) clamp(24px, 5vw, 80px) clamp(100px, 14vw, 180px)',
      }}>

      <style>{`
        .cp-hero-reveal {
          opacity: 0; transform: translateY(20px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .cp-hero-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .cp-prose-reveal {
          opacity: 0; transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE} 160ms, transform 700ms ${EASE_LUXE} 160ms;
        }
        .cp-prose-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .cp-hero-rule {
          display: block; width: 40px; height: 1px;
          background-color: ${C.green};
          margin-bottom: clamp(24px, 3.5vw, 36px);
          transform: scaleX(0); transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 200ms;
        }
        .cp-prose-reveal.is-visible .cp-hero-rule { transform: scaleX(1); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div ref={headlineRef} className="cp-hero-reveal" style={{ maxWidth: 'min(860px, 70%)' }}>
        <p
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.14em',
            color: C.textOnDarkMuted,
            marginBottom: 'clamp(28px, 4vw, 44px)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
          <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: C.borderDark, flexShrink: 0 }} />
          Our Coaches
        </p>

        <h1
          id="cp-hero-heading"
          style={{
            fontFamily: "Futura, 'Trebuchet MS', sans-serif",
            "--font-heading": "Futura, 'Trebuchet MS', sans-serif",
            fontWeight: 400, fontSize: 'clamp(52px, 7.5vw, 72px)',
            lineHeight: 1.06, letterSpacing: '0.01em',
            color: C.textOnDark,
          } as React.CSSProperties}>
          World-Class Guidance
        </h1>
      </div>

      <div style={{ height: 'clamp(72px, 10vw, 140px)' }} aria-hidden="true" />

      <div ref={proseRef} className="cp-prose-reveal" style={{ maxWidth: '56ch' }}>
        <span className="cp-hero-rule" aria-hidden="true" />
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 400,
          lineHeight: 1.75, color: C.textOnDarkMuted, letterSpacing: '0.01em',
        }}>
          Each Unlsh coach is hand-selected for their expertise, lived experience,
          and ability to create transformative shifts in the leaders they work with.
          Sign in to explore full profiles and find the right fit for your journey.
        </p>
      </div>
    </section>
  );
}

// ─── Coach list (offWhite, matches WhatWeOffer hairline rows) ─────────────────
function CoachesList() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLOListElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);

  useReveal(headerRef as React.RefObject<Element>, 0.08);
  useStaggerReveal(listRef as React.RefObject<Element>, '.cp-coach-row', 80, 0.05);

  const fetchCoaches = useCallback(async () => {
    const { data, error } = await supabase.from('coaches').select('*').order('index');
    if (error) {
      console.error('Failed to load coaches:', error.message);
    }
    setCoaches((data as Coach[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchCoaches(); }, [fetchCoaches]);

  // Reveal CTA after list animates in
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = Math.min((coaches.length - 1) * 80, 320) + 200;
          setTimeout(() => { if (ctaRef.current) ctaRef.current.classList.add('is-visible'); }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(list);
    return () => obs.disconnect();
  }, [coaches.length]);

  return (
    <section
      aria-labelledby="cp-list-heading"
      style={{
        backgroundColor: C.offWhite,
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)',
      }}>

      <style>{`
        /* Header reveal */
        .cp-list-header-reveal {
          opacity: 0; transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .cp-list-header-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .cp-list-header-rule {
          display: block; width: 48px; height: 1px;
          background-color: ${C.green};
          transform: scaleX(0); transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 160ms;
        }
        .cp-list-header-reveal.is-visible .cp-list-header-rule { transform: scaleX(1); }

        /* Coach rows — matches pillar-row from about.tsx WhatWeOffer */
        .cp-coach-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: clamp(16px, 3vw, 40px);
          border-top: 1px solid ${C.borderLight};
          padding: clamp(24px, 3.5vw, 40px) clamp(24px, 5vw, 80px);
          margin-left: calc(-1 * clamp(24px, 5vw, 80px));
          margin-right: calc(-1 * clamp(24px, 5vw, 80px));
          background-color: transparent;
          transition:
            opacity 700ms ${EASE_LUXE},
            transform 700ms ${EASE_LUXE},
            background-color 500ms ${EASE_LUXE};
          opacity: 0;
          transform: translateY(8px);
          position: relative;
        }
        .cp-coach-row.is-visible { opacity: 1; transform: translateY(0); }
        .cp-coach-row:not(.cp-coach-row--locked):hover { background-color: ${C.muted}; }

        .cp-tag {
          display: inline-block; padding: 3px 10px;
          border: 1px solid ${C.borderLight}; border-radius: 999px;
          font-family: var(--font-sans); font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: ${C.textOnLightFaint}; white-space: nowrap;
        }

        /* Blur overlay for locked rows */
        .cp-blur-overlay {
          position: absolute; inset: 0;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          background: rgba(245,245,240,0.70);
          display: flex; align-items: center; justify-content: center;
          gap: clamp(16px, 3vw, 32px); flex-wrap: wrap;
          padding: 0 clamp(24px, 5vw, 80px);
          z-index: 2;
        }

        /* CTA button — matches about.tsx exactly */
        .cp-cta-reveal {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE};
        }
        .cp-cta-reveal.is-visible { opacity: 1; }

        .btn-primary-green {
          display: inline-block;
          background-color: ${C.green}; color: #000;
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          padding: 14px 40px; border-radius: 2px;
          text-decoration: none; line-height: 1; white-space: nowrap; flex-shrink: 0;
          transition: background-color 300ms ${EASE_LUXE};
        }
        .btn-primary-green:hover { background-color: ${C.greenHover}; }
        .btn-primary-green:focus-visible { outline: 2px solid ${C.green}; outline-offset: 3px; }

        /* Ghost link — matches about.tsx cta-ghost-link */
        .cp-ghost-link {
          position: relative; display: inline-block;
          font-family: var(--font-sans); font-size: 13px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: ${C.textOnLightMuted}; text-decoration: none;
          padding-bottom: 4px; white-space: nowrap;
          transition: color 300ms ${EASE_LUXE};
        }
        .cp-ghost-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 100%; height: 1px; background-color: ${C.green};
          transform: scaleX(0); transform-origin: left;
          transition: transform 500ms ${EASE_LUXE};
        }
        .cp-ghost-link:hover::after, .cp-ghost-link:focus-visible::after { transform: scaleX(1); }

        /* Skeleton shimmer */
        .cp-skeleton {
          height: 80px; margin-bottom: 2px;
          background: linear-gradient(90deg, ${C.muted} 25%, #e8e5de 50%, ${C.muted} 75%);
          background-size: 200% 100%;
          animation: cp-shimmer 1.4s ease-in-out infinite;
          border-top: 1px solid ${C.borderLight};
        }
        @keyframes cp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 560px) {
          .cp-coach-row { flex-wrap: wrap; align-items: flex-start; }
          .cp-tags { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Section header */}
      <div ref={headerRef} className="cp-list-header-reveal" style={{ marginBottom: 'clamp(56px, 7vw, 96px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: C.borderLight, flexShrink: 0 }} aria-hidden="true" />
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.textOnLightFaint,
          }}>
            The coaches
          </span>
        </div>
        <h2
          id="cp-list-heading"
          style={{
            fontFamily: "Futura, 'Trebuchet MS', sans-serif",
            "--font-heading": "Futura, 'Trebuchet MS', sans-serif",
            fontWeight: 400, fontSize: 'clamp(32px, 5vw, 42px)',
            lineHeight: 1.1, letterSpacing: '0.01em',
            color: C.textOnLight,
            marginBottom: 'clamp(28px, 4vw, 48px)',
          } as React.CSSProperties}>
          Meet The People Behind The Work
        </h2>
        <span className="cp-list-header-rule" aria-hidden="true" />
      </div>

      {/* Coach rows */}
      <ol ref={listRef} style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="Coach directory preview">
        {loading
          ? [1,2,3,4].map(i => <li key={i} className="cp-skeleton" aria-hidden="true" />)
          : coaches.map((coach, i) => {
              const isLocked = i >= PREVIEW_COUNT;
              return (
                <li key={coach.id} className={`cp-coach-row${isLocked ? ' cp-coach-row--locked' : ''}`}>
                  {/* Main content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 500,
                      textTransform: 'uppercase' as const, letterSpacing: '0.12em',
                      color: C.textOnLightFaint,
                    }}>
                      {coach.focus}
                    </span>
                    <span style={{
                      fontFamily: "Futura, 'Trebuchet MS', sans-serif",
                      fontSize: 'clamp(18px, 2.5vw, 24px)',
                      fontWeight: 400, letterSpacing: '0.01em',
                      color: C.textOnLight, lineHeight: 1.1,
                    }}>
                      {coach.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 'clamp(13px, 1.5vw, 15px)',
                      fontWeight: 400, color: C.textOnLightMuted,
                      letterSpacing: '0.01em', lineHeight: 1.55, maxWidth: '52ch',
                    }}>
                      {coach.bio}
                    </span>
                    <div className="cp-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {coach.tags.map(tag => <span key={tag} className="cp-tag">{tag}</span>)}
                    </div>
                  </div>
                  {/* Index ref — matches about.tsx pillar UNL-0x style */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                    color: C.textOnLightFaint, letterSpacing: '0.02em',
                    whiteSpace: 'nowrap' as const, flexShrink: 0,
                  }}>
                    {coach.index || String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Blur overlay */}
                  {isLocked && (
                    <div className="cp-blur-overlay">
                      <p style={{
                        fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
                        color: C.textOnLightMuted, letterSpacing: '0.01em',
                      }}>
                        Sign in to view full profile
                      </p>
                      <Link to="/login" className="btn-primary-green" style={{ padding: '11px 28px', fontSize: '12px' }}>
                        Sign In
                      </Link>
                      <Link to="/register" className="cp-ghost-link">
                        Create account
                      </Link>
                    </div>
                  )}
                </li>
              );
            })
        }
        <li style={{ borderTop: `1px solid ${C.borderLight}` }} aria-hidden="true" />
      </ol>

      {/* CTA — matches about.tsx WhatWeOffer CTA block */}
      <div
        ref={ctaRef}
        className="cp-cta-reveal"
        style={{
          marginTop: 'clamp(56px, 7vw, 96px)',
          display: 'flex', alignItems: 'center',
          gap: 'clamp(24px, 4vw, 48px)', flexWrap: 'wrap' as const,
        }}>
        <Link to="/register" className="btn-primary-green">
          Create account — unlock all coaches
        </Link>
        <Link to="/login" className="cp-ghost-link">
          Already a member? Sign in
        </Link>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachesPreviewPage() {
  return (
    <>
      <Helmet>
        <title>Our Coaches — Unlsh Executive Coaching</title>
        <meta name="description" content="Meet the world-class coaches behind Unlsh. Sign in to explore full profiles and find the right fit for your journey." />
      </Helmet>
      <main>
        <CoachesHero />
        <CoachesList />
      </main>
    </>
  );
}
