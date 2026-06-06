import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!tokenStore.access) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setTenant(data.tenant);
    } catch {
      tokenStore.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data);
    setUser(data.user);
    setTenant(data.tenant);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    tokenStore.set(data);
    setUser(data.user);
    setTenant(data.tenant);
    return data;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback(
    (...roles) => !!user && (user.role === 'super_admin' || roles.includes(user.role)),
    [user]
  );

  // --- Impersonation (Super Admin "enter NGO workspace") -------------------
  // The super admin's own tokens are stashed, the impersonation tokens become
  // active, and we hard-reload so AuthProvider re-initialises as the NGO admin.
  const enterImpersonation = useCallback(({ accessToken, refreshToken, ngo }) => {
    localStorage.setItem('ih_super_access', tokenStore.access || '');
    localStorage.setItem('ih_super_refresh', tokenStore.refresh || '');
    localStorage.setItem('ih_imp_ngo', ngo?.name || 'NGO');
    tokenStore.set({ accessToken, refreshToken });
    window.location.href = '/dashboard';
  }, []);

  const exitImpersonation = useCallback(() => {
    const accessToken = localStorage.getItem('ih_super_access');
    const refreshToken = localStorage.getItem('ih_super_refresh');
    localStorage.removeItem('ih_super_access');
    localStorage.removeItem('ih_super_refresh');
    localStorage.removeItem('ih_imp_ngo');
    if (accessToken) tokenStore.set({ accessToken, refreshToken });
    window.location.href = '/superadmin/dashboard';
  }, []);

  const impersonatingNgo = typeof window !== 'undefined' ? localStorage.getItem('ih_imp_ngo') : null;
  const isImpersonating = !!impersonatingNgo;

  return (
    <AuthContext.Provider
      value={{
        user, tenant, loading, login, register, logout, hasRole, refresh: loadMe,
        isImpersonating, impersonatingNgo, enterImpersonation, exitImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
