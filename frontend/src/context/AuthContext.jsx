import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, googleAuth, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vitamind_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('vitamind_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setToken(storedToken);
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      logoutUser();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      setToken(data.access_token);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      setUser(data.user);
      setToken(data.access_token);
      addToast(`Account created successfully! Welcome to VitaMind AI.`, 'success');
      return data;
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
      throw error;
    }
  };

  const handleGoogleLogin = async (googleData) => {
    try {
      const data = await googleAuth(googleData);
      setUser(data.user);
      setToken(data.access_token);
      addToast(`Signed in with Google as ${data.user.name}`, 'success');
      return data;
    } catch (error) {
      addToast(error.message || 'Google sign-in failed', 'error');
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    addToast('You have been logged out securely.', 'info');
  };

  const refreshProfile = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        handleGoogleLogin,
        logout,
        refreshProfile,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
