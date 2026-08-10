import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthResponse, EffectiveAccessResponse, LoginWebRequest, RegisterWebRequest } from '../types';
import { USER_KEY } from '../constants';
import { authService } from '../services/authService';
import { usuarioService } from '../services/usuarioService';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { clearSession, tryRefreshToken } from '../utils/httpClient';
import { getAccessToken, setAccessToken } from '../utils/session';
import { createRestrictedAccess } from '../auth/authorization';


interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  access: EffectiveAccessResponse | null;
  isAccessLoading: boolean;
  login: (data: LoginWebRequest) => Promise<AuthResponse>;
  register: (data: RegisterWebRequest) => Promise<AuthResponse>;
  logout: () => Promise<void> | void;
  updateUser: (data: Partial<AuthResponse>) => void;
  refreshPlan: () => Promise<void>;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [access, setAccess] = useState<EffectiveAccessResponse | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) {
        if (active) {
          setIsLoading(false);
          setIsAccessLoading(false);
        }
        return;
      }
      try {
        const restoredToken = await tryRefreshToken();
        if (active && restoredToken) {
          const restoredUser = JSON.parse(stored) as AuthResponse;
          setUser(restoredUser);
          try {
            setAccess(await usuarioService.miAcceso());
          } catch {
            setAccess(createRestrictedAccess(restoredUser));
          }
        } else if (!restoredToken) clearSession();
      } catch {
        clearSession();
        if (active) setAccess(null);
      } finally {
        if (active) {
          setIsLoading(false);
          setIsAccessLoading(false);
        }
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setAccess(null);
      setIsAccessLoading(false);
    };
    window.addEventListener('bioguard:unauthorized', handler);
    return () => window.removeEventListener('bioguard:unauthorized', handler);
  }, []);

  const login = useCallback(async (data: LoginWebRequest): Promise<AuthResponse> => {
    const response = await authService.login(data);
    if (!response.requires2FA) {
      setAccessToken(response.token);
      const safeUser = { ...response, token: '', refreshToken: undefined };
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      setIsAccessLoading(true);
      try {
        setAccess(await usuarioService.miAcceso());
      } catch {
        setAccess(createRestrictedAccess(safeUser));
      } finally {
        setIsAccessLoading(false);
      }
    }
    return response;
  }, []);

  const register = useCallback(async (data: RegisterWebRequest): Promise<AuthResponse> => {
    const response = await authService.register(data);
    if (response.token && response.token !== 'pending_verification' && !response.requiresVerification) {
      setAccessToken(response.token);
      const safeUser = { ...response, token: '', refreshToken: undefined };
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      setIsAccessLoading(true);
      try {
        setAccess(await usuarioService.miAcceso());
      } catch {
        setAccess(createRestrictedAccess(safeUser));
      } finally {
        setIsAccessLoading(false);
      }
    }
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Error al cerrar sesión en el servidor:', err);
    } finally {
      clearSession();
      setUser(null);
      setAccess(null);
      setIsAccessLoading(false);
    }
  }, []);

  const updateUser = useCallback((data: Partial<AuthResponse>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshPlan = useCallback(async () => {

    if (!getAccessToken()) return;
    try {
      const plan = await usuarioService.miPlan();
      updateUser({ plan: plan.nombre });
      setAccess(await usuarioService.miAcceso());
    } catch {
      // token inválido o sin sesión: ignorar silenciosamente
    }
  }, [updateUser]);

  // Nivel de seguridad bancario: auto-logout tras 15 minutos sin interacción
  useInactivityTimeout(!!user, logout);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        access,
        isAccessLoading,
        login,
        register,
        logout,
        updateUser,
        refreshPlan,
        photoUrl,
        setPhotoUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
