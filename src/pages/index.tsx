import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';

// ─── Ease + duration tokens (from kit) ───
const EASE_LUXE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

// ─── Colour tokens (adapted from kit: burgundy→near-black, cream→off-white, coral→green) ───
const C = {
  dark900: '#1A1A1A',
  dark800: '#2E2E2E',
  offWhite: '#F5F5F0',
  muted: '#E8E8E2',
  green: '#D9CFBB',
  greenHover: '#c4b9a4',
  textOnDark: '#F5F5F0',
  textOnDarkMuted: 'rgba(245,245,240,0.55)',
  textOnDarkFaint: 'rgba(245,245,240,0.30)',
  textOnLight: '#1A1A1A',
  textOnLightMuted: '#4A4A42',
  textOnLightFaint: 'rgba(26,26,26,0.45)',
  borderDark: 'rgba(245,245,240,0.12)',
  borderLight: 'rgba(26,26,26,0.12)'
};

// ─── Scroll-reveal hook ───
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

// ─── Stagger-reveal hook ───
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
// SECTION 1 — HERO (floating-hero.md)
// ═══════════════════════════════════════════════
function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headlineRef, captionRef, ctaRef, floorRef];
    const delays = [0, 200, 380, 560];

    const trigger = () => {
      els.forEach(({ current }, i) => {
        if (current) setTimeout(() => current.classList.add('is-visible'), delays[i]);
      });
    };

    // Fire immediately if headline is already in view (above-fold)
    const headline = headlineRef.current;
    if (headline) {
      const rect = headline.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        trigger();
        return;
      }
    }

    // Hard fallback — always trigger within 800ms regardless of observer
    const fallback = setTimeout(trigger, 800);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallback);
          trigger();
          obs.disconnect();
        }
      },
      { threshold: 0.01 }
    );
    if (headlineRef.current) obs.observe(headlineRef.current);
    return () => {obs.disconnect();clearTimeout(fallback);};
  }, []);

  return (
    <section
      aria-labelledby="hero-headline"
      style={{
        backgroundColor: C.dark900,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 'clamp(140px, 18vw, 220px)',
        paddingRight: 'clamp(24px, 6vw, 96px)',
        paddingBottom: 'clamp(80px, 10vw, 140px)',
        paddingLeft: 'clamp(24px, 5vw, 80px)'
      }}>
      
      <style>{`
        .hero-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .hero-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .hero-caption-reveal {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE} 200ms;
        }
        .hero-caption-reveal.is-visible { opacity: 1; }
        .hero-cta-reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 700ms ${EASE_LUXE} 380ms, transform 700ms ${EASE_LUXE} 380ms;
          pointer-events: none;
        }
        .hero-cta-reveal.is-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .hero-floor-reveal {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE} 560ms;
        }
        .hero-floor-reveal.is-visible { opacity: 1; }
        .floor-rule {
          display: block;
          width: 40px;
          height: 1px;
          background-color: ${C.green};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 640ms;
        }
        .hero-floor-reveal.is-visible .floor-rule { transform: scaleX(1); }
        .btn-primary-green {
          display: inline-block;
          background-color: ${C.green};
          color: #000000;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 14px 40px;
          border: none;
          border-radius: 0;
          cursor: pointer;
          text-decoration: none;
          line-height: 1;
          transition: background-color 300ms ${EASE_LUXE};
          white-space: nowrap;
        }
        .btn-primary-green:hover { background-color: ${C.greenHover}; }
        .btn-primary-green:active { transform: translateY(1px); }
        .btn-primary-green:focus-visible { outline: 2px solid ${C.green}; outline-offset: 3px; }
      `}</style>

      {/* Headline */}
      <h1
        ref={headlineRef}
        id="hero-headline"
        className="hero-reveal"
        style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

          fontWeight: 600,
          fontSize: 'clamp(56px, 9vw, 80px)',
          lineHeight: 1.04,
          letterSpacing: '0.02em',
          color: C.textOnDark,
          maxWidth: '14ch',
          textTransform: 'none', "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
        } as React.CSSProperties}>
        
        Unlock what&apos;s next.
      </h1>

      {/* Caption */}
      <div
        ref={captionRef}
        className="hero-caption-reveal"
        style={{
          marginTop: 'clamp(28px, 3.5vw, 44px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
        aria-label="Platform description">
        
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '1px',
            backgroundColor: C.green,
            flexShrink: 0
          }} />
        
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: C.textOnDarkMuted
          }}>World-class coaching & Mentoring for high achievers.


        </span>
      </div>

      {/* CTA */}
      <div
        ref={ctaRef}
        className="hero-cta-reveal"
        style={{ marginTop: 'clamp(56px, 7vw, 96px)' }}>
        
        <Link to="/book" className="btn-primary-green">
          Start your journey now
        </Link>
      </div>

      {/* Floor mark */}
      <div
        ref={floorRef}
        className="hero-floor-reveal"
        aria-hidden="true"
        style={{
          marginTop: 'auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 'clamp(40px, 5vw, 64px)'
        }}>
        
        <span className="floor-rule" />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: C.textOnDarkFaint,
            whiteSpace: 'nowrap'
          }}>Executive · Venture · Wellness · Innerwork


        </span>
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 2 — VALUE PROPOSITION (split-asymmetric.md)
// ═══════════════════════════════════════════════
function ValuePropSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const textGroup = section.querySelector('.split-text-group') as HTMLElement | null;
    const ctaGroup = section.querySelector('.split-cta-group') as HTMLElement | null;
    const imageCol = section.querySelector('.split-image-col') as HTMLElement | null;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (imageCol) imageCol.classList.add('is-visible');
          if (textGroup) textGroup.classList.add('is-visible');
          if (ctaGroup) setTimeout(() => ctaGroup.classList.add('is-visible'), 240);
          obs.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="value-heading"
      className="split-section-grid"
      style={{
        backgroundColor: C.offWhite,
        minHeight: '85vh',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '5fr 7fr',
        alignItems: 'stretch',
        gap: 0
      }}>
      
      <style>{`
        @media (max-width: 960px) {
          .split-section-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
          .split-image-col { order: 1; padding: 0 !important; min-height: clamp(300px, 52vw, 520px); opacity: 1 !important; transition: none !important; }
          .split-text-col { order: 2; justify-content: flex-start !important; gap: clamp(48px, 7vw, 72px); padding: clamp(48px, 8vw, 80px) clamp(24px, 5vw, 48px) clamp(56px, 8vw, 80px) !important; }
          .split-text-group { opacity: 1 !important; transform: none !important; transition: none !important; }
          .split-cta-group { opacity: 1 !important; transition: none !important; }
        }
        @media (max-width: 580px) {
          .split-image-col { min-height: clamp(240px, 60vw, 380px) !important; }
        }
        .split-text-group {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .split-text-group.is-visible { opacity: 1; transform: translateY(0); }
        .split-cta-group {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE} 240ms;
        }
        .split-cta-group.is-visible { opacity: 1; }
        .split-image-col {
          opacity: 0;
          transition: opacity 700ms ${EASE_LUXE} 80ms;
        }
        .split-image-col.is-visible { opacity: 1; }
        .split-img { transition: transform 500ms ${EASE_LUXE}; }
        .split-image-col:hover .split-img { transform: scale(1.03); }
      `}</style>

      {/* Text column */}
      <div
        className="split-text-col"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(120px, 16vw, 180px) clamp(24px, 3vw, 48px) clamp(56px, 8vw, 96px) clamp(24px, 5vw, 80px)'
        }}>
        
        {/* Headline group */}
        <div className="split-text-group" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 2.5vw, 32px)' }}>
          {/* Eyebrow */}
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: C.textOnLightFaint
            }}>
            
            <span style={{ display: 'block', width: '24px', height: '1px', backgroundColor: C.green, flexShrink: 0 }} />
            Our philosophy
          </p>

          <h2
            id="value-heading"
            style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

              fontWeight: 400,
              fontSize: 'clamp(40px, 5vw, 56px)',
              lineHeight: 1.08,
              letterSpacing: '0.01em',
              color: C.textOnLight,
              maxWidth: '16ch', "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
            } as React.CSSProperties} className="">Unleash your untapped potential


          </h2>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.75,
              color: C.textOnLightMuted,
              maxWidth: '36ch',
              letterSpacing: '0.01em',
              marginTop: 'clamp(16px, 3vw, 40px)'
            }}>Do you feel successful on paper, but not fully aligned within?
