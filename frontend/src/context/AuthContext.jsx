import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('unistay_token');
    const savedAdmin = localStorage.getItem('unistay_admin');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (_) {
        localStorage.removeItem('unistay_token');
        localStorage.removeItem('unistay_admin');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('unistay_token', token);
    localStorage.setItem('unistay_admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('unistay_token');
    localStorage.removeItem('unistay_admin');
    setAdmin(null);
  };

  const isAuthenticated = Boolean(admin);

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
