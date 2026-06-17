import { Link } from 'react-router-dom';

const EASE_LUXE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const BG = '#D9CFBB';
const FG = '#1A1A1A';
const FG_MUTED = 'rgba(26,26,26,0.55)';
const FG_FAINT = 'rgba(26,26,26,0.30)';
const BORDER = 'rgba(26,26,26,0.12)';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { href: '/about',           label: 'About' },
    { href: '/coaches-preview', label: 'Coaches' },
    { href: '/inquiry',         label: 'Book a Session' },
  ];

  return (
    <footer style={{ backgroundColor: BG }}>

      {/* ── Editorial statement ── */}
      <div
        style={{
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 5vw, 80px) clamp(56px, 8vw, 96px)',
        }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 400,
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            color: FG,
            maxWidth: '18ch',
            margin: 0,
          }}>
          Stop waiting to be{' '}
          <span style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.45)' }}>
            ready.
          </span>{' '}
          Start doing the{' '}
          <span style={{ fontStyle: 'italic', color: 'rgba(26,26,26,0.45)' }}>
            work.
          </span>
        </p>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: 'clamp(24px, 3vw, 36px) clamp(24px, 5vw, 80px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>

        {/* Logo */}
        <Link
          to="/"
          aria-label="Unlsh home"
          style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img
            src="/assets/unlsh-logo-transparent.png"
            alt="UN/SH"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.12em',
                color: FG_MUTED,
                textDecoration: 'none',
                transition: `color 300ms ${EASE_LUXE}`,
                WebkitFontSmoothing: 'antialiased',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = FG)}
              onMouseLeave={(e) => (e.currentTarget.style.color = FG_MUTED)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 700,
            color: FG_FAINT,
            letterSpacing: '0.06em',
            margin: 0,
          }}>
          © {currentYear} Unlsh
        </p>
      </div>
    </footer>
  );
}
