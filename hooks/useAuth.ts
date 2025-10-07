
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// This is a convenience hook. The main implementation is in AuthContext.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