Unlsh is built on a simple belief: true success is not just what you achieve, but how deeply it reflects who you are.
Through coaching, mentorship, and access to leading voices across 
academia, research, and industry, we help you grow externally, transform
 internally, and unlock your untapped potential.
Because true success is not just achieved — it is embodied.</p>
        </div>

        {/* CTA group — removed "How it works" link per design direction */}
        <div className="split-cta-group" style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(24px, 3vw, 40px)', flexWrap: 'wrap' }}>
          
        </div>
      </div>

      {/* Video column */}
      <div
        className="split-image-col"
        style={{
          position: 'relative',
          padding: 0,
          overflow: 'hidden'
        }}>
        
        <img
          src="/assets/hero-philosophy.png"
          alt="A senior leader looking toward the future with clarity and fulfilment"
          className="split-img"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 55%'
          }} />
        
      </div>
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 3 — FEATURED COACHES / MENTORS / SPEAKERS
// ═══════════════════════════════════════════════

const featuredPeople = [
{
  role: 'Coach',
  ref: 'UNL-C01',
  name: 'Sarah Okonkwo',
  title: 'Executive & Leadership Coach',
  bio: 'Former VP at Goldman Sachs turned ICF-certified coach. Sarah works with senior leaders navigating high-stakes transitions, board dynamics, and the personal cost of ambition.',
  focus: ['C-Suite transitions', 'Board readiness', 'Leadership identity'],
  img: '/airo-assets/images/pages/home/featured-coach'
},
{
  role: 'Mentor',
  ref: 'UNL-M01',
  name: 'James Whitfield',
  title: 'Venture Builder & Operator',
  bio: 'Three-time founder, two exits. James mentors founders on the unglamorous realities of scaling — team fractures, capital discipline, and knowing when to pivot versus persist.',
  focus: ['Founder resilience', 'Scale strategy', 'Capital allocation'],
  img: '/airo-assets/images/pages/home/featured-mentor'
},
{
  role: 'Guest Speaker',
  ref: 'UNL-G01',
  name: 'Dr. Priya Nair',
  title: 'HBS Faculty · Organisational Behaviour',
  bio: 'Harvard Business School professor and author of The Quiet Edge. Priya brings rigorous research on psychological safety, high-performance teams, and the neuroscience of decision-making.',
  focus: ['Psychological safety', 'Team dynamics', 'Decision science'],
  img: '/airo-assets/images/pages/home/featured-speaker'
}];


function SpecialtiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  useReveal(headerRef, 0.1);
  useStaggerReveal(sectionRef, '.people-card', 120, 0.08);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="featured-heading"
      style={{
        backgroundColor: C.offWhite,
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)'
      }}>

      <style>{`
        .featured-header-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .featured-header-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .featured-rule-grow {
          display: block;
          width: 48px;
          height: 1px;
          background-color: ${C.green};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 160ms;
        }
        .featured-header-reveal.is-visible .featured-rule-grow { transform: scaleX(1); }
        .people-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
          display: flex;
          flex-direction: column;
          background-color: ${C.offWhite};
          border: 1px solid ${C.borderLight};
          overflow: hidden;
        }
        .people-card.is-visible { opacity: 1; transform: translateY(0); }
        .people-card:hover .people-card-img { transform: scale(1.04); }
        .people-card-img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          display: block;
          transition: transform 700ms ${EASE_LUXE};
        }
        .people-card-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: ${C.green};
        }
        .people-card-role-badge::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background-color: ${C.green};
          flex-shrink: 0;
        }
        .focus-tag {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${C.textOnLightMuted};
          border: 1px solid ${C.borderLight};
          padding: 4px 10px;
          white-space: nowrap;
        }
        .people-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2.5vw, 32px);
        }
        @media (max-width: 900px) {
          .people-grid { grid-template-columns: 1fr; max-width: 480px; margin-inline: auto; }
        }
      `}</style>

      {/* Section header */}
      <header
        ref={headerRef}
        className="featured-header-reveal"
        style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
          <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: C.borderLight, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.textOnLightMuted }}>The Support<br /><br />

          </span>
        </div>
        <h2
          id="featured-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            color: C.textOnLight,
            maxWidth: '18ch',
            marginBottom: 'clamp(20px, 3vw, 32px)', "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">
          Featured coaches, mentors &amp; speakers
        </h2>
        <span className="featured-rule-grow" aria-hidden="true" />
      </header>

      {/* Three-card grid */}
      <div className="people-grid">
        {featuredPeople.map((person) =>
        <article key={person.ref} className="people-card">
            <div style={{ overflow: 'hidden', flexShrink: 0 }}>
              <img src={person.img} alt={person.name} className="people-card-img" loading="lazy" />
            </div>
            <div style={{ padding: 'clamp(24px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="people-card-role-badge">{person.role}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.textOnLightFaint, letterSpacing: '0.08em' }}>{person.ref}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, color: C.textOnLight, letterSpacing: '0.01em', margin: 0 }}>
                  {person.name}
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textOnLightMuted, margin: 0 }}>
                  {person.title}
                </p>
              </div>
              <span style={{ display: 'block', height: '1px', backgroundColor: C.borderLight }} aria-hidden="true" />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, lineHeight: 1.75, color: C.textOnLightMuted, margin: 0, flex: 1 }}>
                {person.bio}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {person.focus.map((tag) =>
              <span key={tag} className="focus-tag">{tag}</span>
              )}
              </div>
              <Link
              to="/book"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.green, textDecoration: 'none', marginTop: '4px', transition: `color 300ms ${EASE_LUXE}` }}
              onMouseEnter={(e) => e.currentTarget.style.color = C.textOnLight}
              onMouseLeave={(e) => e.currentTarget.style.color = C.green}>
                Book a session
                <span style={{ display: 'block', width: '20px', height: '1px', backgroundColor: 'currentColor' }} aria-hidden="true" />
              </Link>
            </div>
          </article>
        )}
      </div>

      <p style={{ marginTop: 'clamp(48px, 6vw, 72px)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 400, color: C.textOnLightFaint, letterSpacing: '0.02em', maxWidth: '60ch' }}>
        Every coach, mentor, and speaker on Unlsh is vetted for depth of practice — not just credentials. We look for people who have done the work themselves.
      </p>
    </section>);

}




