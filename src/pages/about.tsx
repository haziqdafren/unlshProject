import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';

// ─── Ease + duration tokens (kit: motion.md) ───
const EASE_LUXE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

// ─── Colour tokens (Unlsh palette — matches homepage) ───
const C = {
  dark900: '#1A1A1A', // --burgundy-900 equivalent
  dark800: '#2E2E2E', // --burgundy-800 equivalent
  offWhite: '#F5F5F0', // --cream-surface equivalent
  muted: '#E8E8E2', // --cream-warm equivalent
  green: '#D9CFBB', // --coral-primary equivalent (Unlsh accent)
  greenHover: '#c4b9a4',
  textOnDark: '#F5F5F0',
  textOnDarkMuted: 'rgba(245,245,240,0.55)',
  textOnDarkFaint: 'rgba(245,245,240,0.30)',
  textOnLight: '#1A1A1A',
  textOnLightMuted: '#4A4A42',
  textOnLightFaint: 'rgba(26,26,26,0.45)',
  borderDark: 'rgba(245,245,240,0.12)',
  borderLight: 'rgba(26,26,26,0.10)'
};

// ─── Scroll-reveal hook (kit: motion.md — opacity + translateY) ───
function useReveal(ref: React.RefObject<Element | null>, threshold = 0.08) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
}

// ─── Stagger-reveal hook (kit: motion.md — stagger children) ───
function useStaggerReveal(
containerRef: React.RefObject<Element | null>,
selector: string,
delayMs = 80,
threshold = 0.05)
{
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll(selector));
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('is-visible'), i * delayMs);
          });
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, [containerRef, selector, delayMs, threshold]);
}

