import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

const BOOK_SEO =
<Helmet>
    <title>Book a Session — Unlsh Executive Coaching</title>
    <meta
    name="description"
    content="Book a free 20-minute discovery call or a full coaching session with an Unlsh executive coach. No pitch, no pressure — just an honest conversation about where you want to go." />

    <link rel="canonical" href="https://unlsh.com/book" />
    <meta property="og:title" content="Book a Session — Unlsh Executive Coaching" />
    <meta property="og:description" content="Book a free 20-minute discovery call or a full coaching session. World-class executive coaches ready to help you unlock what is next." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://unlsh.com/book" />
    <meta property="og:image" content="https://unlsh.com/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Book a Session — Unlsh Executive Coaching" />
    <meta name="twitter:description" content="Book a free 20-minute discovery call or a full coaching session with a world-class Unlsh coach." />
    <meta name="twitter:image" content="https://unlsh.com/og-image.jpg" />
    <script type="application/ld+json">{JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Executive Coaching Session',
      provider: {
        '@type': 'Organization',
        name: 'Unlsh',
        url: 'https://unlsh.com'
      },
      url: 'https://unlsh.com/book',
      description: 'One-on-one executive coaching sessions with world-class coaches across leadership, venture building, wellness, and spiritual growth.',
      offers: {
        '@type': 'Offer',
        url: 'https://unlsh.com/book',
        description: 'Book a free 20-minute discovery call or a full coaching session.'
      }
    })}</script>
  </Helmet>;


// ─── Kit tokens ───────────────────────────────────────────────────────────────
const T = {
  dark900: '#1A1A1A',
  dark800: '#2E2E2E',
  dark700: '#4A4A42',
  offWhite: '#F5F5F0',
  muted: '#E8E8E2',
  green: '#D9CFBB',
  greenHover: '#c4b9a4',
  borderLight: 'rgba(26,26,26,0.12)',
  borderMuted: 'rgba(26,26,26,0.08)',
  textPrimary: '#1A1A1A',
  textMuted: '#4A4A42',
  textFaint: 'rgba(26,26,26,0.45)',
  ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
};

const SAVVYCAL_URL = 'https://savvycal.com/jessieli/chat-with-jessie';

// ─── Coach options ─────────────────────────────────────────────────────────────
const COACHES = [
{ value: '', label: 'Select a coach', disabled: true },
{ value: 'executive', label: 'Executive Leadership' },
{ value: 'venture', label: 'Venture Building' },
{ value: 'wellness', label: 'Wellness & Vitality' },
{ value: 'spiritual', label: 'Spiritual Growth' }];


const SESSION_TYPES = [
{ value: '', label: 'Select session type', disabled: true },
{ value: 'intro', label: 'Introductory call — 30 min' },
{ value: 'deep', label: 'Deep-dive session — 60 min' },
{ value: 'intensive', label: 'Intensive — 90 min' }];


