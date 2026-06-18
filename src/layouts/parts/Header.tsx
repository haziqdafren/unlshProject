import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/about', label: 'About' },
    { href: '/coaches-preview', label: 'Coaches' },
    { href: '/inquiry', label: 'Inquiry' },
  ];

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#D9CFBB' }}>

      <div className="mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex h-auto py-4 items-center justify-between">

          {/* Logo */}
          <Link to="/" aria-label="Unlsh home" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <img
              src="/assets/unlsh-logo-transparent.png"
              alt="UN/SH"
              style={{
                height: '44px',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 900,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: location.pathname === item.href ? '#0A0A0A' : 'rgba(10,10,10,0.7)',
                  textDecoration: 'none',
                  transition: 'color 300ms',
                  WebkitFontSmoothing: 'antialiased',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    location.pathname === item.href ? '#0A0A0A' : 'rgba(10,10,10,0.7)')
                }>
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 900,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.12em',
                color: '#0A0A0A',
                textDecoration: 'none',
                padding: '8px 20px',
                border: '1px solid rgba(10,10,10,0.35)',
                transition: 'background-color 250ms, border-color 250ms',
                WebkitFontSmoothing: 'antialiased',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(10,10,10,0.08)';
                e.currentTarget.style.borderColor = 'rgba(10,10,10,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(10,10,10,0.35)';
              }}>
              Login
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
            style={{ color: '#0A0A0A' }}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden py-6"
            style={{ borderTop: '1px solid rgba(10,10,10,0.15)' }}>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 900,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em',
                    color: location.pathname === item.href ? '#0A0A0A' : 'rgba(10,10,10,0.7)',
                    textDecoration: 'none',
                    paddingBlock: '8px',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 900,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: '#0A0A0A',
                  textDecoration: 'none',
                  paddingBlock: '8px',
                  WebkitFontSmoothing: 'antialiased',
                  borderTop: '1px solid rgba(10,10,10,0.10)',
                  marginTop: '4px',
                  paddingTop: '16px',
                }}
                onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
