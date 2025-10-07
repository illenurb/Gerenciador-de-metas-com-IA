import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import * as api from '../services/apiService';
import type { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (token) {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Token might be invalid, so log out
            logout();
        }
    }
  }, [token]);

  useEffect(() => {
    const initializeAuth = async () => {
        if (token) {
            await fetchUser();
        }
        setLoading(false);
    };
    initializeAuth();
  }, [token, fetchUser]);

  const handleAuth = async (token: string) => {
    setToken(token);
    localStorage.setItem('authToken', token);
    await fetchUser();
  };

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    setToken(access_token);
    localStorage.setItem('authToken', access_token);
    const userData = await api.getCurrentUser();
    setUser(userData);
  };

  const register = async (email: string, password: string) => {
    await api.register(email, password);
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
