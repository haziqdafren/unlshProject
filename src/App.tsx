import { lazy, Suspense } from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';

import AiroErrorBoundary from '../dev-tools/src/AiroErrorBoundary';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/Toast';
import { routes } from './routes';

const CookieBanner = lazy(() =>
  import('@/components/CookieBanner').catch((error) => {
    console.warn('Failed to load CookieBanner:', error);
    return { default: () => null };
  })
);

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

const rootElement = (
  <Suspense fallback={<SpinnerFallback />}>
    <RootLayout>
      <Outlet />
    </RootLayout>
  </Suspense>
);

// Wrap the agent-editable flat `routes` array in a layout route so ScrollRestoration
// + shared chrome live once above every page. Keeping the wrap here (instead of
// in routes.tsx) preserves the agent's simple flat-route contract. The dev
// boundary must live inside the route element so React Router doesn't replace it
// with its default route error UI before our boundary can catch render errors.
//
// `captureGlobalErrors={false}`: the ROOT boundary in main.tsx owns the global
// window.onerror/unhandledrejection handlers. This inner boundary only catches
// route render errors via componentDidCatch — installing window handlers here
// too would double-forward async errors and stack a second overlay.
const ProdErrorFallback = () => (
  <div style={{ minHeight: '100dvh', backgroundColor: '#1A1A1A', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(80px,12vw,160px) clamp(24px,5vw,80px)' }}>
    <p style={{ fontFamily: "'Trebuchet MS',sans-serif", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'rgba(245,245,240,0.45)', marginBottom: '20px' }}>
      Something went wrong
    </p>
    <h1 style={{ fontFamily: "'Trebuchet MS',sans-serif", fontSize: 'clamp(36px,6vw,60px)', fontWeight: 400, color: '#F5F5F0', textTransform: 'lowercase' as const, marginBottom: '24px', lineHeight: 1.06 }}>
      page failed to load
    </h1>
    <p style={{ fontFamily: "'Trebuchet MS',sans-serif", fontSize: '16px', color: 'rgba(245,245,240,0.55)', lineHeight: 1.75, maxWidth: '44ch', marginBottom: '40px' }}>
      This can happen after a recent update. Refreshing the page usually fixes it.
    </p>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' as const }}>
      <button
        onClick={() => window.location.reload()}
        style={{ background: '#D9CFBB', color: '#1A1A1A', fontFamily: "'Trebuchet MS',sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.13em', padding: '14px 36px', border: 'none', borderRadius: '2px', cursor: 'pointer', lineHeight: 1 }}>
        Refresh page
      </button>
      <button
        onClick={() => { window.location.href = '/'; }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Trebuchet MS',sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.13em', color: 'rgba(245,245,240,0.45)', padding: '14px 0', lineHeight: 1 }}>
        Go home
      </button>
    </div>
  </div>
);

const routeTree: RouteObject[] = [
  {
    element:
      import.meta.env.MODE === 'development' ? (
        <AiroErrorBoundary captureGlobalErrors={false}>{rootElement}</AiroErrorBoundary>
      ) : (
        rootElement
      ),
    errorElement: import.meta.env.MODE !== 'development' ? <ProdErrorFallback /> : undefined,
    children: routes,
  },
];

const router = createBrowserRouter(routeTree);

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
        {/*
          CookieBanner reads document.cookie and subscribes to browser events.
          App.tsx is client-only (entry-server.tsx renders the route tree
          directly without importing App), so no SSR gate is needed here.
        */}
        <CookieBannerErrorBoundary>
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
        </CookieBannerErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
