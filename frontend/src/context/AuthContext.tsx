import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { trackEvent } from '../services/analytics';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    const authToken = res.access_token || res.token;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(res.user);
    trackEvent('page_view', window.location.pathname, null, { action: 'login', user_id: res.user.id });
    return res.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.register({ name, email, password });
    const authToken = res.access_token || res.token;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(res.user);
    trackEvent('page_view', window.location.pathname, null, { action: 'register', user_id: res.user.id });
    return res.user;
  };

  const logout = () => {
    trackEvent('logout', window.location.pathname, null, { user_id: user?.id });
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (name: string) => {
    const updated = await api.updateProfile({ name });
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