// ═══════════════════════════════════════════════
// SECTION 1 — HERO STATEMENT
// Dark900 surface. Display h1 + opening declaration.
// Kit: floating-hero.md — large display headline, left-anchored.
// ═══════════════════════════════════════════════
function AboutHero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);

  useReveal(headlineRef, 0.01);
  useReveal(proseRef, 0.05);

  return (
    <section
      aria-labelledby="about-hero-heading"
      style={{
        backgroundColor: C.dark900,
        padding: 'clamp(140px, 18vw, 220px) clamp(24px, 5vw, 80px) clamp(100px, 14vw, 180px)'
      }}>
      
      <style>{`
        /* ── Hero reveal (kit: motion.md — opacity + translateY 700ms) ── */
        .about-hero-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .about-hero-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .about-prose-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE} 160ms, transform 700ms ${EASE_LUXE} 160ms;
        }
        .about-prose-reveal.is-visible { opacity: 1; transform: translateY(0); }

        /* Rule grows left-to-right on reveal (kit: motion.md — scaleX) */
        .about-hero-rule {
          display: block;
          width: 40px;
          height: 1px;
          background-color: ${C.green};
          margin-bottom: clamp(24px, 3.5vw, 36px);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 200ms;
        }
        .about-prose-reveal.is-visible .about-hero-rule { transform: scaleX(1); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Headline zone */}
      <div ref={headlineRef} className="about-hero-reveal" style={{ maxWidth: 'min(860px, 70%)' }}>
        {/* Eyebrow label (kit: type.md — UPPERCASE DM Sans 500, 0.12em) */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.14em',
            color: C.textOnDarkMuted,
            marginBottom: 'clamp(28px, 4vw, 44px)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
          aria-hidden="true">
          
          <span
            style={{
              display: 'block',
              width: '28px',
              height: '1px',
              backgroundColor: C.borderDark,
              flexShrink: 0
            }} />
          
          About Unlsh
        </p>

        {/* h1 — kit: type.md — Black Sapphire 400, sentence case, clamp(56px, 8vw, 72px) */}
        <h1
          id="about-hero-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(52px, 7.5vw, 72px)',
            lineHeight: 1.06,
            letterSpacing: '0.01em',
            color: C.textOnDark,
            "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">Beyond Coaching


        </h1>
      </div>

      {/* Void — editorial breathing room (kit: character.md — density) */}
      <div style={{ height: 'clamp(72px, 10vw, 140px)' }} aria-hidden="true" />

      {/* Prose zone */}
      <div ref={proseRef} className="about-prose-reveal" style={{ maxWidth: '56ch' }}>
        <span className="about-hero-rule" aria-hidden="true" />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.75,
            color: C.textOnDarkMuted,
            letterSpacing: '0.01em'
          }}>Unlsh is a hybrid executive coaching and mentoring community for those who have achieved success, yet know they are meant for more. Through a holistic approach grounded in exceptional coaching blended with mentorship, conscious leadership, and real-world wisdom, we help leaders expand beyond conventional success and unlock new levels of clarity, growth, and potential.


        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.75,
            color: C.textOnDarkMuted,
            letterSpacing: '0.01em',
            marginTop: 'clamp(20px, 3vw, 28px)'
          }}>At Unlsh, success is not only about what you build — it is about who you become while building it.


        </p>
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 2 — WHAT SETS US APART (cream surface)
// Kit: editorial-prose.md — two-column label + prose.
// ═══════════════════════════════════════════════
function WhatSetsUsApart() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useReveal(leftRef, 0.08);
  useReveal(rightRef, 0.08);

  return (
    <section
      aria-labelledby="apart-heading"
      style={{
        backgroundColor: C.offWhite,
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)'
      }}>
      
      <style>{`
        .apart-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          column-gap: clamp(40px, 6vw, 96px);
          align-items: start;
        }
        .apart-left-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .apart-left-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .apart-right-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE} 120ms, transform 700ms ${EASE_LUXE} 120ms;
        }
        .apart-right-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .apart-eyebrow-rule {
          display: block;
          width: 28px;
          height: 1px;
          background-color: ${C.green};
          flex-shrink: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 80ms;
        }
        .apart-left-reveal.is-visible .apart-eyebrow-rule { transform: scaleX(1); }

        @media (max-width: 700px) {
          .apart-grid { grid-template-columns: 1fr; row-gap: clamp(32px, 5vw, 48px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="apart-grid">
        {/* Left: label column */}
        <div ref={leftRef} className="apart-left-reveal">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: 'clamp(20px, 3vw, 28px)'
            }}>
            
            <span className="apart-eyebrow-rule" aria-hidden="true" />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.14em',
                color: C.textOnLightFaint
              }}>
              
              The difference
            </span>
          </div>
          {/* h2 — kit: type.md — Black Sapphire 400, lowercase, clamp(32px, 5vw, 42px) */}
          <h2
            id="apart-heading"
            style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

              fontWeight: 400,
              fontSize: 'clamp(28px, 4vw, 38px)',
              lineHeight: 1.1,
              letterSpacing: '0.01em',
              color: C.textOnLight,
              "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
            } as React.CSSProperties} className="">

            World-Class Guidance Meets Inner Work
          </h2>
        </div>

        {/* Right: prose column */}
        <div ref={rightRef} className="apart-right-reveal">
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: 1.75,
              color: C.textOnLightMuted,
              letterSpacing: '0.01em',
              marginBottom: 'clamp(20px, 3vw, 28px)'
            }}>
            
            With guest speakers including HBS professors, top accelerator and incubator mentors, and respected experts across industries, Unlsh goes beyond traditional coaching.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: 1.75,
              color: C.textOnLightMuted,
              letterSpacing: '0.01em',
              marginBottom: 'clamp(20px, 3vw, 28px)'
            }}>
            
            We help individuals expand into new sectors and opportunities while doing the deeper inner work that unlocks clarity, confidence, and untapped potential.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: 1.75,
              color: C.textOnLightMuted,
              letterSpacing: '0.01em'
            }}>
            
            This is not a course. It is not a mastermind. It is a community built around the belief that the most important work you will ever do is on yourself.
          </p>
        </div>
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 3 — WHAT UNLSH OFFERS (dark800 surface)
// Kit: long-form-list.md — hairline-separated rows.
// ═══════════════════════════════════════════════
const pillars = [
{
  title: 'Inner transformation',
  detail: 'The deeper work — clarity, confidence, and the unlocking of potential that no strategy deck can reach.',
  ref: 'UNL-01'
},
{
  title: 'Executive coaching',
  detail: 'One-on-one sessions with coaches who have operated at the highest levels of business, venture, and leadership.',
  ref: 'UNL-02'
},
{
  title: 'Expert access',
  detail: 'Guest speakers from HBS, leading accelerators, and respected practitioners across industries — brought directly into the community.',
  ref: 'UNL-03'
},
{
  title: 'Sector expansion',
  detail: 'Structured guidance for individuals moving into new industries, markets, or leadership contexts.',
  ref: 'UNL-04'
},
{
  title: 'Community',
  detail: 'A curated network of peers doing the same work. The relationships formed here are part of the offering.',
  ref: 'UNL-05'
}];


