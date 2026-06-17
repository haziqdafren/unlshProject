import { useEffect, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

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

const SAVVYCAL_URL  = 'https://savvycal.com/jessieli/chat-with-jessie';
const INQUIRY_EMAIL = 'hello@jessieli.co';
const TOPICS        = ['1:1 coaching', 'Speaking engagements', 'Other'];

type SubmitMode = 'call' | 'email';

interface FormValues {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  topic:     string;
  message:   string;
}

const BLANK: FormValues = {
  firstName: '', lastName: '', email: '',
  phone: '', topic: '1:1 coaching', message: '',
};

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

// ─── Hero section (dark900, matches AboutHero exactly) ────────────────────────
function BookHero() {
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
        const raf = requestAnimationFrame(trigger);
        return () => cancelAnimationFrame(raf);
      }
    }

    const fallback = setTimeout(trigger, 800);
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); trigger(); obs.disconnect(); }
    }, { threshold: 0.01 });
    if (headlineRef.current) obs.observe(headlineRef.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <section
      aria-labelledby="book-hero-heading"
      style={{
        backgroundColor: C.dark900,
        padding: 'clamp(140px, 18vw, 220px) clamp(24px, 5vw, 80px) clamp(100px, 14vw, 180px)',
      }}>

      <style>{`
        .book-hero-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .book-hero-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .book-prose-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 700ms ${EASE_LUXE} 160ms, transform 700ms ${EASE_LUXE} 160ms;
        }
        .book-prose-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .book-hero-rule {
          display: block;
          width: 40px;
          height: 1px;
          background-color: ${C.green};
          margin-bottom: clamp(24px, 3.5vw, 36px);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 200ms;
        }
        .book-prose-reveal.is-visible .book-hero-rule { transform: scaleX(1); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Headline zone */}
      <div ref={headlineRef} className="book-hero-reveal" style={{ maxWidth: 'min(860px, 70%)' }}>
        <p
          aria-hidden="true"
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
            gap: '14px',
          }}>
          <span style={{ display: 'block', width: '28px', height: '1px', backgroundColor: C.borderDark, flexShrink: 0 }} />
          Book a Session
        </p>

        <h1
          id="book-hero-heading"
          style={{
            fontFamily: "Futura, 'Trebuchet MS', sans-serif",
            "--font-heading": "Futura, 'Trebuchet MS', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(52px, 7.5vw, 72px)',
            lineHeight: 1.06,
            letterSpacing: '0.01em',
            color: C.textOnDark,
            textTransform: 'lowercase' as const,
          } as React.CSSProperties}>
          start the conversation
        </h1>
      </div>

      {/* Editorial void */}
      <div style={{ height: 'clamp(72px, 10vw, 140px)' }} aria-hidden="true" />

      {/* Prose zone */}
      <div ref={proseRef} className="book-prose-reveal" style={{ maxWidth: '56ch' }}>
        <span className="book-hero-rule" aria-hidden="true" />
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '18px',
          fontWeight: 400,
          lineHeight: 1.75,
          color: C.textOnDarkMuted,
          letterSpacing: '0.01em',
        }}>
          Whether you're exploring coaching, speaking engagements, or simply want to
          connect — I'd love to hear from you. Every meaningful conversation starts
          with a single message.
        </p>
      </div>
    </section>
  );
}

// ─── Form section (offWhite, matches WhatSetsUsApart layout) ──────────────────
function BookForm() {
  const [form, setForm]           = useState<FormValues>(BLANK);
  const [submitted, setSubmitted] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);

  // formRef targets the div that carries .book-form-reveal so `is-visible`
  // lands on the element the CSS transition is attached to.
  const formRef = useRef<HTMLDivElement>(null);

  useReveal(formRef as React.RefObject<Element>, 0.05);

  function set(field: keyof FormValues, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleScheduleCall(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMode('call');
    setSubmitted(true);
    window.open(SAVVYCAL_URL, '_blank', 'noopener,noreferrer');
  }

  function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMode('email');
    setSubmitted(true);
    const subject = encodeURIComponent(`Book a Session — ${form.topic}`);
    const body    = encodeURIComponent(
      `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}${form.phone ? `\nPhone: ${form.phone}` : ''}\nTopic: ${form.topic}\n\n${form.message}`,
    );
    window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
  }

  const canSubmit = !!(form.firstName.trim() && form.email.trim() && form.message.trim());

  if (submitted) {
    return (
      <section
        style={{
          backgroundColor: C.offWhite,
          padding: 'clamp(100px, 14vw, 200px) clamp(24px, 5vw, 80px)',
          borderTop: `1px solid ${C.borderLight}`,
        }}>
        <style>{`
          .book-success-reveal {
            opacity: 0; transform: translateY(16px);
            animation: book-in 0.7s ${EASE_LUXE} 0.1s forwards;
          }
          @keyframes book-in { to { opacity: 1; transform: none; } }
          .book-success-btn {
            display: inline-block;
            background-color: ${C.green};
            color: #000;
            font-family: var(--font-sans);
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 14px 40px;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            text-decoration: none;
            line-height: 1;
            transition: background-color 300ms ${EASE_LUXE};
          }
          .book-success-btn:hover { background-color: ${C.greenHover}; }
        `}</style>
        <div className="book-success-reveal">
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.16em',
            color: C.green,
            marginBottom: 'clamp(24px, 3.5vw, 40px)',
          }}>
            {submitMode === 'call' ? 'Scheduling' : 'Message sent'}
          </p>
          <h2 style={{
            fontFamily: "Futura, 'Trebuchet MS', sans-serif",
            "--font-heading": "Futura, 'Trebuchet MS', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.06,
            letterSpacing: '0.01em',
            color: C.textOnLight,
            textTransform: 'lowercase' as const,
            maxWidth: '16ch',
            marginBottom: 'clamp(32px, 5vw, 56px)',
          } as React.CSSProperties}>
            {submitMode === 'call' ? "opening your calendar" : "we'll be in touch"}
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: C.textOnLightMuted,
            maxWidth: '44ch',
            marginBottom: 'clamp(40px, 6vw, 64px)',
          }}>
            {submitMode === 'call'
              ? 'Pick a time that works for you — we look forward to the conversation.'
              : `Your message has been drafted to ${INQUIRY_EMAIL}. We'll respond soon.`}
          </p>
          <button
            className="book-success-btn"
            onClick={() => { setSubmitted(false); setSubmitMode(null); setForm(BLANK); }}>
            Send another message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: C.offWhite,
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)',
        borderTop: `1px solid ${C.borderLight}`,
      }}>

      <style>{`
        .book-form-reveal {
          opacity: 0; transform: translateY(12px);
          transition: opacity 700ms ${EASE_LUXE}, transform 700ms ${EASE_LUXE};
        }
        .book-form-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .book-eyebrow-rule {
          display: block; width: 28px; height: 1px;
          background-color: ${C.green}; flex-shrink: 0;
          transform: scaleX(0); transform-origin: left;
          transition: transform 500ms ${EASE_LUXE} 80ms;
        }
        .book-form-reveal.is-visible .book-eyebrow-rule { transform: scaleX(1); }

        /* Inputs */
        .book-input {
          width: 100%; box-sizing: border-box;
          background: #fff; border: 1px solid ${C.borderLight};
          padding: 14px 16px; font-family: var(--font-sans); font-size: 16px;
          color: ${C.textOnLight}; outline: none; border-radius: 0;
          transition: border-color 250ms ${EASE_LUXE}; -webkit-appearance: none;
          letterSpacing: '0.01em';
        }
        .book-input::placeholder { color: ${C.textOnLightFaint}; }
        .book-input:focus { border-color: ${C.dark900}; }

        .book-label {
          display: block; font-family: var(--font-sans);
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: ${C.textOnLightFaint}; margin-bottom: 8px;
        }

        .book-select {
          width: 100%; box-sizing: border-box;
          background: #fff; border: 1px solid ${C.borderLight};
          padding: 14px 16px; font-family: var(--font-sans); font-size: 16px;
          color: ${C.textOnLight}; outline: none; border-radius: 0;
          cursor: pointer; appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A4A42' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 16px center;
          transition: border-color 250ms ${EASE_LUXE};
        }
        .book-select:focus { border-color: ${C.dark900}; }

        /* CTA buttons — matches about.tsx btn styles */
        .book-btn-green {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background-color: ${C.green}; color: #000;
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          padding: 18px 40px; border: none; border-radius: 2px;
          cursor: pointer; line-height: 1; white-space: nowrap;
          transition: background-color 300ms ${EASE_LUXE}; flex: 1; min-width: 200px;
        }
        .book-btn-green:hover { background-color: ${C.greenHover}; }
        .book-btn-green:disabled { opacity: 0.38; cursor: not-allowed; }
        .book-btn-green:focus-visible { outline: 2px solid ${C.green}; outline-offset: 3px; }

        .book-btn-dark {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background-color: ${C.dark900}; color: ${C.textOnDark};
          font-family: var(--font-sans); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          padding: 18px 40px; border: none; border-radius: 2px;
          cursor: pointer; line-height: 1; white-space: nowrap;
          transition: background-color 300ms ${EASE_LUXE}; flex: 1; min-width: 200px;
        }
        .book-btn-dark:hover { background-color: ${C.dark800}; }
        .book-btn-dark:disabled { opacity: 0.38; cursor: not-allowed; }
        .book-btn-dark:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 3px; }

        @media (max-width: 600px) {
          .book-name-grid { grid-template-columns: 1fr !important; }
          .book-btn-green, .book-btn-dark { min-width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div ref={formRef} className="book-form-reveal" style={{ maxWidth: '640px' }}>

        {/* Section eyebrow (matches about.tsx WhatSetsUsApart pattern) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(20px, 3vw, 28px)' }}>
          <span className="book-eyebrow-rule" aria-hidden="true" />
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.14em',
            color: C.textOnLightFaint,
          }}>
            Get in touch
          </span>
        </div>

        <h2 style={{
          fontFamily: "Futura, 'Trebuchet MS', sans-serif",
          "--font-heading": "Futura, 'Trebuchet MS', sans-serif",
          fontWeight: 400,
          fontSize: 'clamp(28px, 4vw, 38px)',
          lineHeight: 1.1,
          letterSpacing: '0.01em',
          color: C.textOnLight,
          textTransform: 'lowercase' as const,
          marginBottom: 'clamp(40px, 6vw, 64px)',
        } as React.CSSProperties}>
          how would you like to connect?
        </h2>

        <form noValidate>

          {/* Topic */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="book-topic" className="book-label">Topic</label>
            <select
              id="book-topic" className="book-select"
              value={form.topic} onChange={e => set('topic', e.target.value)}>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Name */}
          <div
            className="book-name-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="book-first" className="book-label">First name</label>
              <input
                id="book-first" type="text" className="book-input"
                placeholder="First" value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                autoComplete="given-name" required
              />
            </div>
            <div>
              <label htmlFor="book-last" className="book-label">Last name</label>
              <input
                id="book-last" type="text" className="book-input"
                placeholder="Last" value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="book-email" className="book-label">Email</label>
            <input
              id="book-email" type="email" className="book-input"
              placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)}
              autoComplete="email" required
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="book-phone" className="book-label">
              Phone{' '}
              <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, color: C.textOnLightFaint }}>
                (optional)
              </span>
            </label>
            <input
              id="book-phone" type="tel" className="book-input"
              placeholder="+1 (555) 000-0000" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              autoComplete="tel"
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 'clamp(40px, 6vw, 56px)' }}>
            <label htmlFor="book-message" className="book-label">Message</label>
            <textarea
              id="book-message" className="book-input"
              placeholder="Tell me a little about what you're looking for…"
              value={form.message}
              onChange={e => set('message', e.target.value)}
              rows={5} required
              style={{ resize: 'vertical', minHeight: '130px' }}
            />
          </div>

          {/* Submit — two options */}
          <div>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: C.textOnLightFaint, marginBottom: '16px',
            }}>
              Choose how to connect
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>
              <button
                type="submit" className="book-btn-green"
                disabled={!canSubmit} onClick={handleScheduleCall}
                aria-label="Schedule a 15–30 minute call">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Schedule a call
                <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '11px' }}>15–30 min</span>
              </button>
              <button
                type="submit" className="book-btn-dark"
                disabled={!canSubmit} onClick={handleSendEmail}
                aria-label="Send inquiry email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send message
              </button>
            </div>
            {!canSubmit && (
              <p style={{
                marginTop: '12px', fontFamily: 'var(--font-sans)', fontSize: '13px',
                color: C.textOnLightFaint, letterSpacing: '0.01em',
              }}>
                Fill in your name, email, and message to continue.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InquiryPage() {
  return (
    <>
      <Helmet>
        <title>Book a Session — Unlsh Executive Coaching</title>
        <meta name="description" content="Whether you're exploring coaching, speaking engagements, or simply want to connect — every meaningful conversation starts with a single message." />
        <link rel="canonical" href="https://un-lsh.com/inquiry" />
      </Helmet>
      <main>
        <BookHero />
        <BookForm />
      </main>
    </>
  );
}
