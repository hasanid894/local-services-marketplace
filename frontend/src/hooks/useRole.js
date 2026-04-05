import { useAuth } from '../context/AuthContext';

/**
 * Normalized role for UI: 'customer' | 'provider' | 'admin' | null (guest).
 */
export function useRole() {
  const { user } = useAuth();
  const raw = user?.role;
  if (!raw) return { role: null, isCustomer: false, isProvider: false, isAdmin: false };
  const r = String(raw).toLowerCase();
  return {
    role: r,
    isCustomer: r === 'customer',
    isProvider: r === 'provider',
    isAdmin: r === 'admin',
  };
}
