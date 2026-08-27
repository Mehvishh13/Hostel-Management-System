// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api, { getToken, setToken as persistToken } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(getToken());

  // The api client attaches the bearer token itself, so this only has to
  // keep the stored token and the in-memory user in sync.
  const logout = useCallback(() => {
    persistToken(null);
    localStorage.removeItem('user');
    setTokenState(null);
    setUser(null);
  }, []);

  const storeSession = useCallback((data) => {
    persistToken(data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setTokenState(data.token);
    setUser(data);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (!cancelled) setUser(res.data);
      } catch (error) {
        console.error('Error loading user:', error);
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      storeSession(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      storeSession(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'warden',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
