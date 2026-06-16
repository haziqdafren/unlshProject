/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Usage in routes.tsx:
 *   element: <ProtectedRoute><CoachesPage /></ProtectedRoute>
 *
 * Preserves the attempted URL so login can redirect back after success.
 * Shows nothing (null) while auth is still rehydrating from localStorage
 * to prevent a flash of the login page for already-authenticated users.
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for localStorage rehydration before deciding
  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
