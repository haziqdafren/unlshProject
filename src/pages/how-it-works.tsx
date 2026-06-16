import { Helmet } from '@dr.pogodin/react-helmet';

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>How It Works — Unlsh Executive Coaching</title>
        <meta name="description" content="Discover the Unlsh coaching process — from your first discovery call through one-on-one sessions, expert access, and the inner transformation work that sets us apart." />
        <link rel="canonical" href="https://unlsh.com/how-it-works" />
        <meta property="og:title" content="How It Works — Unlsh Executive Coaching" />
        <meta property="og:description" content="Discover the Unlsh coaching process — world-class guidance, expert access, and inner transformation work for high achievers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://unlsh.com/how-it-works" />
        <meta property="og:image" content="https://unlsh.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works — Unlsh Executive Coaching" />
        <meta name="twitter:description" content="Discover the Unlsh coaching process — world-class guidance, expert access, and inner transformation." />
        <meta name="twitter:image" content="https://unlsh.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'How It Works — Unlsh',
          url: 'https://unlsh.com/how-it-works',
          description: 'The Unlsh coaching process: discovery call, one-on-one sessions, expert access, and inner transformation work.',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Unlsh',
            url: 'https://unlsh.com',
          },
        })}</script>
      </Helmet>
      <main
        style={{
          minHeight: '80vh',
          backgroundColor: '#F5F5F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'rgba(26,26,26,0.4)',
          }}
        >
          How it works — coming soon
        </p>
      </main>
    </>
  );
}