// ═══════════════════════════════════════════════
// SECTION 4 — FEATURED REVIEWS
// ═══════════════════════════════════════════════

const featuredReviews = [
{
  quote: 'Working with my Unlsh coach was the single most clarifying experience of my career. I left every session knowing exactly what to do next.',
  name: 'Priya Mehta',
  role: 'Founder, Series B',
  ref: 'UNL-0041'
},
{
  quote: 'I came in sceptical. I left with a framework for decisions I had been avoiding for two years. The ROI is not measurable — it is structural.',
  name: 'James Okafor',
  role: 'Chief Executive',
  ref: 'UNL-0089'
},
{
  quote: 'The coaching here operates at a different altitude. My coach understood the pressure of the role before I finished describing it.',
  name: 'Sofía Reyes',
  role: 'Managing Partner',
  ref: 'UNL-0117'
}];


function ReviewsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useReveal(headerRef, 0.1);
  useStaggerReveal(gridRef, '.review-slot', 120, 0.06);

  return (
    <section
      aria-labelledby="reviews-heading"
      style={{
        backgroundColor: C.dark900,
        padding: 'clamp(80px, 10vw, 140px) clamp(24px, 5vw, 80px)'
      }}>
      
      <style>{`
        .reviews-header-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .reviews-header-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .reviews-eyebrow-rule {
          display: block;
          width: 32px;
          height: 1px;
          background-color: ${C.green};
          flex-shrink: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 80ms;
        }
        .reviews-header-reveal.is-visible .reviews-eyebrow-rule { transform: scaleX(1); }
        .review-slot {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .review-slot.is-visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 860px) {
          .reviews-grid { grid-template-columns: 1fr !important; }
          .reviews-grid .review-slot { border-left: none !important; border-top: 1px solid ${C.borderDark} !important; padding-left: 0 !important; padding-top: clamp(36px, 5vw, 56px) !important; }
          .reviews-grid .review-slot:first-child { border-top: 1px solid ${C.borderDark} !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Header */}
      <header
        ref={headerRef}
        className="reviews-header-reveal"
        style={{ marginBottom: 'clamp(56px, 7vw, 80px)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <span className="reviews-eyebrow-rule" aria-hidden="true" />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: C.textOnDarkMuted
          }}>
            Featured reviews
          </span>
        </div>
        <h2
          id="reviews-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 42px)',
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            color: C.textOnDark, "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">
          What clients say
        </h2>
      </header>

      {/* Three-column review grid */}
      <div style={{ borderTop: `1px solid ${C.borderDark}` }} aria-hidden="true" />

      <div
        ref={gridRef}
        className="reviews-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'start'
        }}
        role="list"
        aria-label="Featured client reviews">
        
        {featuredReviews.map((review, i) =>
        <div
          key={review.ref}
          className="review-slot"
          role="listitem"
          style={{
            borderLeft: i > 0 ? `1px solid ${C.borderDark}` : 'none',
            padding: `clamp(40px, 5vw, 64px) clamp(24px, 3vw, 48px) clamp(40px, 5vw, 64px) ${i > 0 ? 'clamp(24px, 3vw, 48px)' : '0'}`
          }}>
          
            <blockquote style={{ margin: 0 }}>
              <span
              aria-hidden="true"
              style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontWeight: 400,
                fontSize: 'clamp(40px, 5vw, 56px)',
                lineHeight: 1,
                color: C.green,
                marginBottom: 'clamp(16px, 2.5vw, 24px)',
                letterSpacing: '-0.02em'
              }}>
                "
              </span>

              <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.75,
                color: C.textOnDark,
                letterSpacing: '0.01em',
                marginBottom: 'clamp(24px, 3.5vw, 36px)'
              }}>
                {review.quote}
              </p>

              <footer>
                <div
                style={{
                  width: '24px',
                  height: '1px',
                  backgroundColor: C.green,
                  marginBottom: '14px'
                }}
                aria-hidden="true" />
              
                <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: C.textOnDark,
                  marginBottom: '4px'
                }}>
                  {review.name}
                </span>
                <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: C.textOnDarkMuted,
                  marginBottom: '6px'
                }}>
                  {review.role}
                </span>
              </footer>
            </blockquote>
          </div>
        )}
      </div>

      {/* Bottom hairline */}
      <div style={{ borderTop: `1px solid ${C.borderDark}` }} aria-hidden="true" />
    </section>);

}

// ═══════════════════════════════════════════════
// SECTION 5 — OUR CORE PILLARS
// ═══════════════════════════════════════════════

const pillars = [
{ title: 'Executive Leadership', detail: 'Navigate complexity, build high-trust teams, and lead with conviction at the highest levels of an organisation.', ref: 'UNL-01', num: '01' },
{ title: 'Venture Building', detail: 'From zero to one — coaching for founders and operators who are building something that has never existed before.', ref: 'UNL-02', num: '02' },
{ title: 'Wellness & Vitality', detail: 'Sustainable performance rooted in physical and mental health. Because the body is the first instrument of leadership.', ref: 'UNL-03', num: '03' },
{ title: 'Inner Growth', detail: 'Meaning, purpose, and the inner life. For those who sense that the next chapter requires a deeper kind of knowing.', ref: 'UNL-04', num: '04' }];


function PillarsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  useReveal(headerRef, 0.08);
  useStaggerReveal(listRef, '.pillar-row-home', 80, 0.05);

  return (
    <section
      aria-labelledby="pillars-heading"
      style={{
        backgroundColor: C.dark900,
        padding: 'clamp(80px, 10vw, 140px) clamp(24px, 5vw, 80px)'
      }}>

      <style>{`
        .pillars-header-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .pillars-header-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .pillar-row-home {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: clamp(16px, 3vw, 40px);
          border-top: 1px solid ${C.borderDark};
          padding: clamp(24px, 3.5vw, 40px) clamp(24px, 5vw, 80px);
          margin-left: calc(-1 * clamp(24px, 5vw, 80px));
          margin-right: calc(-1 * clamp(24px, 5vw, 80px));
          background-color: transparent;
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE}, background-color 500ms ${EASE_LUXE};
          opacity: 0;
          transform: translateY(8px);
        }
        .pillar-row-home.is-visible { opacity: 1; transform: translateY(0); }
        .pillar-row-home:hover { background-color: ${C.dark800}; }
        .pillar-row-home:last-of-type { border-bottom: 1px solid ${C.borderDark}; }
        @media (max-width: 560px) {
          .pillar-row-home { flex-wrap: wrap; align-items: flex-start; }
        }
      `}</style>

      <header
        ref={headerRef}
        className="pillars-header-reveal"
        style={{ marginBottom: 'clamp(48px, 6vw, 72px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
          <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: C.borderDark, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.textOnDarkMuted }}>
            What we offer
          </span>
        </div>
        <h2
          id="pillars-heading"
          style={{ fontFamily: "Futura, 'Trebuchet MS', sans-serif",

            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            color: C.textOnDark,
            maxWidth: '20ch', "--font-heading": "Futura, 'Trebuchet MS', sans-serif"
          } as React.CSSProperties} className="">
          Our core pillars
        </h2>
      </header>

      <ol ref={listRef} style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-label="Core pillars">
        {pillars.map((p) =>
        <li key={p.ref} className="pillar-row-home">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
              <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontWeight: 500,
              lineHeight: 1.3,
              color: C.textOnDark,
              letterSpacing: '0.01em'
            }}>
                {p.title}
              </span>
              <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              fontWeight: 400,
              color: C.textOnDarkMuted,
              letterSpacing: '0.01em',
              lineHeight: 1.65,
              maxWidth: '52ch'
            }}>
                {p.detail}
              </span>
            </div>
          </li>
        )}
      </ol>
    </section>);

}

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════
export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Unlsh — Executive Coaching &amp; Mentoring for High Achievers</title>
        <meta
          name="description"
          content="Unlsh connects high achievers with world-class coaches across executive leadership, venture building, wellness, and spiritual growth. Book a free 20-minute call today." />
        
        <link rel="canonical" href="https://unlsh.com/" />
        <meta property="og:title" content="Unlsh — Executive Coaching &amp; Mentoring for High Achievers" />
        <meta property="og:description" content="Unlock what is next. World-class coaching, expert access, and inner transformation — all in one community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://unlsh.com/" />
        <meta property="og:image" content="https://unlsh.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Unlsh — Executive Coaching &amp; Mentoring for High Achievers" />
        <meta name="twitter:description" content="Unlock what is next. World-class coaching, expert access, and inner transformation — all in one community." />
        <meta name="twitter:image" content="https://unlsh.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Unlsh',
            url: 'https://unlsh.com',
            description: 'A hybrid executive coaching and mentoring community combining world-class guidance, expert access, and inner transformation for high achievers.',
            sameAs: [],
            offers: {
              '@type': 'Offer',
              description: 'Executive coaching sessions, mentoring, and community membership',
              url: 'https://unlsh.com/book'
            }
          })}</script>
      </Helmet>

      <HeroSection />
      <ValuePropSection />
      <PillarsSection />
      <SpecialtiesSection />
      <ReviewsSection />
    </>);

}