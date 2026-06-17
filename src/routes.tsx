import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import ProdNotFoundPage from './pages/_404';
import ProtectedRoute from './components/ProtectedRoute';

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : ProdNotFoundPage;

const BookPage              = lazy(() => import('./pages/book'));
const InquiryPage           = lazy(() => import('./pages/inquiry'));
const CoachesPreviewPage    = lazy(() => import('./pages/coaches-preview'));
const AboutPage          = lazy(() => import('./pages/about'));
const LoginPage          = lazy(() => import('./pages/login'));
const RegisterPage       = lazy(() => import('./pages/register'));
const ForgotPasswordPage = lazy(() => import('./pages/forgot-password'));
const ResetPasswordPage  = lazy(() => import('./pages/reset-password'));
const CoachesPage        = lazy(() => import('./pages/coaches/index'));
const CoachProfilePage   = lazy(() => import('./pages/coaches/[id]'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/book',
    element: <BookPage />,
  },
  {
    path: '/inquiry',
    element: <InquiryPage />,
  },
  {
    path: '/coaches-preview',
    element: <CoachesPreviewPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/coaches',
    element: (
      <ProtectedRoute>
        <CoachesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coaches/:id',
    element: (
      <ProtectedRoute>
        <CoachProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export type Path = '/' | '/book' | '/inquiry' | '/coaches-preview' | '/about' | '/login' | '/register' | '/forgot-password' | '/reset-password' | '/coaches' | '/coaches/:id';
export type Params = Record<string, string | undefined>;
