import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        if (isMounted) {
          setToken('');
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const { data } = await authApi.getMe();
        const currentUser = data.user || data;

        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);

        if (isMounted) {
          setToken('');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken('');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const payload = typeof email === 'object' ? email : { email, password };
    const { data } = await authApi.login(payload);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authApi.getMe();
    const currentUser = data.user || data;

    setUser(currentUser);
    return currentUser;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      loadCurrentUser: refreshUser,
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
