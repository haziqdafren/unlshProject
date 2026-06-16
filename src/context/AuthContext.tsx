/**
 * AuthContext — role-based auth backed by Supabase.
 *
 * Roles:
 *   admin — can add/edit/delete/reorder coaches
 *   user  — read-only access to coaches directory
 *
 * Remember me:
 *   checked  → Supabase persists session to localStorage (default)
 *   unchecked → after login, registers a beforeunload listener that signs
 *               the user out when the tab closes; flag stored in sessionStorage
 *
 * Rate limiting:
 *   5 failed attempts → 30s lockout, tracked in sessionStorage
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<{ error: string | null }>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  forgotPassword: (
    email: string,
  ) => Promise<{ error: string | null }>;
}

export type AuthContextValue = AuthState & AuthActions;

// ─── Rate limiting ────────────────────────────────────────────────────────────

const ATTEMPTS_KEY  = 'unlsh_attempts';
const LOCKOUT_KEY   = 'unlsh_lockout';
const NO_PERSIST_KEY = 'unlsh_no_persist';
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 30_000;

function getAttempts(): number {
  return parseInt(sessionStorage.getItem(ATTEMPTS_KEY) ?? '0', 10);
}

function incrementAttempts(): number {
  const next = getAttempts() + 1;
  sessionStorage.setItem(ATTEMPTS_KEY, String(next));
  if (next >= MAX_ATTEMPTS) {
    sessionStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
  }
  return next;
}

function resetAttempts(): void {
  sessionStorage.removeItem(ATTEMPTS_KEY);
  sessionStorage.removeItem(LOCKOUT_KEY);
}

function getLockoutRemaining(): number {
  const until = parseInt(sessionStorage.getItem(LOCKOUT_KEY) ?? '0', 10);
  const remaining = until - Date.now();
  if (remaining <= 0) {
    resetAttempts();
    return 0;
  }
  return remaining;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive AuthUser from a Supabase session user
  function toAuthUser(supabaseUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
    if (!supabaseUser?.email) return null;
    const role = (supabaseUser.user_metadata?.role as UserRole | undefined) ?? 'user';
    return { email: supabaseUser.email, role };
  }

  // Rehydrate session on mount + subscribe to auth state changes
  useEffect(() => {
    // Get current session (handles page refresh / existing token)
    supabase.auth.getSession().then(({ data }) => {
      setUser(toAuthUser(data.session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register beforeunload sign-out when rememberMe is false
  useEffect(() => {
    const noPersist = sessionStorage.getItem(NO_PERSIST_KEY) === '1';
    if (!noPersist) return;

    const handleUnload = () => { void supabase.auth.signOut(); };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean,
    ): Promise<{ error: string | null }> => {
      // Check lockout first
      const lockoutMs = getLockoutRemaining();
      if (lockoutMs > 0) {
        const secs = Math.ceil(lockoutMs / 1000);
        return { error: `Too many attempts. Try again in ${secs}s.` };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        const attempts = incrementAttempts();
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining <= 0) {
          return { error: `Too many failed attempts. Locked out for ${LOCKOUT_MS / 1000}s.` };
        }
        const suffix = remaining === 1 ? '1 attempt remaining.' : `${remaining} attempts remaining.`;
        return { error: `${error?.message ?? 'Login failed.'} ${suffix}` };
      }

      resetAttempts();

      if (!rememberMe) {
        sessionStorage.setItem(NO_PERSIST_KEY, '1');
      } else {
        sessionStorage.removeItem(NO_PERSIST_KEY);
      }

      const role = (data.user.user_metadata?.role as UserRole | undefined) ?? 'user';
      setUser({ email: data.user.email!, role });
      return { error: null };
    },
    [],
  );

  const logout = useCallback(async () => {
    sessionStorage.removeItem(NO_PERSIST_KEY);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'user' } },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      logout,
      register,
      forgotPassword,
    }),
    [user, isLoading, login, logout, register, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