function WhatWeOffer() {
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useReveal(headerRef, 0.08);
  useStaggerReveal(listRef, '.pillar-row', 80, 0.05);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = Math.min((pillars.length - 1) * 80, 320) + 200;
          setTimeout(() => {
            if (ctaRef.current) ctaRef.current.classList.add('is-visible');
          }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(list);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="offer-heading"
      style={{
        backgroundColor: C.dark800,
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)'
      }}>
      
      <style>{`
        .offer-header-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .offer-header-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .offer-header-rule {
          display: block;
          width: 48px;
          height: 1px;
          background-color: ${C.green};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 160ms;
        }
        .offer-header-reveal.is-visible .offer-header-rule { transform: scaleX(1); }

        /* Kit: long-form-list.md — hairline rows, hover surface shift */
        .pillar-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: clamp(16px, 3vw, 40px);
          border-top: 1px solid ${C.borderDark};
          padding: clamp(24px, 3.5vw, 40px) clamp(24px, 5vw, 80px);
          margin-left: calc(-1 * clamp(24px, 5vw, 80px));
          margin-right: calc(-1 * clamp(24px, 5vw, 80px));
          background-color: transparent;
          /* Kit: motion.md — 500ms background-color shift on hover */
          transition:
            opacity 700ms ${EASE_LUXE},
            transform 700ms ${EASE_LUXE},
            background-color 500ms ${EASE_LUXE};
          opacity: 0;
          transform: translateY(8px);
        }
        .pillar-row.is-visible { opacity: 1; transform: translateY(0); }
        /* Kit: cards.md — hover = surface color shift only, no lift */
        .pillar-row:hover { background-color: ${C.dark900}; }

        .offer-cta-reveal {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE};
        }
        .offer-cta-reveal.is-visible { opacity: 1; }

        @media (max-width: 560px) {
          .pillar-row { flex-wrap: wrap; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        ref={headerRef}
        className="offer-header-reveal"
        style={{ marginBottom: 'clamp(56px, 7vw, 96px)' }}>
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: 'clamp(20px, 3vw, 32px)'
          }}>
          
          <span
            style={{
              display: 'block',
              width: '28px',
              height: '1px',
              backgroundColor: C.borderDark,
              flexShrink: 0
            }}
            aria-hidden="true" />
          
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.14em',
              color: C.textOnDarkMuted
            }}>
            
            What we offer
          </span>
        </div>

        <h2
          id="offer-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '0.01em',
            color: C.textOnDark,
            marginBottom: 'clamp(28px, 4vw, 48px)', "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">How It Works


        </h2>

        <span className="offer-header-rule" aria-hidden="true" />
      </div>

      {/* Pillar list */}
      <ol
        ref={listRef}
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
        aria-label="Community pillars">
        
        {pillars.map((p) =>
        <li key={p.ref} className="pillar-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
              <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(15px, 2vw, 18px)',
                fontWeight: 500,
                lineHeight: 1.3,
                color: C.textOnDark,
                letterSpacing: '0.01em'
              }}>
              
                {p.title}
              </span>
              <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                fontWeight: 400,
                color: C.textOnDarkMuted,
                letterSpacing: '0.01em',
                lineHeight: 1.55,
                maxWidth: '52ch'
              }}>
              
                {p.detail}
              </span>
            </div>
          </li>
        )}
        {/* Closing hairline */}
        <li style={{ borderTop: `1px solid ${C.borderDark}` }} aria-hidden="true" />
      </ol>

      {/* CTA */}
      <div
        ref={ctaRef}
        className="offer-cta-reveal"
        style={{
          marginTop: 'clamp(56px, 7vw, 96px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(24px, 4vw, 48px)',
          flexWrap: 'wrap' as const
        }}>
        
        <Link
          to="/coaches"
          style={{
            display: 'inline-block',
            backgroundColor: C.green,
            color: C.dark900,
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            padding: '14px 40px',
            borderRadius: '2px',
            textDecoration: 'none',
            lineHeight: 1,
            whiteSpace: 'nowrap' as const,
            flexShrink: 0
          }}>

          Meet the coaches
        </Link>
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 4 — CLOSING CTA (dark900 surface)
// Big "book a quick call" moment. Full-bleed dark,
// display-scale headline, dominant primary button.
// ═══════════════════════════════════════════════
function AboutCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useReveal(headRef, 0.05);
  useReveal(bodyRef, 0.08);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-cta-heading"
      style={{
        backgroundColor: C.offWhite,
        padding: 'clamp(100px, 14vw, 200px) clamp(24px, 5vw, 80px)',
        borderTop: `1px solid ${C.borderLight}`
      }}>
      
      <style>{`
        .cta-head-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .cta-head-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .cta-body-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE} 180ms, transform 700ms ${EASE_LUXE} 180ms;
        }
        .cta-body-reveal.is-visible { opacity: 1; transform: translateY(0); }

        /* Primary CTA button — kit: buttons.md */
        .cta-primary-btn {
          display: inline-block;
          background-color: ${C.green};
          color: ${C.textOnDark};
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 18px 52px;
          border-radius: 2px;
          text-decoration: none;
          line-height: 1;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background-color 300ms ${EASE_LUXE};
        }
        .cta-primary-btn:hover { background-color: ${C.greenHover}; }
        .cta-primary-btn:active { transform: translateY(1px); }
        .cta-primary-btn:focus-visible {
          outline: 2px solid ${C.textOnDark};
          outline-offset: 4px;
        }

        /* Ghost link — kit: buttons.md — sliding underline */
        .cta-ghost-link {
          position: relative;
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${C.textOnLightMuted};
          text-decoration: none;
          padding-bottom: 4px;
          white-space: nowrap;
          transition: color 300ms ${EASE_LUXE};
        }
        .cta-ghost-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: ${C.green};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE};
        }
        .cta-ghost-link:hover::after,
        .cta-ghost-link:focus-visible::after { transform: scaleX(1); }
        .cta-ghost-link:focus-visible {
          outline: 2px solid ${C.textOnLight};
          outline-offset: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Eyebrow + display headline */}
      <div ref={headRef} className="cta-head-reveal">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.16em',
            color: C.green,
            marginBottom: 'clamp(24px, 3.5vw, 40px)'
          }}>
          
          Book a quick call
        </p>

        <h2
          id="about-cta-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(48px, 8vw, 88px)',
            lineHeight: 1.04,
            letterSpacing: '0.01em',
            color: C.textOnLight,
            maxWidth: '16ch',
            marginBottom: 0, "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">

          Let&apos;s Talk About What&apos;s Next
        </h2>
      </div>

      {/* Void — editorial breathing room */}
      <div style={{ height: 'clamp(48px, 7vw, 96px)' }} aria-hidden="true" />

      {/* Sub-copy + buttons */}
      <div ref={bodyRef} className="cta-body-reveal">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: C.textOnLightMuted,
            letterSpacing: '0.01em',
            maxWidth: '48ch',
            marginBottom: 'clamp(40px, 6vw, 64px)'
          }}>
          
          A 20-minute call. No pitch, no pressure — just an honest conversation about where you are and where you want to go.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            flexWrap: 'wrap' as const
          }}>
          
          <Link to="/book" className="cta-primary-btn">
            Book a quick call
          </Link>
        </div>
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════
export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Unlsh — Beyond Coaching</title>
        <meta
          name="description"
          content="Unlsh is a hybrid executive coaching and mentoring community. HBS professors, accelerator mentors, and respected industry experts combined with deep inner transformation work." />
        
        <link rel="canonical" href="https://unlsh.com/about" />
        <meta property="og:title" content="About Unlsh — Beyond Coaching" />
        <meta
          property="og:description"
          content="Beyond traditional coaching. Unlsh combines executive coaching, expert access, and inner transformation to help you expand into new opportunities and unlock untapped potential." />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://unlsh.com/about" />
        <meta property="og:image" content="https://unlsh.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Unlsh — Beyond Coaching" />
        <meta name="twitter:description" content="Beyond traditional coaching. World-class guidance, expert access, and inner transformation — all in one community." />
        <meta name="twitter:image" content="https://unlsh.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Unlsh',
            url: 'https://unlsh.com/about',
            description: 'A hybrid executive coaching and mentoring community combining world-class guidance, powerful access, and inner transformation.',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Unlsh',
              url: 'https://unlsh.com'
            }
          })}</script>
      </Helmet>

      <main>
        <AboutHero />
        <WhatSetsUsApart />
        <WhatWeOffer />
        <AboutCta />
      </main>
    </>);

}