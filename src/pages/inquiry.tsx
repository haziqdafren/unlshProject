import { useEffect, useRef, useState, useMemo } from 'react';
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
const TOPICS = [
  'Executive coaching',
  'Founder support',
  'Leadership growth and transition',
  'Strategic clarity and decision-making',
  'Executive presence, communication, and influence',
  'Team leadership and organisational complexity',
  'Sustainable leadership and burnout prevention',
  'Purpose, fulfilment, and next chapter',
  'Joining Unlsh as a coach/mentor/therapist',
  'Speaking opportunities with Unlsh',
  'Other',
];

type SubmitMode = 'call' | 'email';

const INQUIRER_TYPES = [
  'Individual',
  'Coach / Mentor / Other Expert',
  'Company',
  'Investor / Sponsor',
  'Other',
];

const COUNTRY_CODES = [
  { code: '+93',  name: 'Afghanistan',                  flag: '🇦🇫' },
  { code: '+355', name: 'Albania',                       flag: '🇦🇱' },
  { code: '+213', name: 'Algeria',                       flag: '🇩🇿' },
  { code: '+376', name: 'Andorra',                       flag: '🇦🇩' },
  { code: '+244', name: 'Angola',                        flag: '🇦🇴' },
  { code: '+1',   name: 'Antigua and Barbuda',           flag: '🇦🇬' },
  { code: '+54',  name: 'Argentina',                     flag: '🇦🇷' },
  { code: '+374', name: 'Armenia',                       flag: '🇦🇲' },
  { code: '+61',  name: 'Australia',                     flag: '🇦🇺' },
  { code: '+43',  name: 'Austria',                       flag: '🇦🇹' },
  { code: '+994', name: 'Azerbaijan',                    flag: '🇦🇿' },
  { code: '+1',   name: 'Bahamas',                       flag: '🇧🇸' },
  { code: '+973', name: 'Bahrain',                       flag: '🇧🇭' },
  { code: '+880', name: 'Bangladesh',                    flag: '🇧🇩' },
  { code: '+1',   name: 'Barbados',                      flag: '🇧🇧' },
  { code: '+375', name: 'Belarus',                       flag: '🇧🇾' },
  { code: '+32',  name: 'Belgium',                       flag: '🇧🇪' },
  { code: '+501', name: 'Belize',                        flag: '🇧🇿' },
  { code: '+229', name: 'Benin',                         flag: '🇧🇯' },
  { code: '+975', name: 'Bhutan',                        flag: '🇧🇹' },
  { code: '+591', name: 'Bolivia',                       flag: '🇧🇴' },
  { code: '+387', name: 'Bosnia and Herzegovina',        flag: '🇧🇦' },
  { code: '+267', name: 'Botswana',                      flag: '🇧🇼' },
  { code: '+55',  name: 'Brazil',                        flag: '🇧🇷' },
  { code: '+673', name: 'Brunei',                        flag: '🇧🇳' },
  { code: '+359', name: 'Bulgaria',                      flag: '🇧🇬' },
  { code: '+226', name: 'Burkina Faso',                  flag: '🇧🇫' },
  { code: '+257', name: 'Burundi',                       flag: '🇧🇮' },
  { code: '+238', name: 'Cape Verde',                    flag: '🇨🇻' },
  { code: '+855', name: 'Cambodia',                      flag: '🇰🇭' },
  { code: '+237', name: 'Cameroon',                      flag: '🇨🇲' },
  { code: '+1',   name: 'Canada',                        flag: '🇨🇦' },
  { code: '+236', name: 'Central African Republic',      flag: '🇨🇫' },
  { code: '+235', name: 'Chad',                          flag: '🇹🇩' },
  { code: '+56',  name: 'Chile',                         flag: '🇨🇱' },
  { code: '+86',  name: 'China',                         flag: '🇨🇳' },
  { code: '+57',  name: 'Colombia',                      flag: '🇨🇴' },
  { code: '+269', name: 'Comoros',                       flag: '🇰🇲' },
  { code: '+242', name: 'Congo',                         flag: '🇨🇬' },
  { code: '+243', name: 'Congo (DRC)',                   flag: '🇨🇩' },
  { code: '+506', name: 'Costa Rica',                    flag: '🇨🇷' },
  { code: '+385', name: 'Croatia',                       flag: '🇭🇷' },
  { code: '+53',  name: 'Cuba',                          flag: '🇨🇺' },
  { code: '+357', name: 'Cyprus',                        flag: '🇨🇾' },
  { code: '+420', name: 'Czech Republic',                flag: '🇨🇿' },
  { code: '+45',  name: 'Denmark',                       flag: '🇩🇰' },
  { code: '+253', name: 'Djibouti',                      flag: '🇩🇯' },
  { code: '+1',   name: 'Dominica',                      flag: '🇩🇲' },
  { code: '+1',   name: 'Dominican Republic',            flag: '🇩🇴' },
  { code: '+670', name: 'East Timor',                    flag: '🇹🇱' },
  { code: '+593', name: 'Ecuador',                       flag: '🇪🇨' },
  { code: '+20',  name: 'Egypt',                         flag: '🇪🇬' },
  { code: '+503', name: 'El Salvador',                   flag: '🇸🇻' },
  { code: '+240', name: 'Equatorial Guinea',             flag: '🇬🇶' },
  { code: '+291', name: 'Eritrea',                       flag: '🇪🇷' },
  { code: '+372', name: 'Estonia',                       flag: '🇪🇪' },
  { code: '+268', name: 'Eswatini',                      flag: '🇸🇿' },
  { code: '+251', name: 'Ethiopia',                      flag: '🇪🇹' },
  { code: '+679', name: 'Fiji',                          flag: '🇫🇯' },
  { code: '+358', name: 'Finland',                       flag: '🇫🇮' },
  { code: '+33',  name: 'France',                        flag: '🇫🇷' },
  { code: '+241', name: 'Gabon',                         flag: '🇬🇦' },
  { code: '+220', name: 'Gambia',                        flag: '🇬🇲' },
  { code: '+995', name: 'Georgia',                       flag: '🇬🇪' },
  { code: '+49',  name: 'Germany',                       flag: '🇩🇪' },
  { code: '+233', name: 'Ghana',                         flag: '🇬🇭' },
  { code: '+30',  name: 'Greece',                        flag: '🇬🇷' },
  { code: '+1',   name: 'Grenada',                       flag: '🇬🇩' },
  { code: '+502', name: 'Guatemala',                     flag: '🇬🇹' },
  { code: '+224', name: 'Guinea',                        flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau',                 flag: '🇬🇼' },
  { code: '+592', name: 'Guyana',                        flag: '🇬🇾' },
  { code: '+509', name: 'Haiti',                         flag: '🇭🇹' },
  { code: '+504', name: 'Honduras',                      flag: '🇭🇳' },
  { code: '+36',  name: 'Hungary',                       flag: '🇭🇺' },
  { code: '+354', name: 'Iceland',                       flag: '🇮🇸' },
  { code: '+91',  name: 'India',                         flag: '🇮🇳' },
  { code: '+62',  name: 'Indonesia',                     flag: '🇮🇩' },
  { code: '+98',  name: 'Iran',                          flag: '🇮🇷' },
  { code: '+964', name: 'Iraq',                          flag: '🇮🇶' },
  { code: '+353', name: 'Ireland',                       flag: '🇮🇪' },
  { code: '+972', name: 'Israel',                        flag: '🇮🇱' },
  { code: '+39',  name: 'Italy',                         flag: '🇮🇹' },
  { code: '+1',   name: 'Jamaica',                       flag: '🇯🇲' },
  { code: '+81',  name: 'Japan',                         flag: '🇯🇵' },
  { code: '+962', name: 'Jordan',                        flag: '🇯🇴' },
  { code: '+7',   name: 'Kazakhstan',                    flag: '🇰🇿' },
  { code: '+254', name: 'Kenya',                         flag: '🇰🇪' },
  { code: '+686', name: 'Kiribati',                      flag: '🇰🇮' },
  { code: '+850', name: 'North Korea',                   flag: '🇰🇵' },
  { code: '+82',  name: 'South Korea',                   flag: '🇰🇷' },
  { code: '+383', name: 'Kosovo',                        flag: '🇽🇰' },
  { code: '+965', name: 'Kuwait',                        flag: '🇰🇼' },
  { code: '+996', name: 'Kyrgyzstan',                    flag: '🇰🇬' },
  { code: '+856', name: 'Laos',                          flag: '🇱🇦' },
  { code: '+371', name: 'Latvia',                        flag: '🇱🇻' },
  { code: '+961', name: 'Lebanon',                       flag: '🇱🇧' },
  { code: '+266', name: 'Lesotho',                       flag: '🇱🇸' },
  { code: '+231', name: 'Liberia',                       flag: '🇱🇷' },
  { code: '+218', name: 'Libya',                         flag: '🇱🇾' },
  { code: '+423', name: 'Liechtenstein',                 flag: '🇱🇮' },
  { code: '+370', name: 'Lithuania',                     flag: '🇱🇹' },
  { code: '+352', name: 'Luxembourg',                    flag: '🇱🇺' },
  { code: '+261', name: 'Madagascar',                    flag: '🇲🇬' },
  { code: '+265', name: 'Malawi',                        flag: '🇲🇼' },
  { code: '+60',  name: 'Malaysia',                      flag: '🇲🇾' },
  { code: '+960', name: 'Maldives',                      flag: '🇲🇻' },
  { code: '+223', name: 'Mali',                          flag: '🇲🇱' },
  { code: '+356', name: 'Malta',                         flag: '🇲🇹' },
  { code: '+692', name: 'Marshall Islands',              flag: '🇲🇭' },
  { code: '+222', name: 'Mauritania',                    flag: '🇲🇷' },
  { code: '+230', name: 'Mauritius',                     flag: '🇲🇺' },
  { code: '+52',  name: 'Mexico',                        flag: '🇲🇽' },
  { code: '+691', name: 'Micronesia',                    flag: '🇫🇲' },
  { code: '+373', name: 'Moldova',                       flag: '🇲🇩' },
  { code: '+377', name: 'Monaco',                        flag: '🇲🇨' },
  { code: '+976', name: 'Mongolia',                      flag: '🇲🇳' },
  { code: '+382', name: 'Montenegro',                    flag: '🇲🇪' },
  { code: '+212', name: 'Morocco',                       flag: '🇲🇦' },
  { code: '+258', name: 'Mozambique',                    flag: '🇲🇿' },
  { code: '+95',  name: 'Myanmar',                       flag: '🇲🇲' },
  { code: '+264', name: 'Namibia',                       flag: '🇳🇦' },
  { code: '+674', name: 'Nauru',                         flag: '🇳🇷' },
  { code: '+977', name: 'Nepal',                         flag: '🇳🇵' },
  { code: '+31',  name: 'Netherlands',                   flag: '🇳🇱' },
  { code: '+64',  name: 'New Zealand',                   flag: '🇳🇿' },
  { code: '+505', name: 'Nicaragua',                     flag: '🇳🇮' },
  { code: '+227', name: 'Niger',                         flag: '🇳🇪' },
  { code: '+234', name: 'Nigeria',                       flag: '🇳🇬' },
  { code: '+389', name: 'North Macedonia',               flag: '🇲🇰' },
  { code: '+47',  name: 'Norway',                        flag: '🇳🇴' },
  { code: '+968', name: 'Oman',                          flag: '🇴🇲' },
  { code: '+92',  name: 'Pakistan',                      flag: '🇵🇰' },
  { code: '+680', name: 'Palau',                         flag: '🇵🇼' },
  { code: '+970', name: 'Palestine',                     flag: '🇵🇸' },
  { code: '+507', name: 'Panama',                        flag: '🇵🇦' },
  { code: '+675', name: 'Papua New Guinea',              flag: '🇵🇬' },
  { code: '+595', name: 'Paraguay',                      flag: '🇵🇾' },
  { code: '+51',  name: 'Peru',                          flag: '🇵🇪' },
  { code: '+63',  name: 'Philippines',                   flag: '🇵🇭' },
  { code: '+48',  name: 'Poland',                        flag: '🇵🇱' },
  { code: '+351', name: 'Portugal',                      flag: '🇵🇹' },
  { code: '+974', name: 'Qatar',                         flag: '🇶🇦' },
  { code: '+40',  name: 'Romania',                       flag: '🇷🇴' },
  { code: '+7',   name: 'Russia',                        flag: '🇷🇺' },
  { code: '+250', name: 'Rwanda',                        flag: '🇷🇼' },
  { code: '+1',   name: 'Saint Kitts and Nevis',         flag: '🇰🇳' },
  { code: '+1',   name: 'Saint Lucia',                   flag: '🇱🇨' },
  { code: '+1',   name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', name: 'Samoa',                         flag: '🇼🇸' },
  { code: '+378', name: 'San Marino',                    flag: '🇸🇲' },
  { code: '+239', name: 'São Tomé and Príncipe',         flag: '🇸🇹' },
  { code: '+966', name: 'Saudi Arabia',                  flag: '🇸🇦' },
  { code: '+221', name: 'Senegal',                       flag: '🇸🇳' },
  { code: '+381', name: 'Serbia',                        flag: '🇷🇸' },
  { code: '+248', name: 'Seychelles',                    flag: '🇸🇨' },
  { code: '+232', name: 'Sierra Leone',                  flag: '🇸🇱' },
  { code: '+65',  name: 'Singapore',                     flag: '🇸🇬' },
  { code: '+421', name: 'Slovakia',                      flag: '🇸🇰' },
  { code: '+386', name: 'Slovenia',                      flag: '🇸🇮' },
  { code: '+677', name: 'Solomon Islands',               flag: '🇸🇧' },
  { code: '+252', name: 'Somalia',                       flag: '🇸🇴' },
  { code: '+27',  name: 'South Africa',                  flag: '🇿🇦' },
  { code: '+211', name: 'South Sudan',                   flag: '🇸🇸' },
  { code: '+34',  name: 'Spain',                         flag: '🇪🇸' },
  { code: '+94',  name: 'Sri Lanka',                     flag: '🇱🇰' },
  { code: '+249', name: 'Sudan',                         flag: '🇸🇩' },
  { code: '+597', name: 'Suriname',                      flag: '🇸🇷' },
  { code: '+46',  name: 'Sweden',                        flag: '🇸🇪' },
  { code: '+41',  name: 'Switzerland',                   flag: '🇨🇭' },
  { code: '+963', name: 'Syria',                         flag: '🇸🇾' },
  { code: '+886', name: 'Taiwan',                        flag: '🇹🇼' },
  { code: '+992', name: 'Tajikistan',                    flag: '🇹🇯' },
  { code: '+255', name: 'Tanzania',                      flag: '🇹🇿' },
  { code: '+66',  name: 'Thailand',                      flag: '🇹🇭' },
  { code: '+228', name: 'Togo',                          flag: '🇹🇬' },
  { code: '+676', name: 'Tonga',                         flag: '🇹🇴' },
  { code: '+1',   name: 'Trinidad and Tobago',           flag: '🇹🇹' },
  { code: '+216', name: 'Tunisia',                       flag: '🇹🇳' },
  { code: '+90',  name: 'Turkey',                        flag: '🇹🇷' },
  { code: '+993', name: 'Turkmenistan',                  flag: '🇹🇲' },
  { code: '+688', name: 'Tuvalu',                        flag: '🇹🇻' },
  { code: '+256', name: 'Uganda',                        flag: '🇺🇬' },
  { code: '+380', name: 'Ukraine',                       flag: '🇺🇦' },
  { code: '+971', name: 'United Arab Emirates',          flag: '🇦🇪' },
  { code: '+44',  name: 'United Kingdom',                flag: '🇬🇧' },
  { code: '+1',   name: 'United States',                 flag: '🇺🇸' },
  { code: '+598', name: 'Uruguay',                       flag: '🇺🇾' },
  { code: '+998', name: 'Uzbekistan',                    flag: '🇺🇿' },
  { code: '+678', name: 'Vanuatu',                       flag: '🇻🇺' },
  { code: '+58',  name: 'Venezuela',                     flag: '🇻🇪' },
  { code: '+84',  name: 'Vietnam',                       flag: '🇻🇳' },
  { code: '+967', name: 'Yemen',                         flag: '🇾🇪' },
  { code: '+260', name: 'Zambia',                        flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe',                      flag: '🇿🇼' },
];

interface FormValues {
  firstName:    string;
  lastName:     string;
  email:        string;
  whatsappCode: string;
  whatsapp:     string;
  company:      string;
  role:         string;
  website:      string;
  inquirerType: string;
  topic:        string;
  message:      string;
}

const BLANK: FormValues = {
  firstName: '', lastName: '', email: '',
  whatsappCode: '+60', whatsapp: '',  // default: Malaysia
  company: '', role: '', website: '',
  inquirerType: 'Individual',
  topic: 'Executive coaching', message: '',
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
          Get in touch
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
          } as React.CSSProperties}>
          A Place To Begin
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
          For founders and leaders seeking thoughtful, high-calibre support, this is the first step. Share a few details about your current priorities, challenges, or season of leadership, and I'll be in touch to explore whether there's a strong fit.
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
  const [ccOpen, setCcOpen]       = useState(false);
  const [ccSearch, setCcSearch]   = useState('');
  const ccRef                     = useRef<HTMLDivElement>(null);

  const filteredCodes = useMemo(() => {
    const q = ccSearch.toLowerCase();
    return q
      ? COUNTRY_CODES.filter(c => c.name.toLowerCase().includes(q) || c.code.includes(q))
      : COUNTRY_CODES;
  }, [ccSearch]);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === form.whatsappCode) ?? COUNTRY_CODES[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!ccOpen) return;
    function handleClick(e: MouseEvent) {
      if (ccRef.current && !ccRef.current.contains(e.target as Node)) {
        setCcOpen(false);
        setCcSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ccOpen]);

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
    const subject = encodeURIComponent(`Inquiry — ${form.topic}`);
    const body    = encodeURIComponent(
      `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}${form.whatsapp ? `\nWhatsApp: ${form.whatsappCode} ${form.whatsapp}` : ''}${form.company ? `\nCompany: ${form.company}` : ''}${form.role ? `\nRole: ${form.role}` : ''}${form.website ? `\nWebsite/LinkedIn: ${form.website}` : ''}\nI want to inquire as: ${form.inquirerType}\nInquiry: ${form.topic}\n\n${form.message}`,
    );
    window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
  }

  const canSubmit = !!(form.firstName.trim() && form.email.trim());

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
            maxWidth: '16ch',
            marginBottom: 'clamp(32px, 5vw, 56px)',
          } as React.CSSProperties}>
            {submitMode === 'call' ? "Opening Your Calendar" : "We'll Be In Touch"}
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

        .book-phone-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 0;
        }
        .book-phone-row .book-input {
          border-radius: 0;
        }
        .cc-trigger {
          width: 100%; box-sizing: border-box;
          background: #fff; border: 1px solid ${C.borderLight}; border-right: none;
          padding: 14px 12px; font-family: var(--font-sans); font-size: 15px;
          color: ${C.textOnLight}; outline: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
          transition: border-color 250ms ${EASE_LUXE};
          white-space: nowrap; overflow: hidden;
        }
        .cc-trigger:focus { border-color: ${C.dark900}; }
        .cc-dropdown {
          position: absolute; top: 100%; left: 0; z-index: 999;
          width: 280px; background: #fff;
          border: 1px solid ${C.borderLight};
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          max-height: 300px; display: flex; flex-direction: column;
        }
        .cc-search {
          padding: 10px 12px; border: none; border-bottom: 1px solid ${C.borderLight};
          font-family: var(--font-sans); font-size: 14px; color: ${C.textOnLight};
          outline: none; width: 100%; box-sizing: border-box;
        }
        .cc-list {
          overflow-y: auto; flex: 1;
        }
        .cc-option {
          padding: 10px 14px; cursor: pointer; font-family: var(--font-sans);
          font-size: 14px; color: ${C.textOnLight};
          display: flex; align-items: center; gap: 8px;
          transition: background 150ms;
        }
        .cc-option:hover { background: ${C.muted}; }
        .cc-option.selected { background: ${C.green}; }

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
          marginBottom: 'clamp(40px, 6vw, 64px)',
        } as React.CSSProperties}>
          Get Connected
        </h2>

        <form noValidate>

          {/* Name */}
          <div
            className="book-name-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="book-first" className="book-label">First Name</label>
              <input
                id="book-first" type="text" className="book-input"
                placeholder="First" value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                autoComplete="given-name" required
              />
            </div>
            <div>
              <label htmlFor="book-last" className="book-label">Last Name</label>
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

          {/* WhatsApp */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="book-whatsapp" className="book-label">WhatsApp</label>
            <div className="book-phone-row">
              <div ref={ccRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="cc-trigger"
                  onClick={() => { setCcOpen(o => !o); setCcSearch(''); }}
                  aria-haspopup="listbox"
                  aria-expanded={ccOpen}>
                  <span>{selectedCountry?.flag} {form.whatsappCode}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M1 1l4 4 4-4" stroke="#4A4A42" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {ccOpen && (
                  <div className="cc-dropdown" role="listbox">
                    <input
                      className="cc-search"
                      type="text"
                      placeholder="Search country…"
                      value={ccSearch}
                      onChange={e => setCcSearch(e.target.value)}
                      autoFocus
                    />
                    <ul className="cc-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {filteredCodes.map((c, i) => (
                        <li
                          key={`${c.code}-${c.name}-${i}`}
                          className={`cc-option${form.whatsappCode === c.code && selectedCountry?.name === c.name ? ' selected' : ''}`}
                          role="option"
                          aria-selected={form.whatsappCode === c.code && selectedCountry?.name === c.name}
                          onMouseDown={() => {
                            set('whatsappCode', c.code);
                            setCcOpen(false);
                            setCcSearch('');
                          }}>
                          <span>{c.flag}</span>
                          <span style={{ flex: 1 }}>{c.name}</span>
                          <span style={{ color: 'rgba(26,26,26,0.45)', fontSize: '13px' }}>{c.code}</span>
                        </li>
                      ))}
                      {filteredCodes.length === 0 && (
                        <li style={{ padding: '12px 14px', color: 'rgba(26,26,26,0.45)', fontSize: '14px' }}>No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <input
                id="book-whatsapp" type="tel" className="book-input"
                placeholder="Phone number" value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Company */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="book-company" className="book-label">Company / Organisation</label>
            <input
              id="book-company" type="text" className="book-input"
              placeholder="Your company or organisation" value={form.company}
              onChange={e => set('company', e.target.value)}
              autoComplete="organization"
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="book-role" className="book-label">Role / Title</label>
            <input
              id="book-role" type="text" className="book-input"
              placeholder="Your role or title" value={form.role}
              onChange={e => set('role', e.target.value)}
              autoComplete="organization-title"
            />
          </div>

          {/* Website / LinkedIn */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="book-website" className="book-label">Website / LinkedIn</label>
            <input
              id="book-website" type="url" className="book-input"
              placeholder="https://" value={form.website}
              onChange={e => set('website', e.target.value)}
              autoComplete="url"
            />
          </div>

          {/* I am a */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="book-inquirer-type" className="book-label">I want to inquire as</label>
            <select
              id="book-inquirer-type" className="book-select"
              value={form.inquirerType} onChange={e => set('inquirerType', e.target.value)}>
              {INQUIRER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Inquiry type */}
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="book-topic" className="book-label">Inquiry</label>
            <select
              id="book-topic" className="book-select"
              value={form.topic} onChange={e => set('topic', e.target.value)}>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 'clamp(40px, 6vw, 56px)' }}>
            <label htmlFor="book-message" className="book-label">Message</label>
            <textarea
              id="book-message" className="book-input"
              placeholder="Tell us a little about what you're looking for…"
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
                <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '11px' }}>20 mins</span>
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
                Fill in your first name and email to continue.
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