// ─── Month names ───────────────────────────────────────────────────────────────
const MONTHS = [
'January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'];

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ─── Availability logic ────────────────────────────────────────────────────────
function isUnavailable(date: Date, today: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  if (date < today) return true;
  if (date.getDate() <= 3) return true;
  return false;
}

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d} / ${m} / ${y}`;
}

// ─── Calendar component ────────────────────────────────────────────────────────
interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

function BookingCalendar({ selectedDate, onSelect }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (displayMonth === 0) {setDisplayMonth(11);setDisplayYear((y) => y - 1);} else
    setDisplayMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (displayMonth === 11) {setDisplayMonth(0);setDisplayYear((y) => y + 1);} else
    setDisplayMonth((m) => m + 1);
  };

  const firstDay = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(displayYear, displayMonth, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

  return (
    <div>
      <style>{`
        .cal-nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: ${T.textMuted};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 300ms ${T.ease};
          border-radius: 0;
        }
        .cal-nav-btn:hover { color: ${T.textPrimary}; }
        .cal-nav-btn:focus-visible { outline: 2px solid ${T.dark900}; outline-offset: 2px; }

        .cal-date-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 1;
          background: none;
          border: 1px solid transparent;
          border-radius: 0;
          font-family: var(--font-mono);
          font-size: clamp(11px, 1.3vw, 13px);
          font-weight: 400;
          color: ${T.textPrimary};
          cursor: pointer;
          transition: background-color 300ms ${T.ease}, color 300ms ${T.ease}, border-color 300ms ${T.ease};
          line-height: 1;
        }
        .cal-date-btn:not(:disabled):not(.is-selected):hover {
          background-color: ${T.muted};
        }
        .cal-date-btn:focus-visible {
          outline: 2px solid ${T.dark900};
          outline-offset: 1px;
          position: relative;
          z-index: 1;
        }
        .cal-date-btn.is-today { border-color: ${T.borderLight}; }
        .cal-date-btn.is-selected {
          background-color: ${T.green};
          color: ${T.offWhite};
          border-color: ${T.green};
          cursor: default;
        }
        .cal-date-btn:disabled {
          color: ${T.textFaint};
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
        }
        .cal-date-btn.is-empty { visibility: hidden; pointer-events: none; }
      `}</style>

      {/* Calendar header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(16px, 2.5vw, 24px)',
        paddingBottom: 'clamp(12px, 1.8vw, 18px)',
        borderBottom: `1px solid ${T.borderLight}`
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: T.textPrimary
          }}>
            {MONTHS[displayMonth]}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: T.textMuted,
            marginLeft: '8px'
          }}>
            {displayYear}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar table */}
      <table
        style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}
        role="grid"
        aria-label={`${MONTHS[displayMonth]} ${displayYear}`}>
        <thead>
          <tr>
            {DAYS_SHORT.map((d, i) =>
            <th
              key={i}
              scope="col"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: T.textMuted,
                textAlign: 'center',
                paddingBottom: 'clamp(8px, 1.2vw, 12px)'
              }}>
                {d}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) =>
          <tr key={ri}>
              {row.map((date, ci) => {
              if (!date) {
                return (
                  <td key={ci} role="gridcell">
                    <button className="cal-date-btn is-empty" tabIndex={-1} aria-hidden="true"> </button>
                  </td>);
              }
              const unavail = isUnavailable(date, today);
              const isToday = isSameDay(date, today);
              const isSel = selectedDate ? isSameDay(date, selectedDate) : false;
              let cls = 'cal-date-btn';
              if (isToday) cls += ' is-today';
              if (isSel) cls += ' is-selected';
              return (
                <td key={ci} role="gridcell">
                  <button
                    className={cls}
                    disabled={unavail}
                    aria-pressed={isSel}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={`${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`}
                    onClick={() => !unavail && onSelect(date)}>
                    {date.getDate()}
                  </button>
                </td>);
            })}
            </tr>
          )}
        </tbody>
      </table>

      {/* Legend */}
      <div style={{
        marginTop: 'clamp(14px, 2vw, 20px)',
        paddingTop: 'clamp(12px, 1.8vw, 16px)',
        borderTop: `1px solid ${T.borderLight}`,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px'
      }}>
        {[
        { label: 'Available', style: { border: `1px solid ${T.textMuted}`, opacity: 1 } },
        { label: 'Unavailable', style: { border: `1px solid ${T.textMuted}`, opacity: 0.35 } },
        { label: 'Selected', style: { backgroundColor: T.green } }].
        map(({ label, style }) =>
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '14px', flexShrink: 0, ...style }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: T.textFaint }}>{label}</span>
          </div>
        )}
      </div>
    </div>);
}

// ─── Field component ───────────────────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: T.dark800
        }}>
        {label}
        {required && <span style={{ color: T.green, marginLeft: '3px' }} aria-hidden="true">*</span>}
      </label>
      {children}
      {error &&
      <span
        role="alert"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: T.dark800,
          marginTop: '2px'
        }}>
          {error}
        </span>
      }
    </div>);
}

// ─── Input styles ──────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${T.borderLight}`,
  borderRadius: 0,
  padding: '10px 0',
  fontFamily: 'var(--font-sans)',
  fontSize: '16px',
  fontWeight: 400,
  color: T.textPrimary,
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  caretColor: T.green,
  lineHeight: 1.5
};

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function BookPage() {
  const headerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headerRef.current, bodyRef.current].filter(Boolean) as Element[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coach, setCoach] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setErrors((prev) => ({ ...prev, date: '' }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Please enter a valid email address.';
    if (!selectedDate) errs.date = 'Please select a date from the calendar.';
    if (!coach) errs.coach = 'Please select a coaching area.';
    if (!sessionType) errs.sessionType = 'Please select a session type.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Build SavvyCal URL with prefilled name + email as query params
      const params = new URLSearchParams();
      if (name) params.set('name', name);
      if (email) params.set('email', email);
      if (notes) params.set('note', notes);
      window.open(`${SAVVYCAL_URL}?${params.toString()}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {BOOK_SEO}

      <style>{`
        .booking-header-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 700ms cubic-bezier(0.25,0.46,0.45,0.94), transform 700ms cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .booking-header-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .booking-eyebrow-rule {
          display: block;
          width: 32px;
          height: 1px;
          background-color: ${T.green};
          flex-shrink: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms cubic-bezier(0.25,0.46,0.45,0.94) 80ms;
        }
        .booking-header-reveal.is-visible .booking-eyebrow-rule { transform: scaleX(1); }
        .booking-body-reveal {
          opacity: 0;
          transition: opacity 700ms cubic-bezier(0.25,0.46,0.45,0.94) 120ms;
        }
        .booking-body-reveal.is-visible { opacity: 1; }
        .field-input-styled:focus { border-bottom-color: ${T.green}; }
        .field-input-styled::placeholder { color: ${T.textFaint}; }
        .select-styled { cursor: pointer; }
        .select-styled option { color: ${T.textPrimary}; background: ${T.offWhite}; }
        .btn-book {
          display: inline-block;
          background-color: ${T.dark900};
          color: ${T.offWhite};
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 14px 40px;
          border: 1px solid ${T.dark900};
          border-radius: 2px;
          cursor: pointer;
          transition: background-color 300ms cubic-bezier(0.25,0.46,0.45,0.94), border-color 300ms cubic-bezier(0.25,0.46,0.45,0.94);
          line-height: 1;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .btn-book:hover { background-color: ${T.dark800}; border-color: ${T.dark800}; }
        .btn-book:active { transform: translateY(1px); }
        .btn-book:focus-visible { outline: 2px solid ${T.dark900}; outline-offset: 3px; }
        @media (max-width: 768px) {
          .booking-grid { display: flex !important; flex-direction: column; gap: clamp(40px, 7vw, 64px); }
          .calendar-sticky { position: static !important; top: auto !important; max-width: 360px; }
          .field-pair { grid-template-columns: 1fr !important; gap: 36px; }
        }
        @media (max-width: 520px) {
          .calendar-sticky { max-width: 100%; }
          .submit-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main
        style={{
          backgroundColor: T.offWhite,
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 5vw, 80px)'
        }}
        aria-labelledby="booking-heading">

        {/* Section header */}
        <header
          ref={headerRef}
          className="booking-header-reveal"
          style={{ marginBottom: 'clamp(48px, 6vw, 80px)', maxWidth: '720px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
            <span className="booking-eyebrow-rule" aria-hidden="true" />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.12em',
              color: T.textFaint
            }}>
              Book a session
            </span>
          </div>

          <h1
            id="booking-heading"
            style={{
              fontFamily: "Futura, 'Trebuchet MS', sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(32px, 5vw, 44px)',
              lineHeight: 1.08,
              letterSpacing: '0.01em',
              color: T.textPrimary,
              marginBottom: 'clamp(14px, 2vw, 20px)',
            } as React.CSSProperties}>
            Begin the work
          </h1>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: T.textMuted,
            maxWidth: '56ch',
            letterSpacing: '0.01em'
          }}>
            Select a date, fill in your details, and tell us what you are working on. You will be taken to our scheduling page to confirm your time.
          </p>
        </header>

        {/* Booking body: calendar | gap | form */}
        <div
          ref={bodyRef}
          className="booking-body-reveal booking-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) clamp(32px, 4vw, 60px) minmax(0, 3fr)',
            alignItems: 'start'
          }}>

          {/* Calendar column */}
          <div
            className="calendar-sticky"
            style={{
              gridColumn: '1 / 2',
              position: 'sticky',
              top: 'clamp(80px, 10vw, 100px)',
              alignSelf: 'start'
            }}
            aria-label="Select a session date">
            <BookingCalendar selectedDate={selectedDate} onSelect={handleSelect} />
          </div>

          {/* Gap column */}
          <div style={{ gridColumn: '2 / 3' }} aria-hidden="true" />

          {/* Form column */}
          <div style={{ gridColumn: '3 / 4' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(12px, 1.4vw, 14px)',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.12em',
              color: T.textFaint,
              marginBottom: 'clamp(28px, 4vw, 44px)'
            }}>
              Session details
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Book a coaching session"
              style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

              {/* Name + Email */}
              <div
                className="field-pair"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

                <Field id="input-name" label="Full name" required error={errors.name}>
                  <input
                    id="input-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => {setName(e.target.value);setErrors((p) => ({ ...p, name: '' }));}}
                    className="field-input-styled"
                    style={{ ...inputStyle, borderBottomColor: errors.name ? T.green : T.borderLight }}
                    aria-describedby={errors.name ? 'name-error' : undefined} />
                </Field>

                <Field id="input-email" label="Email" required error={errors.email}>
                  <input
                    id="input-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => {setEmail(e.target.value);setErrors((p) => ({ ...p, email: '' }));}}
                    className="field-input-styled"
                    style={{ ...inputStyle, borderBottomColor: errors.email ? T.green : T.borderLight }} />
                </Field>
              </div>

              {/* Selected date (read-only, filled by calendar) */}
              <Field id="input-date" label="Preferred date" required error={errors.date}>
                <input
                  id="input-date"
                  type="text"
                  name="date"
                  readOnly
                  placeholder="Choose a date from the calendar"
                  value={selectedDate ? formatDate(selectedDate) : ''}
                  className="field-input-styled"
                  style={{
                    ...inputStyle,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    borderBottomColor: errors.date ? T.green : selectedDate ? T.green : T.borderLight,
                    cursor: 'default'
                  }}
                  aria-live="polite" />
              </Field>

              {/* Coaching area */}
              <Field id="input-coach" label="Coaching area" required error={errors.coach}>
                <div style={{ position: 'relative' }}>
                  <select
                    id="input-coach"
                    name="coach"
                    required
                    value={coach}
                    onChange={(e) => {setCoach(e.target.value);setErrors((p) => ({ ...p, coach: '' }));}}
                    className="field-input-styled select-styled"
                    style={{ ...inputStyle, paddingRight: '24px', borderBottomColor: errors.coach ? T.green : T.borderLight }}>
                    {COACHES.map((c) =>
                      <option key={c.value} value={c.value} disabled={c.disabled}>{c.label}</option>
                    )}
                  </select>
                  <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.textMuted }} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Field>

              {/* Session type */}
              <Field id="input-session" label="Session type" required error={errors.sessionType}>
                <div style={{ position: 'relative' }}>
                  <select
                    id="input-session"
                    name="sessionType"
                    required
                    value={sessionType}
                    onChange={(e) => {setSessionType(e.target.value);setErrors((p) => ({ ...p, sessionType: '' }));}}
                    className="field-input-styled select-styled"
                    style={{ ...inputStyle, paddingRight: '24px', borderBottomColor: errors.sessionType ? T.green : T.borderLight }}>
                    {SESSION_TYPES.map((s) =>
                      <option key={s.value} value={s.value} disabled={s.disabled}>{s.label}</option>
                    )}
                  </select>
                  <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.textMuted }} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Field>

              {/* Notes */}
              <Field id="input-notes" label="What are you working on?">
                <textarea
                  id="input-notes"
                  name="notes"
                  rows={4}
                  placeholder="Share what you are navigating — a transition, a decision, a pattern you want to change."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="field-input-styled"
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '100px',
                    lineHeight: 1.7
                  }} />
              </Field>

              {/* Submit */}
              <div
                className="submit-row"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(20px, 3vw, 36px)', flexWrap: 'wrap', paddingTop: '4px' }}>
                <button type="submit" className="btn-book">
                  Book on SavvyCal →
                </button>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: T.textFaint,
                  maxWidth: '30ch'
                }}>
                  You'll be taken to our scheduling page to pick your exact time.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>);
}
