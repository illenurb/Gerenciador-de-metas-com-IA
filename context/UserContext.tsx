import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import * as api from '../services/apiService';
import type { User } from '../types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
        const userData = await api.getUser();
        setUser(userData);
    } catch (error) {
        console.error("Failed to fetch user", error);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
        await fetchUser();
        setLoading(false);
    };
    initialize();
  }, [fetchUser]);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
